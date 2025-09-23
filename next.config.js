/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint checks for deployment
  },
  typescript: {
    ignoreBuildErrors: true, // Disable TypeScript checks for deployment
  },
  images: {
    unoptimized: true,
  },
  // Canvas and nodemailer configuration for production
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('canvas')
      // Fix nodemailer issues in production
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      }
    }
    return config
  },
  // Optimize for production
  experimental: {
    // optimizeCss: true, // Temporarily disabled for deployment
  },
  // Fix chunk loading issues
  output: 'standalone',
  // Ensure proper asset loading
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
}

module.exports = nextConfig
