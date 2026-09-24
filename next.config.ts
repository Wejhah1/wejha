import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://arkyssvsnumajlmzliyr.supabase.co/storage/v1/object/public/location-images/**"),
    ],
  },
};

export default nextConfig;
