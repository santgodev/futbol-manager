import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // @ts-ignore - Next.js 15 specific dev origins property
  allowedDevOrigins: ['192.168.1.40'],
};

export default nextConfig;
