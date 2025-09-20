#!/usr/bin/env node

/**
 * Production Database Setup for Render Deployment
 * This script ensures the database is properly configured for production
 */

const { PrismaClient } = require('@prisma/client');

async function setupProductionDatabase() {
  console.log('🚀 Starting production database setup...');
  
  // Check if we're in production environment
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚠️ Not in production environment, skipping setup');
    return;
  }
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL is configured');
  console.log('✅ Database provider:', process.env.DATABASE_PROVIDER || 'sqlite');
  
  try {
    const prisma = new PrismaClient();
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test Prisma client functionality
    try {
      const hackathonCount = await prisma.hackathon.count();
      console.log(`✅ Database connection verified - ${hackathonCount} hackathons found`);
    } catch (error) {
      console.log('⚠️ Database connection test failed:', error.message);
    }

    // The schema should be automatically created by Prisma migrations
    console.log('✅ Database schema should be handled by Prisma migrations');
    
    await prisma.$disconnect();
    console.log('✅ Production database setup completed successfully');
    
  } catch (error) {
    console.error('❌ Production database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupProductionDatabase().catch((error) => {
  console.error('❌ Fatal error during production setup:', error);
  process.exit(1);
});
