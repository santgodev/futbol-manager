import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['192.168.1.40', '192.168.20.38', 'localhost', '0.0.0.0'],
};

export default nextConfig;
