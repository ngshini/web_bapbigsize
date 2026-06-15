import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co"
      }
    ]
  },
  experimental: {
    // Đặt Vercel function gần Supabase DB (ap-southeast-2 = Sydney)
    serverActions: {
      bodySizeLimit: "2mb"
    }
  }
};

export default nextConfig;
