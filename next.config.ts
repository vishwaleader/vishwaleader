import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  // Silence Turbopack warning caused by @ducanh2912/next-pwa webpack plugin
  turbopack: {},
  // Fix ESM import issues with @react-pdf/renderer in webpack builds
  transpilePackages: ["@react-pdf/renderer"],
  async headers() {
    const headers = [];
    // Check if the deployment environment is a preview (not production)
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
      headers.push({
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      });
    }
    return headers;
  },
};

export default withPWA(nextConfig);
