#!/usr/bin/env node

/**
 * Production setup script - runs automatically on start
 * This ensures database is ready without needing Shell access
 */

const { execSync } = require('child_process');

console.log('🚀 Production setup starting...');

async function setupProduction() {
  try {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ Not in production mode, skipping setup');
      return;
    }

    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      console.log('⚠️ DATABASE_URL not found, skipping database setup');
      return;
    }

    console.log('✅ Production environment detected');
    console.log('✅ Database URL configured');

    // Wait for database to be ready
    console.log('⏳ Waiting for database...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check if tables exist, if not run migration
    console.log('🔍 Checking database schema...');
    try {
      const { PrismaClient } = require('@prisma/client');
      const testPrisma = new PrismaClient();

      // Try to query users table
      await testPrisma.user.findFirst();
      console.log('✅ Database schema exists');
      await testPrisma.$disconnect();

    } catch (schemaError) {
      console.log('📋 Database schema missing, running migration...');
      try {
        execSync('npx prisma migrate deploy', {
          stdio: 'inherit',
          cwd: process.cwd()
        });
        console.log('✅ Migration completed successfully');
      } catch (migrationError) {
        console.error('❌ Migration failed:', migrationError.message);
        console.log('⚠️ Continuing without migration');
      }
    }

    // Check if we need to seed admin
    console.log('🔍 Checking admin user...');
    try {
      // Use require instead of import for better compatibility
      const { PrismaClient } = require('@prisma/client');
      const bcrypt = require('bcryptjs');

      const prisma = new PrismaClient();

      const adminExists = await prisma.user.findFirst({
        where: { role: 'admin' }
      });

      if (!adminExists) {
        console.log('👤 Creating admin user...');

        // Create admin user
        await prisma.user.create({
          data: {
            name: 'Super Admin',
            email: 'admin@hackathon.com',
            password_hash: await bcrypt.hash('admin123456', 12),
            role: 'admin',
            isActive: true
          }
        });

        console.log('✅ Admin user created successfully');
        console.log('📧 Email: admin@hackathon.com');
        console.log('🔑 Password: admin123456');
      } else {
        console.log('✅ Admin user already exists');
      }

      await prisma.$disconnect();

    } catch (dbError) {
      console.error('❌ Database setup error:', dbError.message);
      console.log('⚠️ Continuing without database setup');
    }

    console.log('🎉 Production setup completed!');

  } catch (error) {
    console.error('❌ Setup error:', error.message);
    console.log('⚠️ Continuing with application start');
  }
}

// Run setup
setupProduction().catch(error => {
  console.error('❌ Fatal setup error:', error);
  console.log('⚠️ Starting application anyway');
});
