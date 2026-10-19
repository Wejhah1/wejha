import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://arkyssvsnumajlmzliyr.supabase.co/storage/v1/object/public/location-images/**"),
      // Photos of locations published from owners' requests.
      new URL("https://arkyssvsnumajlmzliyr.supabase.co/storage/v1/object/public/location-request-images/**"),
    ],
  },
};

export default nextConfig;
