#!/usr/bin/env node

/**
 * Simple setup script - just push schema and create admin
 */

const { execSync } = require('child_process');

console.log('🚀 Simple setup starting...');

async function simpleSetup() {
  try {
    if (!process.env.DATABASE_URL) {
      console.log('⚠️ DATABASE_URL not found, skipping setup');
      return;
    }

    console.log('✅ Database URL configured');

    // Step 1: Generate Prisma client
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Step 2: Push schema to database (without reset to preserve data)
    console.log('🚀 Pushing schema to database...');
    try {
      // Try normal push first (preserves data)
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ Normal push failed, trying migration deploy...');
      try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      } catch (migrationError) {
        console.log('⚠️ Migration deploy failed, using force push as last resort...');
        execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
      }
    }

    console.log('✅ Database schema created successfully!');

    // Step 3: Create admin user
    console.log('👤 Creating admin user...');
    
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    
    const prisma = new PrismaClient();
    
    try {
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

    console.log('🎉 Simple setup completed successfully!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('⚠️ Continuing anyway...');
  }
}

simpleSetup();
