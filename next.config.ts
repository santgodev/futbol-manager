import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  ...(isProd ? { output: "export" } : {}),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // @ts-ignore - Next.js 15 specific dev origins property
  allowedDevOrigins: ['192.168.1.40', '192.168.20.38', 'localhost', '0.0.0.0'],
};

export default nextConfig;
