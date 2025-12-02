/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add image configuration for Sanity CDN
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
      },
    ],
  },
  
  // Optional: Allows Next.js to run the Sanity studio in dev mode if it's nested
  // If you use the root directory setting in Vercel, this might not be needed.
  // experimental: {
  //   appDir: true,
  // },
};

module.exports = nextConfig;