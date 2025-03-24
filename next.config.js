/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "i.scdn.co", 
      "img.clerk.com", 
      "images.clerk.dev",
      "via.placeholder.com",
      "res.cloudinary.com"
    ],
  },
};

module.exports = nextConfig;
