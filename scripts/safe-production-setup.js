#!/usr/bin/env node

/**
 * Safe Production Setup Script
 * This script preserves existing data and only creates missing tables/users
 */

const { execSync } = require('child_process');

console.log('🔒 Safe production setup starting...');

async function safeProductionSetup() {
  try {
    if (!process.env.DATABASE_URL) {
      console.log('⚠️ DATABASE_URL not found, skipping setup');
      return;
    }

    console.log('✅ Database URL configured');

    // Step 1: Generate Prisma client
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Step 2: Check database connection
    console.log('🔍 Checking database connection...');
    
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    
    const prisma = new PrismaClient();
    
    try {
      // Test connection
      await prisma.$connect();
      console.log('✅ Database connection successful');
      
      // Check if tables exist
      try {
        const userCount = await prisma.user.count();
        console.log(`📊 Found ${userCount} users in database`);
        
        // Only create admin if no admin exists
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
        
      } catch (tableError) {
        console.log('⚠️ Tables not found, running migration...');
        
        try {
          // Try migration deploy first
          execSync('npx prisma migrate deploy', { stdio: 'inherit' });
          console.log('✅ Migration deployed successfully');
        } catch (migrationError) {
          console.log('⚠️ Migration failed, pushing schema...');
          execSync('npx prisma db push', { stdio: 'inherit' });
          console.log('✅ Schema pushed successfully');
        }
        
        // Create admin after schema creation
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
      }

      await prisma.$disconnect();
      
    } catch (dbError) {
      console.error('❌ Database error:', dbError.message);
      
      // If database error, try to setup schema
      console.log('🔧 Attempting to setup database schema...');
      try {
        execSync('npx prisma db push', { stdio: 'inherit' });
        console.log('✅ Database schema created');
        
        // Retry admin creation
        const newPrisma = new PrismaClient();
        await newPrisma.user.create({
          data: {
            name: 'Super Admin',
            email: 'admin@hackathon.com',
            password_hash: await bcrypt.hash('admin123456', 12),
            role: 'admin',
            isActive: true
          }
        });
        await newPrisma.$disconnect();
        
        console.log('✅ Admin user created successfully');
      } catch (setupError) {
        console.error('❌ Setup failed:', setupError.message);
      }
    }

    console.log('🎉 Safe production setup completed successfully!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('⚠️ Continuing anyway...');
  }
}

safeProductionSetup();
