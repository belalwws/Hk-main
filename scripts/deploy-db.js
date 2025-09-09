#!/usr/bin/env node

/**
 * Database deployment script for Render
 * This script handles database migration and seeding for production deployment
 */

const { execSync } = require('child_process');

console.log('🚀 Starting database deployment...');

try {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('⚠️ Skipping database setup in development mode');
    return;
  }

  console.log('✅ DATABASE_URL is configured');

  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate --schema ./schema.prisma', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Run database migrations
  console.log('🔄 Running database migrations...');
  execSync('npx prisma migrate deploy --schema ./schema.prisma', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Check if we need to seed the database
  console.log('🌱 Checking if database needs seeding...');
  
  try {
    // Try to run the seed script
    execSync('npm run db:seed-admin', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('✅ Database seeded successfully');
  } catch (seedError) {
    console.log('⚠️ Seeding skipped (admin might already exist)');
  }

  console.log('🎉 Database deployment completed successfully!');

} catch (error) {
  console.error('❌ Database deployment failed:', error.message);
  process.exit(1);
}
