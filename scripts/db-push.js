#!/usr/bin/env node

/**
 * Database push script - uses db push instead of migrations
 * This is more reliable for initial deployment
 */

const { execSync } = require('child_process');

console.log('🚀 Database push starting...');

async function pushDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      console.log('⚠️ DATABASE_URL not found, skipping database setup');
      return;
    }

    console.log('✅ Database URL configured');

    // Generate Prisma client first
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    // Push database schema
    console.log('🚀 Pushing database schema...');
    execSync('npx prisma db push --force-reset', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log('✅ Database schema pushed successfully!');

    // Wait a moment for database to be ready
    console.log('⏳ Waiting for database to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create admin user
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

    console.log('🎉 Database push completed successfully!');

  } catch (error) {
    console.error('❌ Database push failed:', error.message);
    process.exit(1);
  }
}

pushDatabase();
