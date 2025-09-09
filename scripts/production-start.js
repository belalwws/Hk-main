#!/usr/bin/env node

/**
 * Production Start Script
 * Checks for migrations and starts the app
 */

console.log('🚀 Production start script...');

async function productionStart() {
  try {
    const { execSync } = require('child_process');

    // Check if we need to run migrations
    if (process.env.RUN_MIGRATION === 'true') {
      console.log('🔧 Running migration before start...');
      try {
        execSync('npm run add-forms', { stdio: 'inherit' });
        console.log('✅ Migration completed');
      } catch (migrationError) {
        console.log('⚠️ Migration failed, continuing anyway...');
        console.error(migrationError.message);
      }
    }

    // Start the application
    console.log('🚀 Starting Next.js application...');
    execSync('next start', { stdio: 'inherit' });

  } catch (error) {
    console.error('❌ Start failed:', error.message);
    process.exit(1);
  }
}

productionStart();
