// lib/content/types.ts
export type PostMeta = { slug: string; title: string; [k: string]: string };
export type PostFull = { meta: PostMeta; mdx: string };

export interface ContentDriver {
  getPostSlugs(): Promise<string[]>;
  getPostBySlug(slug: string): Promise<PostFull>;
}
