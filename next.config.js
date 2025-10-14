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

    // Optimize webpack for faster builds (only in production)
    if (process.env.NODE_ENV === 'production') {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
      }
    }

    return config
  },
  // Optimize for production
  experimental: {
    // optimizeCss: true, // Temporarily disabled for deployment
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Fix chunk loading issues
  output: 'standalone',
  // Ensure proper asset loading
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Reduce build output
  productionBrowserSourceMaps: false,
  // Optimize page data
  generateBuildId: async () => {
    // Use a consistent build ID to enable better caching
    return process.env.BUILD_ID || 'build-' + Date.now()
  },
}

module.exports = nextConfig
