/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "i.scdn.co", 
      "img.clerk.com", 
      "images.clerk.dev",
      "via.placeholder.com",
      "res.cloudinary.com",
      'images.unsplash.com',
      'lh3.googleusercontent.com',
      'placehold.co'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
};

module.exports = nextConfig;
