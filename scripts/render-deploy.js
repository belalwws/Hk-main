const { PrismaClient } = require('@prisma/client')
const { execSync } = require('child_process')

const prisma = new PrismaClient()

async function deployToRender() {
  try {
    console.log('🚀 Starting Render deployment process...')
    
    // Step 1: Generate Prisma client
    console.log('🔧 Generating Prisma client...')
    execSync('npx prisma generate --schema ./schema.prisma', { stdio: 'inherit' })
    
    // Step 2: Check database connection
    console.log('🔍 Checking database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Step 3: Check if database is empty or has existing data
    try {
      const userCount = await prisma.user.count()
      console.log(`📊 Found ${userCount} users in database`)
      
      if (userCount > 0) {
        console.log('📝 Database has existing data, running safe update...')
        await safeUpdateDatabase()
      } else {
        console.log('🆕 Database is empty, running initial migration...')
        execSync('npx prisma db push --schema ./schema.prisma', { stdio: 'inherit' })
      }
    } catch (error) {
      console.log('🆕 Database tables don\'t exist, creating them...')
      execSync('npx prisma db push --schema ./schema.prisma', { stdio: 'inherit' })
    }
    
    console.log('🎉 Database deployment completed successfully!')
    
  } catch (error) {
    console.error('❌ Deployment failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function safeUpdateDatabase() {
  try {
    console.log('🔧 Running safe database updates...')
    
    // Check if the new columns already exist
    try {
      await prisma.$queryRaw`SELECT "updatedAt", "additionalInfo" FROM "participants" LIMIT 1`
      console.log('✅ New columns already exist, no update needed')
      return
    } catch (error) {
      console.log('📝 Adding new columns...')
    }

    // Add updatedAt column if it doesn't exist
    try {
      await prisma.$executeRaw`
        ALTER TABLE "participants" 
        ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      `
      console.log('✅ Added updatedAt column')
    } catch (error) {
      console.log('⚠️ updatedAt column might already exist')
    }

    // Add additionalInfo column if it doesn't exist
    try {
      await prisma.$executeRaw`
        ALTER TABLE "participants" 
        ADD COLUMN IF NOT EXISTS "additionalInfo" JSONB
      `
      console.log('✅ Added additionalInfo column')
    } catch (error) {
      console.log('⚠️ additionalInfo column might already exist')
    }

    // Update existing records
    try {
      const result = await prisma.$executeRaw`
        UPDATE "participants" 
        SET "updatedAt" = "registeredAt" 
        WHERE "updatedAt" IS NULL
      `
      console.log(`✅ Updated ${result} existing records`)
    } catch (error) {
      console.log('⚠️ Could not update existing records')
    }

    console.log('🎉 Safe database update completed!')
    
  } catch (error) {
    console.error('❌ Error in safe database update:', error)
    throw error
  }
}

// Run deployment
deployToRender()
  .then(() => {
    console.log('✅ Render deployment completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Render deployment failed:', error)
    process.exit(1)
  })
