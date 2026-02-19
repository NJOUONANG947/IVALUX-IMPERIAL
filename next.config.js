/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'cdn.shopify.com'],
  },
  async rewrites() {
    return [
      { source: '/auth/:path*', destination: `${backendUrl}/auth/:path*` },
      { source: '/products/:path*', destination: `${backendUrl}/products/:path*` },
      { source: '/employee/:path*', destination: `${backendUrl}/employee/:path*` },
      { source: '/admin/:path*', destination: `${backendUrl}/admin/:path*` },
      { source: '/track/:path*', destination: `${backendUrl}/track/:path*` },
      { source: '/orders/:path*', destination: `${backendUrl}/orders/:path*` },
      { source: '/invoices/:path*', destination: `${backendUrl}/invoices/:path*` },
      { source: '/appointments/:path*', destination: `${backendUrl}/appointments/:path*` },
      { source: '/messages/:path*', destination: `${backendUrl}/messages/:path*` },
      { source: '/financial/:path*', destination: `${backendUrl}/financial/:path*` },
      { source: '/loyalty/:path*', destination: `${backendUrl}/loyalty/:path*` },
      { source: '/subscriptions/:path*', destination: `${backendUrl}/subscriptions/:path*` },
      { source: '/notifications/:path*', destination: `${backendUrl}/notifications/:path*` },
      { source: '/reviews/:path*', destination: `${backendUrl}/reviews/:path*` },
      { source: '/analytics/:path*', destination: `${backendUrl}/analytics/:path*` },
      { source: '/sentiment/:path*', destination: `${backendUrl}/sentiment/:path*` },
      { source: '/metaverse/:path*', destination: `${backendUrl}/metaverse/:path*` },
      { source: '/marketplace/:path*', destination: `${backendUrl}/marketplace/:path*` },
      { source: '/iot/:path*', destination: `${backendUrl}/iot/:path*` },
      { source: '/formulations/:path*', destination: `${backendUrl}/formulations/:path*` },
      { source: '/gamification/:path*', destination: `${backendUrl}/gamification/:path*` },
      { source: '/health', destination: `${backendUrl}/health` },
    ];
  },
}

module.exports = nextConfig
