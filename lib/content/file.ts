// lib/content/file.ts
import matter from "gray-matter";
import fs from "node:fs/promises";
import path from "node:path";
import type { ContentDriver, PostFull } from "./types";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export const fileDriver: ContentDriver = {
  async getPostSlugs() {
    const files = await fs.readdir(POSTS_DIR);
    return files
      .filter(f => f.endsWith(".mdx") || f.endsWith(".md"))
      .map(f => f.replace(/\.(mdx|md)$/, ""));
  },

  async getPostBySlug(slug: string): Promise<PostFull> {
    const p = path.join(POSTS_DIR, `${slug}.mdx`);
    const raw = await fs.readFile(p, "utf8");
    const { data, content } = matter(raw);
    const title = data.title || slug.replace(/-/g, " ");
    const excerpt = data.excerpt || content.slice(0, 200) + "...";
    const date = data.date || new Date().toISOString();
    
    return { meta: { slug,title, excerpt,date}, mdx: content };
  },
};
