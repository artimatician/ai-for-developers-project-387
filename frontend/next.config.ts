import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4010/api/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/event-types/:id',
        destination: '/book/:id',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
