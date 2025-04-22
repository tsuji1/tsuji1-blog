// app/blog/page.tsx
import { getPostBySlug, getPostSlugs } from "@/lib/mdx";
import Link from "next/link";

export default async function BlogIndex() {
  const slugs = await getPostSlugs();
  const posts = await Promise.all(slugs.map(getPostBySlug));

  return (
    <section className="prose mx-auto">
      <h1>Blog</h1>
      <ul>
        {posts.map(({ meta }, i) => (
          <li key={slugs[i]}>
            <Link href={`/${slugs[i]}`} className="no-underline">
              {meta.title}
            </Link>
            <br />
            <small>{new Date(meta.date).toLocaleDateString("ja-JP")}</small>
            <p>{meta.excerpt}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
