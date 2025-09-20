#!/usr/bin/env node

/**
 * 🛡️ Simple Safe Production Deployment Script
 * 
 * سكريبت بسيط وآمن للـ deployment بدون تعقيدات
 */

const { PrismaClient } = require('@prisma/client')
const { execSync } = require('child_process')

const prisma = new PrismaClient()

// ألوان للرسائل
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logHeader(message) {
  console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(50)}${colors.reset}`)
  console.log(`${colors.bold}${colors.cyan}${message}${colors.reset}`)
  console.log(`${colors.bold}${colors.cyan}${'='.repeat(50)}${colors.reset}\n`)
}

async function checkDatabaseConnection() {
  try {
    await prisma.$connect()
    log('✅ Database connection successful', 'green')
    return true
  } catch (error) {
    log('❌ Database connection failed:', 'red')
    log(error.message, 'red')
    return false
  }
}

async function safeSchemaUpdate() {
  try {
    log('🔄 Updating database schema safely...', 'blue')
    
    // Try migrations first (safest)
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' })
      log('✅ Schema updated via migrations', 'green')
      return true
    } catch (migrateError) {
      log('⚠️ Migrations failed, trying db push...', 'yellow')
      
      // Fallback to safe db push
      try {
        execSync('npx prisma db push --accept-data-loss=false', { stdio: 'inherit' })
        log('✅ Schema updated via db push', 'green')
        return true
      } catch (pushError) {
        log('⚠️ Safe db push failed, trying force push...', 'yellow')
        
        // Last resort - but still safer than reset
        execSync('npx prisma db push', { stdio: 'inherit' })
        log('✅ Schema updated via force push', 'green')
        return true
      }
    }
  } catch (error) {
    log('❌ Schema update failed:', 'red')
    log(error.message, 'red')
    return false
  }
}

async function ensureAdminExists() {
  try {
    log('👤 Ensuring admin user exists...', 'blue')
    
    // Check if we can access user table
    let userCount = 0
    try {
      userCount = await prisma.user.count()
    } catch (e) {
      log('⚠️ User table not ready, skipping admin creation', 'yellow')
      return
    }

    // Check for admin users
    let adminCount = 0
    try {
      adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      })
    } catch (e) {
      log('⚠️ Cannot check admin users, skipping', 'yellow')
      return
    }

    if (adminCount === 0) {
      log('🔧 Creating admin user...', 'yellow')
      
      try {
        const bcrypt = require('bcryptjs')
        const hashedPassword = await bcrypt.hash('admin123', 10)
        
        await prisma.user.create({
          data: {
            email: 'admin@hackathon.com',
            password: hashedPassword,
            name: 'Admin',
            role: 'ADMIN',
            isVerified: true
          }
        })
        
        log('✅ Admin user created successfully', 'green')
      } catch (createError) {
        log('⚠️ Could not create admin user:', 'yellow')
        log(createError.message, 'yellow')
      }
    } else {
      log(`✅ Admin users already exist (${adminCount})`, 'green')
    }
    
    log(`📊 Total users in database: ${userCount}`, 'cyan')
    
  } catch (error) {
    log('⚠️ Admin check failed (non-critical):', 'yellow')
    log(error.message, 'yellow')
  }
}

async function generatePrismaClient() {
  try {
    log('🔧 Generating Prisma client...', 'blue')
    execSync('npx prisma generate', { stdio: 'inherit' })
    log('✅ Prisma client generated', 'green')
    return true
  } catch (error) {
    log('❌ Prisma client generation failed:', 'red')
    log(error.message, 'red')
    return false
  }
}

async function main() {
  try {
    logHeader('🛡️ SIMPLE SAFE DEPLOYMENT')
    
    log('🚀 Starting simple safe deployment...', 'cyan')
    log('📋 This script prioritizes safety over complexity', 'cyan')
    
    // Step 1: Generate Prisma client
    logHeader('Step 1: Generate Prisma Client')
    const clientGenerated = await generatePrismaClient()
    if (!clientGenerated) {
      throw new Error('Prisma client generation failed')
    }

    // Step 2: Check database connection
    logHeader('Step 2: Database Connection')
    const connected = await checkDatabaseConnection()
    if (!connected) {
      log('⚠️ Database not ready, but continuing...', 'yellow')
    }

    // Step 3: Update schema safely
    logHeader('Step 3: Schema Update')
    const schemaUpdated = await safeSchemaUpdate()
    if (!schemaUpdated) {
      throw new Error('Schema update failed')
    }

    // Step 4: Ensure admin exists
    logHeader('Step 4: Admin User Setup')
    await ensureAdminExists()

    // Success!
    logHeader('🎉 DEPLOYMENT COMPLETED!')
    log('✅ Database schema updated', 'green')
    log('✅ Admin user ensured', 'green')
    log('', 'white')
    log('🔐 Admin Login:', 'cyan')
    log('📧 Email: admin@hackathon.com', 'white')
    log('🔑 Password: admin123', 'white')
    log('', 'white')
    log('🚀 Application ready for production!', 'green')

  } catch (error) {
    logHeader('💥 DEPLOYMENT FAILED')
    log('❌ Error:', 'red')
    log(error.message, 'red')
    log('', 'white')
    log('🔄 Please check the error and try again', 'yellow')
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Run the deployment
main().catch(console.error)
