import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // معطل - الصفحة public-site ديناميكية
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // للنشر السريع
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
    domains: ["localhost"],
  },
  onDemandEntries: {
    // حفظ الصفحات في الذاكرة لفترة أطول لتجنب إعادة التحميل
    maxInactiveAge: 25 * 1000 * 60, // 25 دقيقة
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