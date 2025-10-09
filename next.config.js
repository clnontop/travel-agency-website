/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    unoptimized: true
  },
  assetPrefix: '',
  basePath: '',
  swcMinify: false,
  experimental: {
    forceSwcTransforms: false,
  }
}

module.exports = nextConfig