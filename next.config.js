/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ['*'],
  },
  experimental: {
    serverActions: false,
  },
}

module.exports = nextConfig 