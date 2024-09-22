/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["i.scdn.co", "img.clerk.com", "images.clerk.dev"],
  },
};

module.exports = nextConfig;
