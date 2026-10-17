import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Unsplash already resizes on its CDN, so we hand it the width directly.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  experimental: {
    // Mentor applications can include a profile photo.
    serverActions: { bodySizeLimit: "6mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
