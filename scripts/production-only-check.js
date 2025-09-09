#!/usr/bin/env node

/**
 * Production Check Script - NEVER RESETS DATA
 * This script only checks and creates missing admin user
 * NO DATABASE SCHEMA CHANGES
 */

console.log('🔍 Production check starting (NO DATA RESET)...');

async function productionCheck() {
  try {
    if (!process.env.DATABASE_URL) {
      console.log('⚠️ DATABASE_URL not found, skipping check');
      return;
    }

    console.log('✅ Database URL configured');

    // Only generate Prisma client - NO SCHEMA CHANGES
    console.log('📦 Generating Prisma client...');
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });

    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    
    const prisma = new PrismaClient();
    
    try {
      // Test connection only
      await prisma.$connect();
      console.log('✅ Database connection successful');
      
      // Check if admin exists - NO TABLE CREATION
      try {
        const adminExists = await prisma.user.findFirst({
          where: { role: 'admin' }
        });

        if (!adminExists) {
          console.log('👤 Creating admin user...');
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
        
        // Count existing data
        const userCount = await prisma.user.count();
        const hackathonCount = await prisma.hackathon.count();
        
        console.log(`📊 Database status:`);
        console.log(`   - Users: ${userCount}`);
        console.log(`   - Hackathons: ${hackathonCount}`);
        
      } catch (tableError) {
        console.log('⚠️ Tables not found - this is a fresh database');
        console.log('🚨 STOPPING - Need manual schema setup');
        console.log('🔧 Please run: npx prisma db push');
        // Don't create schema automatically to prevent data loss
      }

      await prisma.$disconnect();
      
    } catch (dbError) {
      console.log('⚠️ Database connection failed:', dbError.message);
      console.log('🚨 STOPPING - Database not ready');
    }

    console.log('🎉 Production check completed!');

  } catch (error) {
    console.log('⚠️ Check failed:', error.message);
    console.log('🚀 Continuing with app start...');
  }
}

productionCheck();
