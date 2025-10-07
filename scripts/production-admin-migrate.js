const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createAdminTables() {
  try {
    console.log('🚀 بدء إنشاء جداول نظام المشرفين...')

    // Create AdminApplication table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "admin_applications" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "hackathonId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT,
        "bio" TEXT,
        "experience" TEXT,
        "expertise" TEXT,
        "linkedin" TEXT,
        "twitter" TEXT,
        "website" TEXT,
        "profileImage" TEXT,
        "motivation" TEXT,
        "availability" TEXT,
        "previousWork" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "reviewedBy" TEXT,
        "reviewNotes" TEXT,
        "rejectionReason" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "reviewedAt" TIMESTAMP
      );
    `

    console.log('✅ تم إنشاء جدول admin_applications')

    // Create AdminFormDesign table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "admin_form_designs" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "hackathonId" TEXT NOT NULL UNIQUE,
        "isEnabled" BOOLEAN NOT NULL DEFAULT true,
        "coverImage" TEXT,
        "primaryColor" TEXT NOT NULL DEFAULT '#01645e',
        "secondaryColor" TEXT NOT NULL DEFAULT '#3ab666',
        "accentColor" TEXT NOT NULL DEFAULT '#c3e956',
        "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
        "title" TEXT,
        "description" TEXT,
        "welcomeMessage" TEXT,
        "successMessage" TEXT,
        "logoUrl" TEXT,
        "customCss" TEXT,
        "settings" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `

    console.log('✅ تم إنشاء جدول admin_form_designs')

    // Create indexes for better performance
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "admin_applications_hackathonId_idx" ON "admin_applications"("hackathonId");
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "admin_applications_email_idx" ON "admin_applications"("email");
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "admin_applications_status_idx" ON "admin_applications"("status");
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "admin_form_designs_hackathonId_idx" ON "admin_form_designs"("hackathonId");
    `

    console.log('✅ تم إنشاء الفهارس')

    console.log('🎉 تم إنشاء جميع جداول نظام المشرفين بنجاح!')

  } catch (error) {
    console.error('❌ خطأ في إنشاء الجداول:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
if (require.main === module) {
  createAdminTables()
    .then(() => {
      console.log('✅ Migration مكتمل')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration فشل:', error)
      process.exit(1)
    })
}

module.exports = { createAdminTables }
