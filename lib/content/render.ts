// lib/content/render.ts
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { PostMeta } from "./types";

export async function renderMDX(mdx: string, scope:PostMeta) {
  const { content } = await compileMDX({
    source: mdx,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
      },
      scope,
    },
  });
  return content;
}
