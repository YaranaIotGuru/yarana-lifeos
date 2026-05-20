/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // In production, NEXT_PUBLIC_API_URL points to Render.com
    // In development, it points to localhost:5050
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
