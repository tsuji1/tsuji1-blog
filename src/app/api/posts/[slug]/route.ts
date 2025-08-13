// src/app/api/posts/[slug]/route.ts
export const runtime = 'edge';

import { getRequestContext } from "@cloudflare/next-on-pages";

type Env = { BLOG_POSTS_KV: KVNamespace };

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { env } = getRequestContext<Env>();

  const [metaRaw, mdx, html] = await Promise.all([
    env.BLOG_POSTS_KV.get(`post:${slug}:meta`),
    env.BLOG_POSTS_KV.get(`post:${slug}:mdx`),
    env.BLOG_POSTS_KV.get(`post:${slug}:html`),
  ]);

  if (!metaRaw || (!mdx && !html)) {
    return new Response("Not Found", { status: 404 });
  }

  let body: unknown;
  try {
    const meta = JSON.parse(metaRaw) as Record<string, unknown>;
    body = mdx
      ? { kind: "mdx" as const, meta, mdx }
      : { kind: "html" as const, meta, html };
  } catch {
    return new Response("Bad meta", { status: 500 });
  }

  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60, s-maxage=60, stale-while-revalidate=30",
    },
  });
}
