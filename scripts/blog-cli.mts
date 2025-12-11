#!/usr/bin/env node
// scripts/blog-cli.mts
// Usage: node --env-file=.env scripts/blog-cli.mts <command> [options]
//
// Commands:
//   publish <slug> [--preview]     記事を投稿
//   delete <slug> [--preview]      記事を削除
//   list [--preview]               記事一覧を表示
//   update-tags <slug> [--preview] タグを更新（frontmatter から再読み込み）

import matter from "gray-matter";
import { SignJWT } from "jose";
import { execSync } from "node:child_process";
import { access, readFile, readdir, stat } from "node:fs/promises";
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

// ====== ヘルプ表示 ======
function showHelp() {
  console.log(`
📝 Blog CLI Tool

Usage: node --env-file=.env scripts/blog-cli.mts <command> [options]

Commands:
  publish <slug> [--preview]     記事を投稿（新規作成・更新）
  delete <slug> [--preview]      記事を削除
  list [--preview]               投稿済み記事の一覧を表示
  update-tags <slug> [--preview] タグのみ更新（MDXから再読み込み）

Options:
  --preview                      プレビュー環境を対象にする
  --help, -h                     このヘルプを表示

Examples:
  npm run blog publish my-article
  npm run blog delete old-post --preview
  npm run blog list
  npm run blog update-tags my-article

Article Structure:
  content/posts/my-article.mdx           # 単一ファイル
  content/posts/my-article/              # ディレクトリ形式
    ├── index.mdx                        # 記事本文
    ├── image1.png                       # 画像（自動アップロード）
    └── diagram.svg
`);
}

// ====== 引数解析 ======
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h") || args.length === 0) {
  showHelp();
  process.exit(0);
}

const command = args[0];
const isPreview = args.includes("--preview");
const positionalArgs = args.filter(a => !a.startsWith("--") && a !== command);

// ====== 環境設定 ======
const API = isPreview 
  ? "https://tsuji1-blog-preview.yuzu777yuzu0.workers.dev"
  : (process.env.API ?? "http://localhost:8787");
const R2_BUCKET = isPreview ? "tsuji1-blog-images-preview" : "tsuji1-blog-images";
const JWT_ISSUER = isPreview ? "tsuji1-blog-preview" : (process.env.JWT_ISSUER ?? "tsuji1-blog");
const JWT_SECRET = process.env.JWT_SECRET!;

const ENV_LABEL = isPreview ? "📦 PREVIEW" : "🚀 PRODUCTION";

// ====== JWT生成 ======
async function generateToken(): Promise<string> {
  if (!JWT_SECRET) {
    console.error("❌ JWT_SECRET is missing in .env");
    process.exit(1);
  }
  return new SignJWT({ role: "editor" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(new TextEncoder().encode(JWT_SECRET));
}

// ====== MDXファイルを探す ======
async function findMdxPath(slug: string): Promise<{ path: string; dir: string | null }> {
  // 1. content/posts/slug.mdx
  const filePath = `content/posts/${slug}.mdx`;
  try {
    await access(filePath);
    return { path: filePath, dir: `content/posts/${slug}` };
  } catch {}

  // 2. content/posts/slug/index.mdx
  const dirPath = `content/posts/${slug}/index.mdx`;
  try {
    await access(dirPath);
    return { path: dirPath, dir: `content/posts/${slug}` };
  } catch {}

  throw new Error(`記事が見つかりません: ${slug}\n  → content/posts/${slug}.mdx または content/posts/${slug}/index.mdx を作成してください`);
}

// ====== 画像アップロード ======
async function uploadImages(slug: string, imagesDir: string): Promise<string[]> {
  const uploaded: string[] = [];
  
  try {
    const dirStat = await stat(imagesDir);
    if (!dirStat.isDirectory()) return uploaded;
    
    const files = await readdir(imagesDir);
    const imageFiles = files.filter(f => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f));
    
    for (const img of imageFiles) {
      const imgPath = resolve(imagesDir, img);
      const r2Key = `${slug}/${img}`;
      console.log(`  📤 Uploading: ${img}`);
      try {
        execSync(`npx wrangler r2 object put ${R2_BUCKET}/${r2Key} --file "${imgPath}" --remote`, {
          stdio: 'pipe'
        });
        uploaded.push(img);
      } catch (e) {
        console.error(`  ⚠️  Failed to upload ${img}`);
      }
    }
  } catch {
    // ディレクトリが存在しない場合は無視
  }
  
  return uploaded;
}

// ====== MDX → HTML 変換 ======
async function convertMdxToHtml(content: string, slug: string): Promise<string> {
  // 画像パスを /images/slug/filename に変換
  let processedContent = content.replace(
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
  
  return String(file);
}

// ====== PUBLISH コマンド ======
async function publishPost(slug: string) {
  console.log(`\n📝 Publishing "${slug}" to ${ENV_LABEL}`);
  console.log(`   API: ${API}`);
  
  const { path: mdxPath, dir: imagesDir } = await findMdxPath(slug);
  console.log(`   Source: ${mdxPath}`);
  
  // MDX読み込み
  const raw = await readFile(mdxPath, "utf8");
  const { data: fm, content } = matter(raw);
  
  // 画像アップロード
  if (imagesDir) {
    const uploaded = await uploadImages(slug, imagesDir);
    if (uploaded.length > 0) {
      console.log(`   ✅ Uploaded ${uploaded.length} images`);
    }
  }
  
  // HTML変換
  const html = await convertMdxToHtml(content, slug);
  
  // メタデータ
  const meta = {
    title: (fm as any).title ?? slug.replace(/-/g, " "),
    date: (fm as any).date ?? new Date().toISOString().slice(0, 10),
    excerpt: (fm as any).excerpt ?? "",
    tags: (fm as any).tags ?? [],
  };
  
  // API投稿
  const token = await generateToken();
  const res = await fetch(`${API}/api/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ slug, html, meta }),
  });
  
  if (res.ok) {
    console.log(`\n✅ Published successfully!`);
    console.log(`   Title: ${meta.title}`);
    console.log(`   Date:  ${meta.date}`);
    console.log(`   Tags:  ${meta.tags.join(", ") || "(none)"}`);
    console.log(`   URL:   ${API}/${slug}`);
  } else {
    console.error(`\n❌ Failed: ${res.status}`, await res.text());
    process.exit(1);
  }
}

// ====== DELETE コマンド ======
async function deletePost(slug: string) {
  console.log(`\n🗑️  Deleting "${slug}" from ${ENV_LABEL}`);
  console.log(`   API: ${API}`);
  
  const token = await generateToken();
  const res = await fetch(`${API}/api/posts/${slug}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (res.ok) {
    console.log(`\n✅ Deleted: ${slug}`);
  } else if (res.status === 404) {
    console.log(`\n⚠️  Not found: ${slug}`);
  } else {
    console.error(`\n❌ Failed: ${res.status}`, await res.text());
    process.exit(1);
  }
}

// ====== LIST コマンド ======
async function listPosts() {
  console.log(`\n📋 Posts on ${ENV_LABEL}`);
  console.log(`   API: ${API}\n`);
  
  const res = await fetch(`${API}/api/posts`);
  if (!res.ok) {
    console.error(`❌ Failed: ${res.status}`);
    process.exit(1);
  }
  
  const data = await res.json() as { posts: Array<{ slug: string; title?: string; date?: string; tags?: string[] }> };
  const posts = data.posts || [];
  
  if (posts.length === 0) {
    console.log("   (No posts found)");
    return;
  }
  
  // 日付でソート（新しい順）
  posts.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  
  for (const post of posts) {
    const tags = post.tags?.length ? ` [${post.tags.join(", ")}]` : "";
    console.log(`   ${post.date ?? "----"} | ${post.slug}`);
    console.log(`           ${post.title ?? "(no title)"}${tags}`);
  }
  
  console.log(`\n   Total: ${posts.length} posts`);
}

// ====== UPDATE-TAGS コマンド ======
async function updateTags(slug: string) {
  console.log(`\n🏷️  Updating tags for "${slug}" on ${ENV_LABEL}`);
  
  const { path: mdxPath } = await findMdxPath(slug);
  const raw = await readFile(mdxPath, "utf8");
  const { data: fm } = matter(raw);
  
  const meta = {
    title: (fm as any).title,
    date: (fm as any).date,
    excerpt: (fm as any).excerpt ?? "",
    tags: (fm as any).tags ?? [],
  };
  
  const token = await generateToken();
  const res = await fetch(`${API}/api/posts/${slug}/meta`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(meta),
  });
  
  if (res.ok) {
    console.log(`\n✅ Updated tags: ${meta.tags.join(", ") || "(none)"}`);
  } else {
    console.error(`\n❌ Failed: ${res.status}`, await res.text());
    process.exit(1);
  }
}

// ====== メイン ======
try {
  switch (command) {
    case "publish":
      if (!positionalArgs[0]) {
        console.error("❌ slug is required\nUsage: blog publish <slug> [--preview]");
        process.exit(1);
      }
      await publishPost(positionalArgs[0]);
      break;
      
    case "delete":
      if (!positionalArgs[0]) {
        console.error("❌ slug is required\nUsage: blog delete <slug> [--preview]");
        process.exit(1);
      }
      await deletePost(positionalArgs[0]);
      break;
      
    case "list":
      await listPosts();
      break;
      
    case "update-tags":
      if (!positionalArgs[0]) {
        console.error("❌ slug is required\nUsage: blog update-tags <slug> [--preview]");
        process.exit(1);
      }
      await updateTags(positionalArgs[0]);
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
} catch (error) {
  if (error instanceof Error) {
    console.error(`\n❌ Error: ${error.message}`);
  } else {
    console.error(`\n❌ Error:`, error);
  }
  process.exit(1);
}
