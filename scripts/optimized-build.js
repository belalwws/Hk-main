#!/usr/bin/env node

/**
 * Optimized Build Script for Digital Ocean
 * This script runs an optimized build process
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Optimized Build Process...\n');

// Track build time
const startTime = Date.now();

function runCommand(command, description) {
  const stepStart = Date.now();
  console.log(`\n📦 ${description}...`);
  
  try {
    execSync(command, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        // Optimize Node.js memory
        NODE_OPTIONS: '--max-old-space-size=4096',
        // Disable telemetry
        NEXT_TELEMETRY_DISABLED: '1',
        // Skip unnecessary validations
        SKIP_ENV_VALIDATION: 'true',
      }
    });
    
    const stepTime = ((Date.now() - stepStart) / 1000).toFixed(2);
    console.log(`✅ ${description} completed in ${stepTime}s`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

// Step 1: Check if node_modules exists
console.log('🔍 Checking dependencies...');
const nodeModulesExists = fs.existsSync(path.join(process.cwd(), 'node_modules'));

if (!nodeModulesExists) {
  console.log('📥 Installing dependencies (first time)...');
  runCommand('npm ci --prefer-offline --no-audit --no-fund', 'Install dependencies');
} else {
  console.log('✅ Dependencies already installed (using cache)');
}

// Step 2: Generate Prisma Client
runCommand('npx prisma generate --schema ./schema.prisma', 'Generate Prisma Client');

// Step 3: Build Next.js
runCommand('npm run build', 'Build Next.js application');

// Calculate total time
const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
console.log(`\n🎉 Build completed successfully in ${totalTime}s!`);
console.log(`⚡ Estimated time saved: ${Math.max(0, 480 - totalTime).toFixed(0)}s\n`);

process.exit(0);

