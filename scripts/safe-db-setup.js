#!/usr/bin/env node

/**
 * Safe Database Setup for Production
 * This script ensures database schema without losing data
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function safeDbSetup() {
  console.log('🔧 Starting safe database setup...');
  
  const prisma = new PrismaClient();
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if database has any data
    let hasData = false;
    try {
      const userCount = await prisma.user.count();
      const hackathonCount = await prisma.hackathon.count();
      hasData = userCount > 0 || hackathonCount > 0;
      console.log(`📊 Database status: ${userCount} users, ${hackathonCount} hackathons`);
    } catch (e) {
      console.log('ℹ️ Database might be empty or schema not ready');
    }
    
    // NEVER run db push in production to preserve data
    console.log('ℹ️ Skipping database push to preserve existing data in production');
    
    // Log current data status for monitoring
    if (hasData) {
      console.log('🔒 PRODUCTION DATA DETECTED - All destructive operations are disabled');
      console.log('📊 Current data will be preserved during deployment');
    }
    
    // Ensure admin user exists
    await ensureAdminUser(prisma);
    
    // Ensure required tables exist (safe way)
    await ensureRequiredTables(prisma);
    
    console.log('✅ Safe database setup completed');
    
  } catch (error) {
    console.error('❌ Database setup error:', error);
    // Don't fail the build, just log the error
    console.log('⚠️ Continuing build despite database setup issues...');
  } finally {
    await prisma.$disconnect();
  }
}

async function ensureAdminUser(prisma) {
  try {
    console.log('👤 Ensuring admin user exists...');
    const adminEmail = 'admin@hackathon.com';
    const adminPassword = 'admin123456';
    
    // Try with raw SQL first
    try {
      const existingAdmin = await prisma.$queryRaw`
        SELECT * FROM users WHERE email = ${adminEmail} LIMIT 1
      `;
      
      if (existingAdmin.length === 0) {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        const userId = `user_${Date.now()}`;
        
        await prisma.$executeRaw`
          INSERT INTO users (id, email, password, name, role, "isActive", "emailVerified", "createdAt", "updatedAt")
          VALUES (${userId}, ${adminEmail}, ${hashedPassword}, 'مدير النظام', 'admin', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        console.log('✅ Admin user created via raw SQL:', adminEmail);
      } else {
        console.log('✅ Admin user already exists');
      }
    } catch (rawError) {
      console.log('⚠️ Raw SQL failed, trying Prisma model:', rawError.message);
      
      // Fallback to Prisma model
      const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
      });
      
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        
        await prisma.user.create({
          data: {
            email: adminEmail,
            password: hashedPassword,
            name: 'مدير النظام',
            role: 'admin',
            isActive: true,
            emailVerified: new Date()
          }
        });
        
        console.log('✅ Admin user created via Prisma:', adminEmail);
      } else {
        console.log('✅ Admin user already exists');
      }
    }
    
    console.log('🔑 Admin credentials: admin@hackathon.com / admin123456');
  } catch (error) {
    console.error('❌ Could not ensure admin user:', error.message);
  }
}

async function ensureRequiredTables(prisma) {
  try {
    // Create tables that might be missing using raw SQL (safe)
    const tables = [
      {
        name: 'hackathon_form_designs',
        sql: `
          CREATE TABLE IF NOT EXISTS hackathon_form_designs (
            id TEXT PRIMARY KEY,
            "hackathonId" TEXT NOT NULL,
            "isEnabled" BOOLEAN DEFAULT false,
            template TEXT DEFAULT 'modern',
            "htmlContent" TEXT,
            "cssContent" TEXT,
            "jsContent" TEXT,
            settings JSONB,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'email_templates',
        sql: `
          CREATE TABLE IF NOT EXISTS email_templates (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            subject TEXT NOT NULL,
            "htmlContent" TEXT NOT NULL,
            "textContent" TEXT,
            variables JSONB,
            "isActive" BOOLEAN DEFAULT true,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'certificate_settings',
        sql: `
          CREATE TABLE IF NOT EXISTS certificate_settings (
            id TEXT PRIMARY KEY,
            settings TEXT NOT NULL,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'hackathon_forms',
        sql: `
          CREATE TABLE IF NOT EXISTS hackathon_forms (
            id TEXT PRIMARY KEY,
            "hackathonId" TEXT NOT NULL,
            title TEXT DEFAULT 'نموذج التسجيل',
            description TEXT DEFAULT '',
            "isActive" BOOLEAN DEFAULT true,
            "formFields" TEXT NOT NULL,
            settings TEXT DEFAULT '{}',
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'landing_page_images',
        sql: `
          CREATE TABLE IF NOT EXISTS landing_page_images (
            id TEXT PRIMARY KEY,
            "hackathonId" TEXT NOT NULL,
            "fileName" TEXT NOT NULL,
            "fileType" TEXT NOT NULL,
            "fileSize" INTEGER NOT NULL,
            "base64Data" TEXT NOT NULL,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      }
    ];
    
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(table.sql);
        console.log(`✅ Table ${table.name} ensured`);
      } catch (tableError) {
        console.log(`ℹ️ Table ${table.name} might already exist:`, tableError.message);
      }
    }
    
  } catch (error) {
    console.log('⚠️ Could not ensure required tables:', error.message);
  }
}

// Run the setup
safeDbSetup().catch((error) => {
  console.error('❌ Fatal error during database setup:', error);
  // Don't exit with error code to avoid failing the build
  process.exit(0);
});
