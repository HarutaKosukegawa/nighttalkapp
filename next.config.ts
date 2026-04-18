import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tsxblhshzukrvppfhujg.supabase.co',
      },
    ],
  },
};

export default nextConfig;
