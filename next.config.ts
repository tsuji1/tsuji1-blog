import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'mdx','md'],
  images: {
    domains: ["github.com"],
  },
};
if (process.env.NODE_ENV === 'development') {
  setupDevPlatform().then(() => {
  // config の return
});

}
export default nextConfig;
