import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // تصدير استاتيكي للموبايل
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // ضروري للتصدير الاستاتيكي
  },
  // تعطيل الصفحات الديناميكية للموبايل
  trailingSlash: true,
};

export default nextConfig;
