// scripts/publish.mts
// Usage: node --env-file=.env scripts/publish.mts <slug> [--preview]
import matter from "gray-matter";
import { SignJWT } from "jose";
import { execSync } from "node:child_process";
import { access, readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

// ▼ HTML化に使うパイプライン
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

// ====== 引数解析 ======
const args = process.argv.slice(2);
const isPreview = args.includes("--preview");
const slug = args.find(a => !a.startsWith("--"));

if (!slug) {
  console.error("Usage: node --env-file=.env scripts/publish.mts <slug> [--preview]");
  process.exit(1);
}

// ====== 設定 ======
const API = isPreview 
  ? "https://tsuji1-blog-preview.yuzu777yuzu0.workers.dev"
  : (process.env.API ?? "http://localhost:8787");
const R2_BUCKET = isPreview ? "tsuji1-blog-images-preview" : "tsuji1-blog-images";
const JWT_ISSUER = isPreview ? "tsuji1-blog-preview" : (process.env.JWT_ISSUER ?? "tsuji1-blog");
const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  console.error("JWT_SECRET is missing");
  process.exit(1);
}

console.log(`Publishing "${slug}" to ${isPreview ? "PREVIEW" : "PRODUCTION"}...`);
console.log(`API: ${API}`);
console.log(`R2:  ${R2_BUCKET}`);

// ====== 1) MDX読み込み & frontmatter抽出 ======
const postPath = `content/posts/${slug}.mdx`;
const raw = await readFile(postPath, "utf8");
const { data: fm, content } = matter(raw);

// ====== 2) 画像をR2にアップロード ======
const imagesDir = `content/posts/${slug}`;
let uploadedImages: string[] = [];

try {
  await access(imagesDir);
  const files = await readdir(imagesDir);
  const imageFiles = files.filter(f => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f));
  
  for (const img of imageFiles) {
    const imgPath = resolve(imagesDir, img);
    const r2Key = `${slug}/${img}`;
    console.log(`Uploading image: ${img} -> ${R2_BUCKET}/${r2Key}`);
    try {
      execSync(`npx wrangler r2 object put ${R2_BUCKET}/${r2Key} --file "${imgPath}"`, {
        stdio: 'inherit'
      });
      uploadedImages.push(img);
    } catch (e) {
      console.error(`Failed to upload ${img}:`, e);
    }
  }
  
  if (uploadedImages.length > 0) {
    console.log(`✅ Uploaded ${uploadedImages.length} images to R2`);
  }
} catch {
  // 画像ディレクトリが存在しない場合はスキップ
}

// ====== 3) MDX(≒Markdown) → HTML 生成 ======
let processedContent = content;
// 画像パスを /images/slug/filename に変換
processedContent = processedContent.replace(
  /!\[([^\]]*)\]\(\.\/([^)]+)\)/g,
  (_, alt, filename) => `![${alt}](/images/${slug}/${filename})`
);

const file = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkFrontmatter, ["yaml"])
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, { behavior: "wrap" })
  .use(rehypeStringify, { allowDangerousHtml: true })
  .process(processedContent);
const html = String(file);

// ====== 4) meta を補完 (tags追加) ======
const meta = {
  title: (fm as any).title ?? slug.replace(/-/g, " "),
  date: (fm as any).date ?? new Date().toISOString().slice(0, 10),
  excerpt: (fm as any).excerpt ?? "",
  tags: (fm as any).tags ?? [],
};

// ====== 5) JWT 発行 ======
const token = await new SignJWT({ role: "editor" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuer(JWT_ISSUER)
  .setIssuedAt()
  .setExpirationTime("10m")
  .sign(new TextEncoder().encode(JWT_SECRET));

// ====== 6) API に HTML を投稿 ======
const res = await fetch(`${API}/api/posts`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ slug, html, meta }),
});

if (res.ok) {
  console.log(`✅ Published: ${slug}`);
  console.log(`   Title: ${meta.title}`);
  console.log(`   Tags:  ${meta.tags.join(", ") || "(none)"}`);
  console.log(`   URL:   ${API}/${slug}`);
} else {
  console.error(`❌ Failed: ${res.status}`, await res.text());
}
