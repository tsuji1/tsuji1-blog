// types/env.d.ts など
export {};

declare global {
  interface CloudflareEnv {
    BLOG_POSTS_KV: KVNamespace;
    JWT_ISSUER: string;
    JWT_SECRET: string;
  }
}
