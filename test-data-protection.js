#!/usr/bin/env node

/**
 * 🧪 Test Data Protection System
 * 
 * اختبار سريع لنظام حماية البيانات
 */

const { execSync } = require('child_process')
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
  console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(50)}${colors.reset}`)
  console.log(`${colors.bold}${colors.cyan}${message}${colors.reset}`)
  console.log(`${colors.bold}${colors.cyan}${'='.repeat(50)}${colors.reset}\n`)
}

async function testScriptExists(scriptPath) {
  const fullPath = path.join(process.cwd(), scriptPath)
  const exists = fs.existsSync(fullPath)
  log(`${exists ? '✅' : '❌'} ${scriptPath}`, exists ? 'green' : 'red')
  return exists
}

async function testCommand(command, description) {
  try {
    log(`🔄 Testing: ${description}`, 'blue')
    execSync(command, { stdio: 'pipe' })
    log(`✅ ${description} - Success`, 'green')
    return true
  } catch (error) {
    log(`❌ ${description} - Failed`, 'red')
    log(`   Error: ${error.message}`, 'yellow')
    return false
  }
}

async function main() {
  try {
    logHeader('🧪 DATA PROTECTION SYSTEM TEST')
    
    log('🚀 Testing data protection system...', 'cyan')
    
    // Test 1: Check if scripts exist
    logHeader('Test 1: Script Files')
    const scripts = [
      'scripts/render-safe-deploy.js',
      'scripts/data-protection-guard.js',
      'scripts/pre-deploy-check.js'
    ]
    
    let allScriptsExist = true
    for (const script of scripts) {
      const exists = await testScriptExists(script)
      if (!exists) allScriptsExist = false
    }
    
    // Test 2: Check data directories
    logHeader('Test 2: Data Directories')
    const directories = [
      'data',
      'data/snapshots',
      'data/reports',
      'data/backups'
    ]
    
    let allDirsExist = true
    for (const dir of directories) {
      const exists = fs.existsSync(path.join(process.cwd(), dir))
      log(`${exists ? '✅' : '❌'} ${dir}/`, exists ? 'green' : 'red')
      if (!exists) allDirsExist = false
    }
    
    // Test 3: Check package.json scripts
    logHeader('Test 3: Package.json Scripts')
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    
    const requiredScripts = [
      'data:snapshot',
      'data:verify',
      'pre-deploy',
      'render-deploy',
      'postinstall'
    ]
    
    let allScriptsConfigured = true
    for (const script of requiredScripts) {
      const exists = !!packageJson.scripts[script]
      log(`${exists ? '✅' : '❌'} npm run ${script}`, exists ? 'green' : 'red')
      if (!exists) allScriptsConfigured = false
    }
    
    // Test 4: Test commands (if possible)
    logHeader('Test 4: Command Execution')
    const commands = [
      { cmd: 'node scripts/pre-deploy-check.js', desc: 'Pre-deploy check' },
      { cmd: 'node scripts/data-protection-guard.js', desc: 'Data protection guard help' }
    ]
    
    let allCommandsWork = true
    for (const { cmd, desc } of commands) {
      const works = await testCommand(cmd, desc)
      if (!works) allCommandsWork = false
    }
    
    // Final Results
    logHeader('📋 TEST RESULTS')
    
    const results = {
      scripts: allScriptsExist,
      directories: allDirsExist,
      packageConfig: allScriptsConfigured,
      commands: allCommandsWork
    }
    
    log('Test Results:', 'cyan')
    for (const [test, result] of Object.entries(results)) {
      log(`  ${result ? '✅' : '❌'} ${test}`, result ? 'green' : 'red')
    }
    
    const allPassed = Object.values(results).every(r => r)
    
    if (allPassed) {
      log('\n🎉 ALL TESTS PASSED!', 'green')
      log('✅ Data protection system is ready', 'green')
      log('🚀 Safe to deploy to Render', 'green')
    } else {
      log('\n⚠️ SOME TESTS FAILED', 'yellow')
      log('❌ Please fix the issues above', 'red')
      log('🔧 Run the setup again if needed', 'yellow')
    }
    
    // Save test report
    const report = {
      timestamp: new Date().toISOString(),
      results,
      overall: allPassed
    }
    
    const reportFile = path.join(process.cwd(), 'data', 'reports', `test-report-${Date.now()}.json`)
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
    log(`\n📄 Test report saved: ${reportFile}`, 'cyan')
    
    process.exit(allPassed ? 0 : 1)
    
  } catch (error) {
    log('❌ Test failed:', 'red')
    log(error.message, 'red')
    process.exit(1)
  }
}

main().catch(console.error)
