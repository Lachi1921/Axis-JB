import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cacheComponents: true,
  },
  transpilePackages: ['next-mdx-remote']
};

export default nextConfig;
