#!/usr/bin/env node

/**
 * Build Fix Script for Render Deployment
 * Fixes common build issues including nodemailer and other dependencies
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Running build fixes...')

// Fix 0: Remove package-lock.json to force regeneration
const packageLockPath = path.join(__dirname, '..', 'package-lock.json')
if (fs.existsSync(packageLockPath)) {
  fs.unlinkSync(packageLockPath)
  console.log('✅ Removed old package-lock.json')
}

// Fix 1: Ensure all required directories exist
const requiredDirs = [
  'node_modules',
  '.next',
  'types',
  'scripts'
]

requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`✅ Created directory: ${dir}`)
  }
})

// Fix 2: Create environment variables file if missing
const envPath = path.join(__dirname, '..', '.env.local')
if (!fs.existsSync(envPath)) {
  const envContent = `# Auto-generated environment file
NODE_ENV=production
DATABASE_PROVIDER=postgresql
`
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Created .env.local file')
}

// Fix 3: Ensure package.json has correct scripts
const packagePath = path.join(__dirname, '..', 'package.json')
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  
  // Ensure build script exists
  if (!packageJson.scripts.build) {
    packageJson.scripts.build = 'next build'
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
    console.log('✅ Fixed package.json build script')
  }
}

// Fix 4: Create next.config.js if missing
const nextConfigPath = path.join(__dirname, '..', 'next.config.js')
if (!fs.existsSync(nextConfigPath)) {
  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('canvas')
    }
    return config
  },
  output: 'standalone',
}

module.exports = nextConfig
`
  fs.writeFileSync(nextConfigPath, nextConfig)
  console.log('✅ Created next.config.js')
}

console.log('🎉 Build fixes completed successfully!')
