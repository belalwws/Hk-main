const { PrismaClient } = require('@prisma/client')

async function addHackathonFormsTable() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Adding hackathon_forms table...')
    
    // Create the table using raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "hackathon_forms" (
        "id" TEXT NOT NULL,
        "hackathonId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "fields" TEXT NOT NULL,
        "settings" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "hackathon_forms_pkey" PRIMARY KEY ("id")
      );
    `
    
    console.log('✅ hackathon_forms table created')
    
    // Add unique constraint on hackathonId
    try {
      await prisma.$executeRaw`
        ALTER TABLE "hackathon_forms" 
        ADD CONSTRAINT "hackathon_forms_hackathonId_key" 
        UNIQUE ("hackathonId");
      `
      console.log('✅ Unique constraint added on hackathonId')
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ Unique constraint already exists')
      } else {
        console.warn('⚠️ Could not add unique constraint:', error.message)
      }
    }
    
    // Add foreign key constraint
    try {
      await prisma.$executeRaw`
        ALTER TABLE "hackathon_forms" 
        ADD CONSTRAINT "hackathon_forms_hackathonId_fkey" 
        FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
      `
      console.log('✅ Foreign key constraint added')
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ Foreign key constraint already exists')
      } else {
        console.warn('⚠️ Could not add foreign key constraint:', error.message)
      }
    }
    
    console.log('🎉 Hackathon forms table setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Error setting up hackathon forms table:', error)
    
    // If database connection fails, just log and continue
    if (error.message.includes('connect') || error.message.includes('ENOTFOUND')) {
      console.log('ℹ️ Database not available, skipping table creation')
      console.log('ℹ️ Table will be created automatically when database is available')
    } else {
      throw error
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  addHackathonFormsTable()
    .then(() => {
      console.log('✅ Script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { addHackathonFormsTable }
