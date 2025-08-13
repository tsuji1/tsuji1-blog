// lib/content/api.ts
import type { ContentDriver } from "./types";

export const apiDriver: ContentDriver = {
  async getPostSlugs() {
    const res = await fetch("/api/posts", { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.slugs as string[];
  },
  async getPostBySlug(slug: string) {
    const res = await fetch(`/api/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },
};
