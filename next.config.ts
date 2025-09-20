import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 为 Vercel 部署配置
  experimental: {
    // 确保服务端渲染正常工作
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  // 如果需要静态导出，请取消注释下面这行
  // output: "export",
};

export default nextConfig;
