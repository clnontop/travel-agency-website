/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    unoptimized: true
  },
  assetPrefix: '',
  basePath: '',
  // Use SWC on production (Netlify) but Babel locally due to Windows issues
  swcMinify: process.env.NODE_ENV === 'production',
  experimental: {
    forceSwcTransforms: process.env.NODE_ENV === 'production',
  }
}

module.exports = nextConfig