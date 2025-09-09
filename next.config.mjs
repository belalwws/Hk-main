/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint checks in production
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily disable TypeScript checks for deployment
  },
  images: {
    unoptimized: true,
  },
  // Canvas configuration for production
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('canvas')
    }
    return config
  },
  // Optimize for production
  experimental: {
    // optimizeCss: true, // Temporarily disabled for deployment
  },
}

export default nextConfig
