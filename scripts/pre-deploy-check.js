#!/usr/bin/env node

/**
 * 🔍 Pre-Deploy Check Script
 * 
 * فحص شامل قبل النشر للتأكد من سلامة البيانات والإعدادات
 * يجب تشغيله قبل أي deployment على Render
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

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

// فحص متغيرات البيئة المطلوبة
function checkEnvironmentVariables() {
  logHeader('🔧 ENVIRONMENT VARIABLES CHECK')
  
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NEXTAUTH_SECRET'
  ]
  
  const optionalVars = [
    'NEXTAUTH_URL',
    'APP_URL',
    'NODE_ENV'
  ]
  
  let allRequired = true
  
  log('Required variables:', 'cyan')
  for (const varName of requiredVars) {
    const exists = !!process.env[varName]
    log(`  ${exists ? '✅' : '❌'} ${varName}`, exists ? 'green' : 'red')
    if (!exists) allRequired = false
  }
  
  log('\nOptional variables:', 'cyan')
  for (const varName of optionalVars) {
    const exists = !!process.env[varName]
    const value = exists ? process.env[varName] : 'Not set'
    log(`  ${exists ? '✅' : '⚠️'} ${varName}: ${value}`, exists ? 'green' : 'yellow')
  }
  
  if (!allRequired) {
    log('\n❌ Missing required environment variables!', 'red')
    return false
  }
  
  log('\n✅ All required environment variables are set', 'green')
  return true
}

// فحص ملفات المشروع المهمة
function checkProjectFiles() {
  logHeader('📁 PROJECT FILES CHECK')
  
  const requiredFiles = [
    'package.json',
    'schema.prisma',
    'next.config.js',
    'scripts/render-safe-deploy.js'
  ]
  
  const optionalFiles = [
    'render.yaml',
    '.env',
    'README.md'
  ]
  
  let allRequired = true
  
  log('Required files:', 'cyan')
  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(process.cwd(), file))
    log(`  ${exists ? '✅' : '❌'} ${file}`, exists ? 'green' : 'red')
    if (!exists) allRequired = false
  }
  
  log('\nOptional files:', 'cyan')
  for (const file of optionalFiles) {
    const exists = fs.existsSync(path.join(process.cwd(), file))
    log(`  ${exists ? '✅' : '⚠️'} ${file}`, exists ? 'green' : 'yellow')
  }
  
  if (!allRequired) {
    log('\n❌ Missing required project files!', 'red')
    return false
  }
  
  log('\n✅ All required project files exist', 'green')
  return true
}

// فحص اتصال قاعدة البيانات
async function checkDatabaseConnection() {
  logHeader('🗄️ DATABASE CONNECTION CHECK')
  
  let prisma = null
  
  try {
    prisma = new PrismaClient()
    await prisma.$connect()
    
    log('✅ Database connection successful', 'green')
    
    // فحص الجداول الأساسية
    const tables = ['user', 'hackathon', 'participant']
    
    for (const table of tables) {
      try {
        const count = await prisma[table].count()
        log(`  📊 ${table}: ${count} records`, 'cyan')
      } catch (error) {
        log(`  ⚠️ ${table}: table not accessible`, 'yellow')
      }
    }
    
    return true
    
  } catch (error) {
    log('❌ Database connection failed:', 'red')
    log(error.message, 'red')
    return false
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}

// فحص إعدادات package.json
function checkPackageJson() {
  logHeader('📦 PACKAGE.JSON CHECK')
  
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    
    // فحص السكريبتات المهمة
    const requiredScripts = [
      'build',
      'start',
      'postinstall'
    ]
    
    log('Required scripts:', 'cyan')
    let allScripts = true
    for (const script of requiredScripts) {
      const exists = !!packageJson.scripts[script]
      log(`  ${exists ? '✅' : '❌'} ${script}`, exists ? 'green' : 'red')
      if (!exists) allScripts = false
    }
    
    // فحص postinstall script
    if (packageJson.scripts.postinstall) {
      const postinstall = packageJson.scripts.postinstall
      log(`\nPostinstall script: ${postinstall}`, 'cyan')
      
      if (postinstall.includes('render-safe-deploy.js')) {
        log('✅ Using safe deployment script', 'green')
      } else {
        log('⚠️ Not using recommended safe deployment script', 'yellow')
      }
    }
    
    // فحص التبعيات المهمة
    const requiredDeps = [
      '@prisma/client',
      'prisma',
      'next',
      'react'
    ]
    
    log('\nRequired dependencies:', 'cyan')
    for (const dep of requiredDeps) {
      const exists = !!(packageJson.dependencies[dep] || packageJson.devDependencies[dep])
      log(`  ${exists ? '✅' : '❌'} ${dep}`, exists ? 'green' : 'red')
      if (!exists) allScripts = false
    }
    
    if (!allScripts) {
      log('\n❌ Package.json configuration issues detected!', 'red')
      return false
    }
    
    log('\n✅ Package.json configuration looks good', 'green')
    return true
    
  } catch (error) {
    log('❌ Failed to check package.json:', 'red')
    log(error.message, 'red')
    return false
  }
}

// إنشاء تقرير شامل
function generateReport(checks) {
  logHeader('📋 DEPLOYMENT READINESS REPORT')
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks,
    overall: Object.values(checks).every(check => check),
    recommendations: []
  }
  
  // عرض النتائج
  log('Check Results:', 'cyan')
  for (const [checkName, result] of Object.entries(checks)) {
    log(`  ${result ? '✅' : '❌'} ${checkName}`, result ? 'green' : 'red')
  }
  
  // التوصيات
  if (!checks.environment) {
    report.recommendations.push('Set all required environment variables')
  }
  
  if (!checks.files) {
    report.recommendations.push('Ensure all required project files exist')
  }
  
  if (!checks.database) {
    report.recommendations.push('Fix database connection issues')
  }
  
  if (!checks.package) {
    report.recommendations.push('Fix package.json configuration')
  }
  
  if (report.recommendations.length > 0) {
    log('\n📝 Recommendations:', 'yellow')
    report.recommendations.forEach(rec => {
      log(`  • ${rec}`, 'yellow')
    })
  }
  
  // حفظ التقرير
  const reportDir = path.join(process.cwd(), 'data', 'reports')
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }
  
  const reportFile = path.join(reportDir, `pre-deploy-check-${Date.now()}.json`)
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
  
  log(`\n📄 Report saved: ${reportFile}`, 'cyan')
  
  // النتيجة النهائية
  if (report.overall) {
    log('\n🎉 DEPLOYMENT READY!', 'green')
    log('✅ All checks passed - safe to deploy to Render', 'green')
  } else {
    log('\n⚠️ DEPLOYMENT NOT READY', 'yellow')
    log('❌ Please fix the issues above before deploying', 'red')
  }
  
  return report
}

// الدالة الرئيسية
async function main() {
  try {
    logHeader('🔍 PRE-DEPLOYMENT CHECK')
    log('🚀 Checking deployment readiness for Render...', 'cyan')
    
    const checks = {
      environment: checkEnvironmentVariables(),
      files: checkProjectFiles(),
      package: checkPackageJson(),
      database: await checkDatabaseConnection()
    }
    
    const report = generateReport(checks)
    
    // إنهاء البرنامج بالكود المناسب
    process.exit(report.overall ? 0 : 1)
    
  } catch (error) {
    log('❌ Pre-deployment check failed:', 'red')
    log(error.message, 'red')
    process.exit(1)
  }
}

// تشغيل السكريبت
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  checkEnvironmentVariables,
  checkProjectFiles,
  checkDatabaseConnection,
  checkPackageJson,
  generateReport
}
