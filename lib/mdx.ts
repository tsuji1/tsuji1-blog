// lib/mdx.ts
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import fs from "node:fs/promises";
import path from "node:path";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export async function getPostSlugs() {
  const files = await fs.readdir(POSTS_DIR);
  return files.filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""));
}

export async function getPostBySlug(slug: string) {
  const raw = await fs.readFile(path.join(POSTS_DIR, `${slug}.mdx`), "utf8");

  // front‑matter だけ先に取っておく（一覧用）
  const { data: meta, content: mdx } = matter(raw);

  // 本文を MDX → React コンポーネントに変換（RSC 内で OK）
  const { content } = await compileMDX({
    source: mdx,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
      },
      scope: meta, // front‑matter もそのまま渡せる
    },
  });

  return { meta, content };
}
