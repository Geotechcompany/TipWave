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
      'placehold.co',
      'ui-avatars.com',
      'avatars.githubusercontent.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve Node.js built-in modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        'fs/promises': false,
        'timers/promises': false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        crypto: false,
        // These modules are only needed on the server side
        kerberos: false,
        '@mongodb-js/zstd': false,
        '@aws-sdk/credential-providers': false,
        'mongodb-client-encryption': false,
        snappy: false,
        aws4: false,
        'gcp-metadata': false,
        socks: false,
      };
    }
    return config;
  }
};

module.exports = nextConfig;
