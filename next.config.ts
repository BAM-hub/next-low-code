import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // 👈 disables type checking during `next build`
  },
  eslint: {
    ignoreDuringBuilds: true, // 👈 disables eslint during `next build`
  },
};

export default nextConfig;
