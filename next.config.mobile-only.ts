import type { NextConfig } from "next";

// تصدير استاتيكي - للموبايل فقط
const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  distDir: 'out', // مجلد التصدير
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // ضروري للتصدير
  },
  trailingSlash: true,
  // استبعاد الصفحات غير المطلوبة
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
