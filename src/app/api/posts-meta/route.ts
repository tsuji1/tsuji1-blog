// app/api/posts-meta/route.ts
export const runtime = 'edge';
import { getRequestContext } from '@cloudflare/next-on-pages';
type Env = { BLOG_POSTS_KV: KVNamespace };

export async function GET() {
  const { env } = getRequestContext<Env>();
  const idx = await env.BLOG_POSTS_KV.get("posts:index");
  const slugs: string[] = idx ? JSON.parse(idx) : [];

  const posts = await Promise.all(slugs.map(async (slug) => {
    const m = await env.BLOG_POSTS_KV.get(`post:${slug}:meta`);
    const meta = m ? JSON.parse(m) : {};
    return { slug, ...meta };
  }));

  return new Response(JSON.stringify({ posts }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=60, s-maxage=60, stale-while-revalidate=30",
    },
  });
}
