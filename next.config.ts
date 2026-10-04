import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // `npm run build` genera el sitio estático completo en la carpeta `out` (Hostinger).
  ...(process.env.NODE_ENV === "production" ? { output: "export" as const } : {}),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['192.168.1.40', '192.168.20.38', 'localhost', '0.0.0.0'],
};

export default nextConfig;
