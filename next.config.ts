import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'mdx','md'],
  images: {
    domains: ["github.com"],
  },
};

export default nextConfig;
