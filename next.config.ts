/** @type {import('next').NextStyleConfig | import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

module.exports = nextConfig; // Or `export default nextConfig;` if using .mjs / ESM