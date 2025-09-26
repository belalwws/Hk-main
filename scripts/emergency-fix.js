#!/usr/bin/env node

/**
 * Emergency fix for package-lock.json sync issues
 * This script fixes dependency conflicts and ensures clean build
 */

const fs = require('fs')
const path = require('path')

console.log('🚨 Emergency package fix starting...')

try {
  const rootDir = path.join(__dirname, '..')

  // Step 1: Remove package-lock.json to force regeneration
  const packageLockPath = path.join(rootDir, 'package-lock.json')
  if (fs.existsSync(packageLockPath)) {
    fs.unlinkSync(packageLockPath)
    console.log('✅ Removed out-of-sync package-lock.json')
  } else {
    console.log('ℹ️ No package-lock.json found')
  }

  // Step 2: Remove node_modules for clean install
  const nodeModulesPath = path.join(rootDir, 'node_modules')
  if (fs.existsSync(nodeModulesPath)) {
    console.log('🗑️ Removing node_modules for clean install...')
    fs.rmSync(nodeModulesPath, { recursive: true, force: true })
    console.log('✅ Removed node_modules')
  } else {
    console.log('ℹ️ No node_modules found')
  }

  // Step 3: Ensure critical directories exist
  const criticalDirs = [
    'public/uploads',
    'public/certificates',
    'data/backups',
    'data/snapshots',
    'data/reports'
  ]

  criticalDirs.forEach(dir => {
    const dirPath = path.join(rootDir, dir)
    if (!fs.existsSync(dirPath)) {
      try {
        fs.mkdirSync(dirPath, { recursive: true })
        console.log(`✅ Created directory: ${dir}`)
      } catch (error) {
        console.log(`⚠️ Could not create directory ${dir}:`, error.message)
      }
    }
  })

  // Step 4: Validate package.json
  const packagePath = path.join(rootDir, 'package.json')
  if (fs.existsSync(packagePath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
      console.log('📦 Package.json validation:')
      console.log(`   - Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`)
      console.log(`   - DevDependencies: ${Object.keys(packageJson.devDependencies || {}).length}`)
    } catch (error) {
      console.log('⚠️ Could not validate package.json:', error.message)
    }
  }

  console.log('🎉 Emergency fix completed!')
  console.log('📦 Ready for fresh npm install with --legacy-peer-deps')

} catch (error) {
  console.error('❌ Emergency fix failed:', error.message)
  // Don't fail the build
  process.exit(0)
}
