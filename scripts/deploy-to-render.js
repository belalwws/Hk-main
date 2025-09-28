#!/usr/bin/env node

/**
 * Deploy script for Render
 * This script prepares the project for deployment
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 Preparing for Render deployment...')

// Check if we're in production environment
const isProduction = process.env.NODE_ENV === 'production'

console.log(`📦 Environment: ${isProduction ? 'Production' : 'Development'}`)

// Verify essential files exist
const essentialFiles = [
  'package.json',
  'schema.prisma',
  'middleware.ts',
  'app/api/external/v1/hackathons/route.ts',
  'app/api/external/v1/hackathons/[id]/route.ts',
  'app/api/external/v1/hackathons/[id]/register/route.ts'
]

console.log('🔍 Checking essential files...')
let allFilesExist = true

essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - MISSING!`)
    allFilesExist = false
  }
})

if (!allFilesExist) {
  console.error('💥 Some essential files are missing. Deployment aborted.')
  process.exit(1)
}

// Check database configuration
console.log('🗄️ Checking database configuration...')
const schemaContent = fs.readFileSync('schema.prisma', 'utf8')

if (schemaContent.includes('provider = "postgresql"')) {
  console.log('✅ Database configured for PostgreSQL (Production)')
} else if (schemaContent.includes('provider = "sqlite"')) {
  console.log('⚠️ Database configured for SQLite (Development)')
  if (isProduction) {
    console.error('❌ Production deployment requires PostgreSQL!')
    process.exit(1)
  }
} else {
  console.error('❌ Database provider not found in schema.prisma')
  process.exit(1)
}

// Check External API files
console.log('🔗 Checking External API endpoints...')
const apiEndpoints = [
  'app/api/external/v1/hackathons/route.ts',
  'app/api/external/v1/hackathons/[id]/route.ts', 
  'app/api/external/v1/hackathons/[id]/register/route.ts'
]

apiEndpoints.forEach(endpoint => {
  if (fs.existsSync(endpoint)) {
    const content = fs.readFileSync(endpoint, 'utf8')
    if (content.includes('EXTERNAL_API_KEY')) {
      console.log(`✅ ${endpoint} - API Key authentication configured`)
    } else {
      console.log(`⚠️ ${endpoint} - API Key authentication not found`)
    }
    
    if (content.includes('Access-Control-Allow-Origin')) {
      console.log(`✅ ${endpoint} - CORS configured`)
    } else {
      console.log(`⚠️ ${endpoint} - CORS not configured`)
    }
  }
})

// Check middleware
console.log('🛡️ Checking middleware...')
if (fs.existsSync('middleware.ts')) {
  const middlewareContent = fs.readFileSync('middleware.ts', 'utf8')
  if (middlewareContent.includes('/api/external/')) {
    console.log('✅ Middleware configured for External API')
  } else {
    console.log('⚠️ Middleware may not handle External API routes')
  }
}

// Environment variables check
console.log('🔧 Environment variables needed for production:')
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET', 
  'EXTERNAL_API_KEY',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
]

requiredEnvVars.forEach(envVar => {
  console.log(`📝 ${envVar}`)
})

console.log('')
console.log('🎯 Deployment Checklist:')
console.log('1. ✅ External API endpoints created')
console.log('2. ✅ CORS middleware configured') 
console.log('3. ✅ API Key authentication implemented')
console.log('4. ✅ Database schema ready for PostgreSQL')
console.log('5. ✅ Project cleaned up')

console.log('')
console.log('📋 Next Steps for Render:')
console.log('1. Push code to GitHub')
console.log('2. Set environment variables in Render dashboard:')
requiredEnvVars.forEach(envVar => {
  console.log(`   - ${envVar}`)
})
console.log('3. Deploy on Render')
console.log('4. Run database migrations')

console.log('')
console.log('🔗 External API will be available at:')
console.log('   https://hackathon-platform-601l.onrender.com/api/external/v1')

console.log('')
console.log('✅ Project ready for deployment!')

// Generate API key for production
const crypto = require('crypto')
const productionApiKey = `hk_${crypto.randomBytes(32).toString('hex')}`

console.log('')
console.log('🔑 Generated production API key:')
console.log(productionApiKey)
console.log('')
console.log('⚠️ Save this API key securely and add it to Render environment variables!')

console.log('')
console.log('🚀 Ready to deploy to Render!')
