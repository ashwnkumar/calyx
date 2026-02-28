import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabled cacheComponents for authenticated routes with dynamic data
  cacheComponents: false,
};

export default nextConfig;
