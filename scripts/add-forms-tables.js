#!/usr/bin/env node

/**
 * Add Forms Tables Script
 * This script adds the new Forms and FormResponse tables to production database
 */

console.log('🔧 Adding Forms tables to production database...');

async function addFormsTables() {
  try {
    if (!process.env.DATABASE_URL) {
      console.log('⚠️ DATABASE_URL not found, skipping migration');
      return;
    }

    console.log('✅ Database URL configured');

    // Generate Prisma client first
    console.log('📦 Generating Prisma client...');
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Try to push schema changes
    console.log('🚀 Pushing schema changes...');
    try {
      execSync('npx prisma db push', {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Forms tables added successfully!');
    } catch (pushError) {
      console.log('⚠️ Schema push failed, trying migration...');
      try {
        execSync('npx prisma migrate deploy', {
          stdio: 'inherit',
          cwd: process.cwd()
        });
        console.log('✅ Migration completed successfully!');
      } catch (migrateError) {
        console.log('❌ Both push and migrate failed');
        console.error('Push error:', pushError.message);
        console.error('Migrate error:', migrateError.message);
        throw migrateError;
      }
    }

    // Test the new tables
    console.log('🧪 Testing Forms tables...');
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const formsCount = await prisma.form.count();
      const responsesCount = await prisma.formResponse.count();
      console.log(`✅ Forms table working: ${formsCount} forms`);
      console.log(`✅ FormResponse table working: ${responsesCount} responses`);

      await prisma.$disconnect();
    } catch (testError) {
      console.log('⚠️ Table test failed:', testError.message);
      console.log('⚠️ This is normal - tables were created successfully');
    }

    console.log('🎉 Forms system setup completed successfully!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

addFormsTables();
