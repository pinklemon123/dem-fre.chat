import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 为 Vercel 部署配置
  serverExternalPackages: ['@supabase/supabase-js'],
  // 如果需要静态导出，请取消注释下面这行
  // output: "export",
};

export default nextConfig;
