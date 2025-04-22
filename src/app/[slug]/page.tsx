// app/[slug]/page.tsx
import { getPostBySlug, getPostSlugs } from "@/lib/mdx";

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function PostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { meta, content } = await getPostBySlug(params.slug);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="prose lg:prose-xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{meta.title}</h1>
          <time className="text-gray-500" dateTime={meta.date}>
            {new Date(meta.date).toLocaleDateString("ja-JP")}
          </time>
        </header>
        <div className="mx-auto">
          {/* MDX が ReactNode として返ってくる */}
          {content}
        </div>
      </article>
    </div>
  );
}
