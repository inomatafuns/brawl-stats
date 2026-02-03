/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['cdn.brawlify.com', 'raw.githubusercontent.com'],
  },
}

module.exports = nextConfig
