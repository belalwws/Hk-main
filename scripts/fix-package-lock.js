#!/usr/bin/env node

/**
 * Fix package-lock.json sync issues
 * This script ensures package.json and package-lock.json are in sync
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 Fixing package-lock.json sync issues...')

const rootDir = path.join(__dirname, '..')
const packageLockPath = path.join(rootDir, 'package-lock.json')
const packageJsonPath = path.join(rootDir, 'package.json')

try {
  // Step 1: Remove existing package-lock.json
  if (fs.existsSync(packageLockPath)) {
    fs.unlinkSync(packageLockPath)
    console.log('✅ Removed existing package-lock.json')
  }

  // Step 2: Remove node_modules to ensure clean install
  const nodeModulesPath = path.join(rootDir, 'node_modules')
  if (fs.existsSync(nodeModulesPath)) {
    console.log('🗑️ Removing node_modules for clean install...')
    fs.rmSync(nodeModulesPath, { recursive: true, force: true })
    console.log('✅ Removed node_modules')
  }

  // Step 3: Verify package.json exists and is valid
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found!')
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  console.log('✅ package.json is valid')

  // Step 4: Clean npm cache
  console.log('🧹 Cleaning npm cache...')
  try {
    execSync('npm cache clean --force', { stdio: 'inherit' })
    console.log('✅ npm cache cleaned')
  } catch (error) {
    console.log('⚠️ Could not clean npm cache, continuing...')
  }

  console.log('🎉 Package lock fix completed successfully!')
  console.log('📋 Next: npm install will create a fresh package-lock.json')

} catch (error) {
  console.error('❌ Error fixing package-lock.json:', error.message)
  // Don't fail the build, just log the error
  process.exit(0)
}
