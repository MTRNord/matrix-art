/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  i18n,
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false
    }

    return config;
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  eslint: {
    dirs: ['pages', 'components', "helpers", "e2e"],
  },
  async redirects() {
    return [
      {
        source: '/posts.rss',
        destination: '/api/posts/feed.rss',
        permanent: false,
      },
    ]
  },
}
