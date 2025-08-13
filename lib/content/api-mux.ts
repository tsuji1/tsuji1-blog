// lib/content/api-mux.ts
import { apiThenFile } from "./fallback";
import { apiDriver } from "./api";
import { fileDriver } from "./file";
import type { ContentDriver } from "./types";

export const hybridDriver: ContentDriver & {
  getPostsMeta?: () => Promise<Array<{ slug: string; title?: string; date?: string; excerpt?: string }>>;
} = {
  getPostSlugs() {
    return apiThenFile(() => apiDriver.getPostSlugs(), () => fileDriver.getPostSlugs(), 1200);
  },
  getPostBySlug(slug: string) {
    return apiThenFile(() => apiDriver.getPostBySlug(slug), () => fileDriver.getPostBySlug(slug), 1200);
  },
  async getPostsMeta() {
    return apiThenFile(
      async () => {
        const res = await fetch("/api/posts-meta", { next: { revalidate: 60 } });
        if (!res.ok) throw new Error(String(res.status));
        const { posts } = (await res.json()) as { posts: Array<{ slug: string; title?: string; date?: string; excerpt?: string }> };
        return posts;
      },
      async () => {
        const slugs = await fileDriver.getPostSlugs();
        const posts = await Promise.all(slugs.map(fileDriver.getPostBySlug));
        return posts.map(({ meta }) => ({ slug: meta.slug, title: meta.title, date: meta.date, excerpt: meta.excerpt }));
      },
      1200
    );
  },
};
