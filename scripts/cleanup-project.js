const fs = require('fs')
const path = require('path')

// Files and directories to remove
const filesToRemove = [
  // Documentation files (keep only essential ones)
  'ADVANCED_LANDING_SYSTEM.md',
  'API_500_ERROR_FIX.md',
  'COMPLETE_FIX_SUMMARY.md',
  'COMPLETE_SOLUTION.md',
  'CSS_LANDING_FIX.md',
  'DATABASE_PERSISTENCE_GUIDE.md',
  'DATA_PERSISTENCE_SOLUTION.md',
  'EMAIL_TEMPLATES_GUIDE.md',
  'FINAL_API_500_FIX_COMPLETE.md',
  'FINAL_SOLUTION.md',
  'FINAL_SUCCESS.md',
  'FORM_DESIGN_BUTTON_FIX.md',
  'FORM_DESIGN_PAGE_FIX.md',
  'FORM_DESIGN_SYSTEM.md',
  'HYDRATION_FIX.md',
  'LANDING_UPDATE_FIX.md',
  'NEXTJS15_FIXES.md',
  'QUICK_FIX.md',
  'RENDER_DEPLOYMENT.md',
  'SUCCESS_SUMMARY.md',

  // Test and debug files
  'check-hackathon-structure.js',
  'check-hackathons.js',
  'check-landing.js',
  'check-participants-table.js',
  'check-table-structure.js',
  'create-form-design-table.js',
  'create-landing-page.js',
  'create-test-form.js',
  'final-fix.js',
  'fix-status.js',
  'simple-fix.js',
  'test-admin-api.js',
  'test-api.js',
  'test-current-db.js',
  'test-fixed-admin-api.js',
  'test-fixed-db.js',
  'test-form-design-api.js',
  'test-form-design-page.html',
  'test-form-fix.js',
  'test-hackathon-api.js',
  'test-landing-update.js',

  // Batch files
  'create-fresh-db.bat',
  'force-switch-db.bat',
  'start-final.bat',
  'start-local.bat',
  'start-with-fixed-db.bat',
  'switch-to-new-db.bat',

  // Old database files
  'dev_backup.db',
  'dev_fixed.db',
  'dev_new.db',
  'dev_working.db',

  // Unnecessary scripts
  'scripts/add-forms-tables.js',
  'scripts/add-global-settings-table.js',
  'scripts/add-hackathon-forms-table.js',
  'scripts/add-landing-pages-table.js',
  'scripts/create-advanced-landing.js',
  'scripts/create-database-tables.js',
  'scripts/create-final-db.js',
  'scripts/delete-all-users-except-admin.js',
  'scripts/fix-500-error.js',
  'scripts/fix-all-missing-columns.js',
  'scripts/fix-api-errors.js',
  'scripts/fix-database-persistence.js',
  'scripts/fix-form-issues.js',
  'scripts/fix-missing-columns.js',
  'scripts/fix-render-db.js',
  'scripts/fix-routing-conflicts.js',
  'scripts/form-templates-generator.js',
  'scripts/landing-builder.js',
  'scripts/no-db-setup.js',
  'scripts/prepare-production.js',
  'scripts/preserve-data-on-deploy.js',
  'scripts/production-db-setup.js',
  'scripts/production-only-check.js',
  'scripts/production-setup.js',
  'scripts/production-start.js',
  'scripts/recreate-database.js',
  'scripts/render-build.sh',
  'scripts/render-deploy.js',
  'scripts/render-production-setup.js',
  'scripts/render-setup.js',
  'scripts/safe-db-update.js',
  'scripts/safe-production-setup.js',
  'scripts/setup-local-db.js',
  'scripts/simple-setup.js',
  'scripts/test-all-apis.js',
  'scripts/test-api.js',
  'scripts/test-email-templates.js',
  'scripts/tst.html',

  // Vercel config (using Render)
  'vercel.json'
]

function cleanupProject() {
  console.log('🧹 Starting project cleanup...')
  
  let removedCount = 0
  let errorCount = 0

  filesToRemove.forEach(filePath => {
    try {
      const fullPath = path.join(process.cwd(), filePath)
      
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath)
        
        if (stats.isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true })
          console.log(`🗂️  Removed directory: ${filePath}`)
        } else {
          fs.unlinkSync(fullPath)
          console.log(`📄 Removed file: ${filePath}`)
        }
        
        removedCount++
      } else {
        console.log(`⚠️  File not found: ${filePath}`)
      }
    } catch (error) {
      console.error(`❌ Error removing ${filePath}:`, error.message)
      errorCount++
    }
  })

  console.log(`\n✅ Cleanup completed!`)
  console.log(`📊 Files removed: ${removedCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  
  // Show remaining important files
  console.log('\n📋 Important files kept:')
  console.log('- README.md (project documentation)')
  console.log('- package.json (dependencies)')
  console.log('- schema.prisma (production database)')
  console.log('- schema.dev.prisma (development database)')
  console.log('- scripts/create-admin.js (admin creation)')
  console.log('- scripts/create-working-admin.js (working admin)')
  console.log('- scripts/cleanup-project.js (this script)')
  console.log('- All app/ and components/ files (main application)')
}

cleanupProject()
