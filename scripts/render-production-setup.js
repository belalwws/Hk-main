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
    
    // Create hackathon_form_designs table if it doesn't exist (PostgreSQL compatible)
    if (process.env.DATABASE_PROVIDER === 'postgresql') {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS hackathon_form_designs (
          id TEXT PRIMARY KEY,
          "hackathonId" TEXT NOT NULL,
          "isEnabled" BOOLEAN DEFAULT false,
          template TEXT DEFAULT 'modern',
          "htmlContent" TEXT,
          "cssContent" TEXT,
          "jsContent" TEXT,
          settings TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('✅ hackathon_form_designs table ensured (PostgreSQL)');
    } else {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS hackathon_form_designs (
          id TEXT PRIMARY KEY,
          hackathonId TEXT NOT NULL,
          isEnabled BOOLEAN DEFAULT false,
          template TEXT DEFAULT 'modern',
          htmlContent TEXT,
          cssContent TEXT,
          jsContent TEXT,
          settings TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('✅ hackathon_form_designs table ensured (SQLite)');
    }
    
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
