/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Local uploads are served from /public/uploads.
    // Add remote domains here later if external/CDN storage is introduced.
    remotePatterns: []
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  }
};

module.exports = nextConfig;
