import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Privy -> WalletConnect -> pino pulls thread-stream's test files into the bundle; keep them external.
  serverExternalPackages: ["pino", "pino-pretty", "thread-stream"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
