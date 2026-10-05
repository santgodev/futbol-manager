import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  output: "standalone",
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['192.168.1.40', '192.168.20.38', 'localhost', '0.0.0.0'],
};

export default nextConfig;
