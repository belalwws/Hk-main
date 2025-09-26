#!/usr/bin/env node

/**
 * Force Clean Install Script
 * This script completely bypasses package-lock.json issues
 * by removing all cached files and doing a fresh install
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚨 Force clean install starting...')

try {
  const rootDir = path.join(__dirname, '..')
  
  // Step 1: Remove all package management files
  const filesToRemove = [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'npm-shrinkwrap.json'
  ]
  
  filesToRemove.forEach(file => {
    const filePath = path.join(rootDir, file)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`✅ Removed ${file}`)
    }
  })
  
  // Step 2: Remove node_modules completely
  const nodeModulesPath = path.join(rootDir, 'node_modules')
  if (fs.existsSync(nodeModulesPath)) {
    console.log('🗑️ Removing node_modules...')
    fs.rmSync(nodeModulesPath, { recursive: true, force: true })
    console.log('✅ Removed node_modules')
  }
  
  // Step 3: Clear npm cache
  try {
    console.log('🧹 Clearing npm cache...')
    execSync('npm cache clean --force', { stdio: 'inherit' })
    console.log('✅ Cleared npm cache')
  } catch (error) {
    console.log('⚠️ Could not clear npm cache:', error.message)
  }
  
  // Step 4: Ensure critical directories exist
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
  
  // Step 5: Install dependencies with force flags
  console.log('📦 Installing dependencies with --legacy-peer-deps...')
  try {
    execSync('npm install --legacy-peer-deps --no-package-lock', { 
      stdio: 'inherit',
      cwd: rootDir 
    })
    console.log('✅ Dependencies installed successfully')
  } catch (error) {
    console.log('⚠️ npm install failed, trying with --force...')
    try {
      execSync('npm install --force --no-package-lock', { 
        stdio: 'inherit',
        cwd: rootDir 
      })
      console.log('✅ Dependencies installed with --force')
    } catch (forceError) {
      console.error('❌ Both install methods failed:', forceError.message)
      throw forceError
    }
  }
  
  console.log('🎉 Force clean install completed!')
  console.log('📦 Ready for Prisma generation and build')
  
} catch (error) {
  console.error('❌ Force clean install failed:', error.message)
  // Don't fail the build completely
  console.log('⚠️ Continuing with existing setup...')
  process.exit(0)
}
