/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@sih/shared'],
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:5000/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
