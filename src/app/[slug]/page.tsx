// app/[slug]/page.tsx
import { getPostBySlug, getPostSlugs } from "@/lib/mdx";

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const { meta, content } = await getPostBySlug(params.slug);

  return (
    <article className="prose mx-auto">
      <h1>{meta.title}</h1>
      <time dateTime={meta.date}>
        {new Date(meta.date).toLocaleDateString("ja-JP")}
      </time>
      {/* MDX が ReactNode として返ってくる */}
      {content}
    </article>
  );
}
