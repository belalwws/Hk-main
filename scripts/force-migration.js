#!/usr/bin/env node

/**
 * Force migration script for Render deployment
 * This script forces the database schema to be created
 */

const { execSync } = require('child_process');

console.log('🔧 Force migration starting...');

async function forceMigration() {
  try {
    if (!process.env.DATABASE_URL) {
      console.log('⚠️ DATABASE_URL not found, skipping migration');
      return;
    }

    console.log('✅ Database URL configured');

    // Generate Prisma client first
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    // Force deploy migrations
    console.log('🚀 Deploying migrations...');
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log('✅ Migration completed successfully!');

    // Try to create admin user
    console.log('👤 Creating admin user...');
    try {
      const { PrismaClient } = require('@prisma/client');
      const bcrypt = require('bcryptjs');
      
      const prisma = new PrismaClient();
      
      // Check if admin exists
      const adminExists = await prisma.user.findFirst({
        where: { role: 'admin' }
      });

      if (!adminExists) {
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
      
    } catch (adminError) {
      console.error('❌ Admin creation error:', adminError.message);
    }

    console.log('🎉 Force migration completed!');

  } catch (error) {
    console.error('❌ Force migration failed:', error.message);
    process.exit(1);
  }
}

forceMigration();
