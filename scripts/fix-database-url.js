#!/usr/bin/env node

/**
 * Fix Database URL Script
 * Adds connection pooling parameters to DATABASE_URL
 */

console.log('🔧 Fixing DATABASE_URL for production...')

const originalUrl = process.env.DATABASE_URL

if (!originalUrl) {
  console.log('⚠️ DATABASE_URL not set, skipping...')
  process.exit(0)
}

console.log('📊 Original URL:', originalUrl.substring(0, 50) + '...')

// Check if URL already has parameters
if (originalUrl.includes('connection_limit') || originalUrl.includes('pool_timeout')) {
  console.log('✅ DATABASE_URL already has pooling parameters')
  process.exit(0)
}

// Add pooling parameters
const separator = originalUrl.includes('?') ? '&' : '?'
const fixedUrl = `${originalUrl}${separator}connection_limit=10&pool_timeout=20&connect_timeout=30`

console.log('✅ Fixed URL with pooling parameters')
console.log('📝 Parameters added:')
console.log('   - connection_limit=10')
console.log('   - pool_timeout=20')
console.log('   - connect_timeout=30')

// Export for use in other scripts
process.env.DATABASE_URL = fixedUrl

console.log('✅ DATABASE_URL fixed successfully!')

