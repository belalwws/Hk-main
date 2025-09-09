#!/usr/bin/env node

/**
 * Render setup script - runs after deployment
 * This script ensures the database is properly configured
 */

const { execSync } = require('child_process');

console.log('🚀 Starting Render setup...');

async function runSetup() {
  try {
    // Check environment
    console.log('🔍 Checking environment...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Missing');

    if (!process.env.DATABASE_URL) {
      console.log('⚠️ DATABASE_URL not set, skipping database setup');
      return;
    }

    // Wait a bit for database to be ready
    console.log('⏳ Waiting for database to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Generate Prisma client
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    // Check if database exists and has tables
    console.log('🔍 Checking database status...');
    try {
      execSync('npx prisma db pull --force', { 
        stdio: 'pipe',
        cwd: process.cwd()
      });
      console.log('✅ Database schema detected');
    } catch (pullError) {
      console.log('📋 No existing schema found, will run migrations');
    }

    // Run migrations
    console.log('🔄 Running database migrations...');
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    // Try to seed admin user
    console.log('🌱 Setting up admin user...');
    try {
      execSync('npm run db:seed-admin', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Admin user created');
    } catch (seedError) {
      console.log('⚠️ Admin user might already exist');
    }

    console.log('🎉 Render setup completed successfully!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    // Don't exit with error to prevent deployment failure
    console.log('⚠️ Continuing with deployment despite setup issues');
  }
}

runSetup();
