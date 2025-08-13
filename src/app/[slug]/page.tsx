// src/app/[slug]/page.tsx
import { getRequestContext } from "@cloudflare/next-on-pages";
import { notFound } from "next/navigation";

export const runtime = "edge";
export const revalidate = 60;
export const dynamic = "force-static";
export const dynamicParams = true; // 新規slugも初回アクセスでISR生成

type Env = { BLOG_POSTS_KV: KVNamespace };

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { env } = getRequestContext<Env>();

  const [metaRaw, html] = await Promise.all([
    env.BLOG_POSTS_KV.get(`post:${slug}:meta`),
    env.BLOG_POSTS_KV.get(`post:${slug}:html`),
  ]);

  if (!metaRaw || !html) return notFound();

  let meta: { title?: string; date?: string; excerpt?: string } = {};
  try { meta = JSON.parse(metaRaw); } catch {}

  const title = meta.title ?? slug.replace(/-/g, " ");
  const dateLabel = meta.date ? meta.date.slice(0, 10) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="prose lg:prose-xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          {dateLabel && (
            <time className="text-gray-500" dateTime={dateLabel}>
              {dateLabel}
            </time>
          )}
        </header>
        <div className="mx-auto" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </div>
  );
}
