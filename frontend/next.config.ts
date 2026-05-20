import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["www.local.test"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.local.test",
        pathname: "/wp-content/**",
      },
      {
        protocol: "https",
        hostname: "cms.kazu-test.com",
        pathname: "/wp-content/**",
      },
    ],
  },
};

export default nextConfig;
