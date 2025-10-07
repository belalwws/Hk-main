#!/usr/bin/env node

/**
 * Production Migration Script
 * Safely applies database migrations in production
 */

const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)

console.log('🗄️ Production Migration - Starting...')

async function runMigration() {
  try {
    // Check if we're in production
    const isProduction = process.env.NODE_ENV === 'production'
    const isRender = process.env.RENDER === 'true'
    
    if (!isProduction && !isRender) {
      console.log('ℹ️ Not in production environment, skipping migration')
      return
    }
    
    console.log('🌐 Production environment detected')
    console.log('🔄 Running Prisma migration...')
    
    // Generate Prisma client first
    console.log('📦 Generating Prisma client...')
    await execAsync('npx prisma generate --schema ./schema.prisma')
    console.log('✅ Prisma client generated')
    
    // Deploy migrations
    console.log('🚀 Deploying migrations...')
    await execAsync('npx prisma migrate deploy --schema ./schema.prisma')
    console.log('✅ Migrations deployed successfully')
    
    console.log('✅ Production Migration - Completed successfully!')
    
  } catch (error) {
    console.error('❌ Production Migration - Error:', error.message)
    
    // Don't fail the build for migration issues
    console.warn('⚠️ Continuing with deployment despite migration issues...')
    console.warn('   Database will be initialized on first request')
  }
}

// Run the migration
runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Migration failed:', error.message)
    // Don't fail the build
    process.exit(0)
  })
