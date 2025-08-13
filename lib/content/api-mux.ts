// lib/content/hybrid.ts
import type { ContentDriver } from "./types";
import { apiDriver } from "./api";
import { fileDriver } from "./file";
import { tryApiThenFile } from "./fallback";

export const hybridDriver: ContentDriver = {
  getPostSlugs() {
    return tryApiThenFile(
      () => apiDriver.getPostSlugs(),
      () => fileDriver.getPostSlugs()
    );
  },
  getPostBySlug(slug: string) {
    return tryApiThenFile(
      () => apiDriver.getPostBySlug(slug),
      () => fileDriver.getPostBySlug(slug)
    );
  },
};
