import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // معطل للموبايل - سنستخدم development server
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js"
      }
    }
  },
  images: {
    unoptimized: true, // للموبايل
    domains: ["localhost"],
  },
  trailingSlash: true,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000 * 60,
    pagesBufferLength: 5,
  },
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config;
  },
};

export default nextConfig;