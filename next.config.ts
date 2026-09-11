/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allows production builds to complete successfully even if your project has type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skips ESLint checks during production builds
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

module.exports = nextConfig;