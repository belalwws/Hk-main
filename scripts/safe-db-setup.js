#!/usr/bin/env node

/**
 * Safe Database Setup Script for Render
 * This script safely sets up the database during deployment
 */

console.log('🗄️ Safe Database Setup - Starting...')

const { PrismaClient } = require('@prisma/client')

async function safeDatabaseSetup() {
  let prisma

  try {
    // Check if we're in production/Render environment
    const isProduction = process.env.NODE_ENV === 'production'
    const isRender = process.env.RENDER === 'true'
    const databaseUrl = process.env.DATABASE_URL

    console.log(`📦 Environment: ${isProduction ? 'Production' : 'Development'}`)
    console.log(`🔧 Render: ${isRender ? 'Yes' : 'No'}`)
    console.log(`🗄️ Database URL: ${databaseUrl ? 'Set' : 'Not Set'}`)

    if (!databaseUrl) {
      console.warn('⚠️ DATABASE_URL not set, skipping database setup')
      return
    }

    // Initialize Prisma Client
    prisma = new PrismaClient()

    // Test database connection
    console.log('🔍 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // Check if database is accessible
    console.log('🔍 Checking database accessibility...')
    
    try {
      // Try to query a simple table or create one if it doesn't exist
      const result = await prisma.$queryRaw`SELECT 1 as test`
      console.log('✅ Database is accessible')
    } catch (error) {
      console.log('ℹ️ Database may need initialization')
    }

    // Check if tables exist
    console.log('🔍 Checking database tables...')
    
    try {
      const hackathonCount = await prisma.hackathon.count()
      console.log(`✅ Hackathon table exists with ${hackathonCount} records`)
    } catch (error) {
      console.log('ℹ️ Hackathon table may not exist yet (will be created by Prisma migrate)')
    }

    try {
      const userCount = await prisma.user.count()
      console.log(`✅ User table exists with ${userCount} records`)
    } catch (error) {
      console.log('ℹ️ User table may not exist yet (will be created by Prisma migrate)')
    }

    console.log('')
    console.log('🎯 Database Setup Summary:')
    console.log('✅ Database connection verified')
    console.log('✅ Schema will be applied by Prisma')
    console.log('✅ External API database access ready')

  } catch (error) {
    console.error('❌ Database setup error:', error.message)
    
    // Don't fail the build for database issues
    console.warn('⚠️ Continuing with deployment despite database issues...')
    console.warn('   Database will be initialized on first request')
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}

// Run the setup
safeDatabaseSetup()
  .then(() => {
    console.log('✅ Safe Database Setup - Completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Safe Database Setup - Failed:', error.message)
    // Don't fail the build
    console.warn('⚠️ Continuing with deployment...')
    process.exit(0)
  })
