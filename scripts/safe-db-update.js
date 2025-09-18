const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function safeUpdateDatabase() {
  try {
    console.log('🔍 Checking database schema...')
    
    // Check if the new columns already exist
    try {
      // Try to query the new columns to see if they exist
      await prisma.$queryRaw`SELECT "updatedAt", "additionalInfo" FROM "participants" LIMIT 1`
      console.log('✅ New columns already exist, no update needed')
      return
    } catch (error) {
      console.log('📝 New columns need to be added')
    }

    console.log('🔧 Adding new columns safely...')
    
    // Add updatedAt column if it doesn't exist
    try {
      await prisma.$executeRaw`
        ALTER TABLE "participants" 
        ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      `
      console.log('✅ Added updatedAt column')
    } catch (error) {
      console.log('⚠️ updatedAt column might already exist:', error.message)
    }

    // Add additionalInfo column if it doesn't exist
    try {
      await prisma.$executeRaw`
        ALTER TABLE "participants" 
        ADD COLUMN IF NOT EXISTS "additionalInfo" JSONB
      `
      console.log('✅ Added additionalInfo column')
    } catch (error) {
      console.log('⚠️ additionalInfo column might already exist:', error.message)
    }

    // Update existing records to have updatedAt = registeredAt
    try {
      const result = await prisma.$executeRaw`
        UPDATE "participants" 
        SET "updatedAt" = "registeredAt" 
        WHERE "updatedAt" IS NULL OR "updatedAt" = "registeredAt"
      `
      console.log(`✅ Updated ${result} existing records with updatedAt`)
    } catch (error) {
      console.log('⚠️ Could not update existing records:', error.message)
    }

    console.log('🎉 Database update completed successfully!')
    
  } catch (error) {
    console.error('❌ Error updating database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the update
safeUpdateDatabase()
  .then(() => {
    console.log('✅ Safe database update completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Safe database update failed:', error)
    process.exit(1)
  })
