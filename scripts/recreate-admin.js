#!/usr/bin/env node

/**
 * Recreate Admin Script - MANUAL EXECUTION ONLY
 * This script recreates the admin user if lost
 * Run manually: node scripts/recreate-admin.js
 */

console.log('🔧 Recreating admin user...');

async function recreateAdmin() {
  try {
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL not found');
      return;
    }

    console.log('✅ Database URL configured');

    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful');
      
      // Check if admin exists
      const adminExists = await prisma.user.findFirst({
        where: { role: 'admin' }
      });

      if (adminExists) {
        console.log('✅ Admin user already exists:', adminExists.email);
        console.log('🔑 If you forgot the password, delete this user first');
        return;
      }

      // Create admin user
      console.log('👤 Creating admin user...');
      const admin = await prisma.user.create({
        data: {
          name: 'Super Admin',
          email: 'admin@hackathon.com',
          password_hash: await bcrypt.hash('admin123456', 12),
          role: 'admin',
          isActive: true
        }
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@hackathon.com');
      console.log('🔑 Password: admin123456');
      
      await prisma.$disconnect();
      
    } catch (dbError) {
      console.error('❌ Database error:', dbError.message);
    }

  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

recreateAdmin();
