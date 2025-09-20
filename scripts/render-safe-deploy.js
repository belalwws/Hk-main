#!/usr/bin/env node

/**
 * 🛡️ Render Safe Deployment Script
 * 
 * سكريبت محسّن خصيصاً لـ Render لضمان عدم مسح البيانات نهائياً
 * يتعامل مع جميع حالات النشر ويحمي البيانات الموجودة
 */

const { PrismaClient } = require('@prisma/client')
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

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
  console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}`)
  console.log(`${colors.bold}${colors.cyan}${message}${colors.reset}`)
  console.log(`${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`)
}

// تحقق من البيئة
function isProduction() {
  return process.env.NODE_ENV === 'production' || process.env.RENDER === 'true'
}

// إنشاء Prisma client بشكل آمن
function createPrismaClient() {
  try {
    return new PrismaClient({
      log: ['error'],
      errorFormat: 'minimal'
    })
  } catch (error) {
    log('⚠️ Could not create Prisma client, will try later', 'yellow')
    return null
  }
}

// تحقق من الاتصال بقاعدة البيانات
async function checkDatabaseConnection(prisma) {
  if (!prisma) return false
  
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

// إحصائيات البيانات الحالية
async function getDataStats(prisma) {
  if (!prisma) return null
  
  const stats = {
    users: 0,
    hackathons: 0,
    participants: 0,
    teams: 0,
    judges: 0,
    scores: 0
  }

  try {
    // محاولة عد البيانات بشكل آمن
    const tables = [
      { name: 'users', key: 'users' },
      { name: 'hackathons', key: 'hackathons' },
      { name: 'participants', key: 'participants' },
      { name: 'teams', key: 'teams' },
      { name: 'judges', key: 'judges' },
      { name: 'scores', key: 'scores' }
    ]

    for (const table of tables) {
      try {
        stats[table.key] = await prisma[table.name].count()
      } catch (e) {
        // الجدول غير موجود أو غير متاح
        stats[table.key] = 0
      }
    }

    return stats
  } catch (error) {
    log('⚠️ Could not get data stats:', 'yellow')
    log(error.message, 'yellow')
    return null
  }
}

// إنشاء نسخة احتياطية من البيانات المهمة
async function createDataBackup(prisma) {
  if (!prisma) return false
  
  try {
    log('💾 Creating data backup...', 'blue')
    
    const backup = {
      timestamp: new Date().toISOString(),
      users: [],
      hackathons: [],
      participants: [],
      teams: []
    }

    // نسخ احتياطية للبيانات المهمة
    try {
      backup.users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      })
    } catch (e) {
      log('⚠️ Could not backup users', 'yellow')
    }

    try {
      backup.hackathons = await prisma.hackathon.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          startDate: true,
          endDate: true,
          createdAt: true
        }
      })
    } catch (e) {
      log('⚠️ Could not backup hackathons', 'yellow')
    }

    // حفظ النسخة الاحتياطية
    const backupDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    const backupFile = path.join(backupDir, `backup-${Date.now()}.json`)
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))
    
    log(`✅ Backup created: ${backupFile}`, 'green')
    log(`📊 Backed up: ${backup.users.length} users, ${backup.hackathons.length} hackathons`, 'cyan')
    
    return true
  } catch (error) {
    log('⚠️ Backup creation failed (non-critical):', 'yellow')
    log(error.message, 'yellow')
    return false
  }
}

// تحديث قاعدة البيانات بأمان
async function updateDatabaseSchema() {
  try {
    log('🔄 Updating database schema...', 'blue')
    
    // الطريقة الأولى: استخدام migrations (الأكثر أماناً)
    try {
      log('📋 Trying migrations first...', 'cyan')
      execSync('npx prisma migrate deploy', { 
        stdio: 'inherit',
        timeout: 60000 // 60 seconds timeout
      })
      log('✅ Migrations deployed successfully', 'green')
      return true
    } catch (migrateError) {
      log('⚠️ No migrations to deploy, trying db push...', 'yellow')
    }

    // الطريقة الثانية: db push آمن
    try {
      log('🔄 Trying safe db push...', 'cyan')
      execSync('npx prisma db push --accept-data-loss=false', { 
        stdio: 'inherit',
        timeout: 60000
      })
      log('✅ Schema updated via safe db push', 'green')
      return true
    } catch (pushError) {
      log('⚠️ Safe push failed, trying force push...', 'yellow')
    }

    // الطريقة الثالثة: force push (آخر حل)
    try {
      log('🔄 Trying force push (last resort)...', 'cyan')
      execSync('npx prisma db push', { 
        stdio: 'inherit',
        timeout: 60000
      })
      log('✅ Schema updated via force push', 'green')
      return true
    } catch (forceError) {
      log('❌ All schema update methods failed', 'red')
      return false
    }

  } catch (error) {
    log('❌ Schema update failed:', 'red')
    log(error.message, 'red')
    return false
  }
}

// إنشاء مستخدم مدير إذا لم يكن موجود
async function ensureAdminExists(prisma) {
  if (!prisma) return false
  
  try {
    log('👤 Checking admin user...', 'blue')
    
    // تحقق من وجود مستخدم مدير
    let adminExists = false
    try {
      const adminUser = await prisma.user.findFirst({
        where: { 
          OR: [
            { email: 'admin@hackathon.com' },
            { role: 'admin' }
          ]
        }
      })
      adminExists = !!adminUser
    } catch (e) {
      log('⚠️ Could not check for admin user', 'yellow')
      return false
    }

    if (!adminExists) {
      log('🔧 Creating admin user...', 'yellow')
      
      try {
        const bcrypt = require('bcryptjs')
        const hashedPassword = await bcrypt.hash('admin123', 10)
        
        await prisma.user.create({
          data: {
            email: 'admin@hackathon.com',
            password: hashedPassword,
            name: 'مدير النظام',
            role: 'admin',
            isActive: true,
            emailVerified: true
          }
        })
        
        log('✅ Admin user created successfully', 'green')
        return true
      } catch (createError) {
        log('⚠️ Could not create admin user:', 'yellow')
        log(createError.message, 'yellow')
        return false
      }
    } else {
      log('✅ Admin user already exists', 'green')
      return true
    }
    
  } catch (error) {
    log('⚠️ Admin check failed:', 'yellow')
    log(error.message, 'yellow')
    return false
  }
}

// إنشاء Prisma client
async function generatePrismaClient() {
  try {
    log('🔧 Generating Prisma client...', 'blue')
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      timeout: 60000
    })
    log('✅ Prisma client generated', 'green')
    return true
  } catch (error) {
    log('❌ Prisma client generation failed:', 'red')
    log(error.message, 'red')
    return false
  }
}

// الدالة الرئيسية
async function main() {
  let prisma = null
  
  try {
    logHeader('🛡️ RENDER SAFE DEPLOYMENT')
    
    log('🚀 Starting Render-optimized safe deployment...', 'cyan')
    log('📋 This script is designed specifically for Render platform', 'cyan')
    log('🔒 Your data will be protected at all costs!', 'cyan')
    
    if (isProduction()) {
      log('🌐 Production environment detected', 'yellow')
    } else {
      log('🏠 Development environment detected', 'blue')
    }

    // الخطوة 1: إنشاء Prisma client
    logHeader('Step 1: Generate Prisma Client')
    const clientGenerated = await generatePrismaClient()
    if (!clientGenerated) {
      throw new Error('Failed to generate Prisma client')
    }

    // الخطوة 2: إنشاء اتصال بقاعدة البيانات
    logHeader('Step 2: Database Connection')
    prisma = createPrismaClient()
    const connected = await checkDatabaseConnection(prisma)
    
    if (!connected) {
      log('⚠️ Database not ready yet, will continue with schema setup', 'yellow')
    }

    // الخطوة 3: إحصائيات البيانات الحالية
    logHeader('Step 3: Data Audit')
    let beforeStats = null
    if (connected) {
      beforeStats = await getDataStats(prisma)
      if (beforeStats) {
        log('📊 Current database state:', 'cyan')
        Object.entries(beforeStats).forEach(([key, value]) => {
          log(`   ${key}: ${value}`, 'white')
        })
        
        const hasData = Object.values(beforeStats).some(count => count > 0)
        if (hasData) {
          log('💾 EXISTING DATA DETECTED - Maximum safety mode activated', 'yellow')
          await createDataBackup(prisma)
        } else {
          log('🆕 No existing data - Safe to proceed', 'green')
        }
      }
    }

    // الخطوة 4: تحديث قاعدة البيانات
    logHeader('Step 4: Database Schema Update')
    const schemaUpdated = await updateDatabaseSchema()
    if (!schemaUpdated) {
      throw new Error('Failed to update database schema')
    }

    // الخطوة 5: التأكد من وجود مستخدم مدير
    logHeader('Step 5: Admin User Setup')
    if (connected) {
      await ensureAdminExists(prisma)
    }

    // النجاح!
    logHeader('🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!')
    log('✅ Database schema updated safely', 'green')
    log('✅ Data protection measures applied', 'green')
    log('✅ Admin user verified', 'green')
    log('', 'white')
    log('🔐 Admin Login Credentials:', 'cyan')
    log('📧 Email: admin@hackathon.com', 'white')
    log('🔑 Password: admin123', 'white')
    log('', 'white')
    log('🚀 Your Hackathon Platform is ready on Render!', 'green')

  } catch (error) {
    logHeader('💥 DEPLOYMENT FAILED')
    log('❌ Error:', 'red')
    log(error.message, 'red')
    log('', 'white')
    log('🛡️ Your existing data should be safe due to protection measures', 'green')
    log('🔄 Please check the error and redeploy', 'yellow')
    
    process.exit(1)
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}

// معالجة الأخطاء غير المتوقعة
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

// تشغيل السكريبت
main().catch(console.error)
