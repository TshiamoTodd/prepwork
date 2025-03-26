import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  optimizeFonts: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
