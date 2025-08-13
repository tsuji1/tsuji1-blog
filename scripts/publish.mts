// scripts/publish.mts
import { readFile } from "node:fs/promises";
import matter from "gray-matter";
import { SignJWT } from "jose";

// ▼ HTML化に使うパイプライン
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";

// ====== 設定 ======
// const API = process.env.API ?? "localhost:8788"; // 本番なら https://tsuji1.dev
const API =  "http://localhost:8788"; // 本番なら https://tsuji1.dev
const JWT_ISSUER = process.env.JWT_ISSUER ?? "tsuji1-blog";
const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  console.error("JWT_SECRET is missing");
  process.exit(1);
}

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node --env-file=.env scripts/publish.mts <slug>");
  process.exit(1);
}

// ====== 1) MDX読み込み & frontmatter抽出 ======
const raw = await readFile(`content/posts/${slug}.mdx`, "utf8");
const { data: fm, content } = matter(raw);

// ====== 2) MDX(≒Markdown) → HTML 生成 ======
// * JSXを使っていない前提。使う場合はCLI側で別レンダラを用意してください。
const file = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkFrontmatter, ["yaml"])
  .use(remarkRehype, { allowDangerousHtml: true }) // MD中の生HTMLを通す
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, { behavior: "wrap" })
  .use(rehypeStringify, { allowDangerousHtml: true })
  .process(content);
const html = String(file);

// ====== 3) meta を補完 ======
const meta = {
  title: (fm as any).title ?? slug.replace(/-/g, " "),
  date: (fm as any).date ?? new Date().toISOString().slice(0, 10),
  excerpt: (fm as any).excerpt ?? "",
};

// ====== 4) JWT 発行 ======
const token = await new SignJWT({ role: "editor" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuer(JWT_ISSUER)
  .setIssuedAt()
  .setExpirationTime("10m")
  .sign(new TextEncoder().encode(JWT_SECRET));

// ====== 5) API に HTML を投稿 ======
const res = await fetch(`${API}/api/posts`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ slug, html, meta }),
});
console.log(res.status, await res.text());
