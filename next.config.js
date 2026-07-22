/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',        // static HTML export → S3
  trailingSlash: true,     // /python/core/ → works with CloudFront
  images: {
    unoptimized: true,     // required for static export
  },
}

module.exports = nextConfig
