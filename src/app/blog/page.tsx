import { getPostBySlug, getPostSlugs } from "@/lib/mdx";
import Link from "next/link";

export default async function BlogIndex() {
  const slugs = await getPostSlugs();
  const posts = await Promise.all(slugs.map(getPostBySlug));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 border border-white">
      <section className="prose mx-auto">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        <ul className="space-y-8 list-none p-0">
          {posts.map(({ meta }, i) => (
            <li key={slugs[i]} className="rounded-lg bg-gray-50 hover:bg-gray-100 transition">
              <Link href={`${slugs[i]}`} className="no-underline block p-6">
                <h2 className="mb-3 text-gray-600 mt-2">{meta.title}</h2>
                <small className="text-gray-600">{new Date(meta.date).toLocaleDateString("ja-JP")}</small>
                <p className="mt-4 mb-2 text-gray-600">{meta.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
