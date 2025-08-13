// lib/content/edge.ts
import { abs } from "@/lib/content/abs";
import type { ContentDriver, PostFull } from "./types";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, init);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const t = await r.text();        // ← json() を使わない
  return JSON.parse(t) as T;
}

export const edgeDriver: ContentDriver = {
  getPostSlugs() {
    return fetchJSON<{ slugs: string[] }>(abs("/api/posts"), { next: { revalidate: 60 } }).then(x => x.slugs);
  },
  getPostBySlug(slug: string): Promise<PostFull> {
    return fetchJSON<PostFull>(abs(`/api/posts/${slug}`), { next: { revalidate: 60 } });
  },
};
