const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixRenderDatabase() {
  try {
    console.log('🔧 Starting Render database fix...')
    
    // Step 1: Check database connection
    console.log('🔍 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Step 2: Check current schema
    console.log('📋 Checking current database schema...')
    
    // Check if password_hash column exists and password doesn't
    try {
      await prisma.$queryRaw`SELECT "password_hash" FROM "users" LIMIT 1`
      console.log('📝 Found password_hash column, need to rename to password')
      
      // Rename password_hash to password
      await prisma.$executeRaw`ALTER TABLE "users" RENAME COLUMN "password_hash" TO "password"`
      console.log('✅ Renamed password_hash to password')
      
      // Make password nullable for simple registration users
      await prisma.$executeRaw`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`
      console.log('✅ Made password column nullable')
      
    } catch (error) {
      console.log('📝 password_hash column not found, checking password column...')
      
      try {
        await prisma.$queryRaw`SELECT "password" FROM "users" LIMIT 1`
        console.log('✅ password column already exists')
        
        // Make sure it's nullable
        await prisma.$executeRaw`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`
        console.log('✅ Made password column nullable')
        
      } catch (passwordError) {
        console.log('📝 Neither password_hash nor password found, adding password column...')
        await prisma.$executeRaw`ALTER TABLE "users" ADD COLUMN "password" TEXT`
        console.log('✅ Added password column')
      }
    }
    
    // Step 3: Add new columns for participants if they don't exist
    console.log('📝 Checking participants table...')
    
    try {
      await prisma.$queryRaw`SELECT "updatedAt" FROM "participants" LIMIT 1`
      console.log('✅ updatedAt column already exists')
    } catch (error) {
      console.log('📝 Adding updatedAt column...')
      await prisma.$executeRaw`
        ALTER TABLE "participants" 
        ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      `
      console.log('✅ Added updatedAt column')
    }
    
    try {
      await prisma.$queryRaw`SELECT "additionalInfo" FROM "participants" LIMIT 1`
      console.log('✅ additionalInfo column already exists')
    } catch (error) {
      console.log('📝 Adding additionalInfo column...')
      await prisma.$executeRaw`
        ALTER TABLE "participants" 
        ADD COLUMN "additionalInfo" JSONB
      `
      console.log('✅ Added additionalInfo column')
    }
    
    // Step 4: Update existing participants with updatedAt
    try {
      const result = await prisma.$executeRaw`
        UPDATE "participants" 
        SET "updatedAt" = "registeredAt" 
        WHERE "updatedAt" = "registeredAt" OR "updatedAt" IS NULL
      `
      console.log(`✅ Updated ${result} participant records with updatedAt`)
    } catch (error) {
      console.log('⚠️ Could not update existing participant records:', error.message)
    }
    
    // Step 5: Verify the fixes
    console.log('🔍 Verifying database schema...')
    
    const userCount = await prisma.user.count()
    const participantCount = await prisma.participant.count()
    
    console.log(`📊 Database verification:`)
    console.log(`   - Users: ${userCount}`)
    console.log(`   - Participants: ${participantCount}`)
    
    console.log('🎉 Render database fix completed successfully!')
    
  } catch (error) {
    console.error('❌ Database fix failed:', error)
    console.error('Error details:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixRenderDatabase()
  .then(() => {
    console.log('✅ Render database fix completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Render database fix failed:', error)
    process.exit(1)
  })
