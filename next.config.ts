import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Đặt Vercel function gần Supabase DB (ap-southeast-2 = Sydney)
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "clgbiuncejwacwuxikgj.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;