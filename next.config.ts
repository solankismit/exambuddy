import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude Prisma from bundling to ensure binaries are available at runtime
  // This is required for Turbopack and Vercel deployments
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
};

export default nextConfig;
