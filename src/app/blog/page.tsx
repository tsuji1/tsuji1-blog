// src/app/blog/page.tsx
export const runtime = "edge";
export const revalidate = 60;
export const dynamic = "force-static";

import { getRequestContext } from "@cloudflare/next-on-pages";

type Env = { BLOG_POSTS_KV: KVNamespace };
type PostMeta = { slug: string; title?: string; date?: string; excerpt?: string };

export default async function BlogIndex() {
  const { env } = getRequestContext<Env>();
  const idx = await env.BLOG_POSTS_KV.get("posts:index");
  const slugs: string[] = idx ? JSON.parse(idx) : [];

  const posts: PostMeta[] = await Promise.all(
    slugs.map(async (slug) => {
      const m = await env.BLOG_POSTS_KV.get(`post:${slug}:meta`);
      const meta = m ? (JSON.parse(m) as Omit<PostMeta, "slug">) : {};
      return { slug, ...meta };
    })
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
      <section className="prose mx-auto">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        <ul className="space-y-8 list-none p-0">
          {posts.map((meta) => {
            const title = meta.title ?? meta.slug.replace(/-/g, " ");
            const dateLabel = meta.date ? meta.date.slice(0, 10) : null; // YYYY-MM-DD想定
            return (
              <li key={meta.slug} className="rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <a href={`/${meta.slug}`} className="no-underline block p-6">
                  <h2 className="mb-3 text-gray-600 mt-2">{title}</h2>
                  {dateLabel && <small className="text-gray-600">{dateLabel}</small>}
                  {meta.excerpt && <p className="mt-4 mb-2 text-gray-600">{meta.excerpt}</p>}
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
