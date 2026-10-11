import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "Videos" became the exercise "Library"; keep old links working.
  async redirects() {
    return [{ source: "/videos", destination: "/library", permanent: true }];
  },
};

export default nextConfig;
