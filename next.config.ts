import type { NextConfig } from "next";

let rawBasePath: string | undefined;

if (typeof process.env.NEXT_PUBLIC_BASE_PATH === "string") {
  const envValue = process.env.NEXT_PUBLIC_BASE_PATH.trim();

  if (envValue.length > 0) {
    rawBasePath = envValue;
  }
}

let normalizedBasePath = "";

if (typeof rawBasePath === "string") {
  if (rawBasePath !== "/") {
    normalizedBasePath = `/${rawBasePath.replace(/^\/+|\/+$/g, "")}`;
  }
}

const nextConfig: NextConfig = {};

if (normalizedBasePath) {
  nextConfig.basePath = normalizedBasePath;
  nextConfig.assetPrefix = `${normalizedBasePath}/`;
}

export default nextConfig;
