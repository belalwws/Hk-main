/**
 * Script to create missing database tables
 * Run this if Judge, Score, or other tables are missing
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createMissingTables() {
  console.log('🔧 Checking and creating missing database tables...')
  
  try {
    // Test if Judge table exists
    console.log('📋 Testing Judge table...')
    try {
      await prisma.judge.findFirst()
      console.log('✅ Judge table exists')
    } catch (error) {
      console.log('❌ Judge table missing, will be created by Prisma migration')
    }

    // Test if Score table exists
    console.log('📋 Testing Score table...')
    try {
      await prisma.score.findFirst()
      console.log('✅ Score table exists')
    } catch (error) {
      console.log('❌ Score table missing, will be created by Prisma migration')
    }

    // Test if Criterion table exists
    console.log('📋 Testing Criterion table...')
    try {
      await prisma.criterion.findFirst()
      console.log('✅ Criterion table exists')
    } catch (error) {
      console.log('❌ Criterion table missing, will be created by Prisma migration')
    }

    // Run Prisma migration to create missing tables
    console.log('🔄 Running Prisma migration to create missing tables...')
    
    // This will create all missing tables based on schema.prisma
    const { exec } = require('child_process')
    const util = require('util')
    const execPromise = util.promisify(exec)

    try {
      // Generate Prisma client (creates tables if they don't exist)
      console.log('📦 Generating Prisma client...')
      await execPromise('npx prisma generate')
      console.log('✅ Prisma client generated')

      // Push schema to database (creates missing tables)
      console.log('📤 Pushing schema to database...')
      await execPromise('npx prisma db push --accept-data-loss')
      console.log('✅ Schema pushed to database')

    } catch (migrationError) {
      console.error('❌ Migration failed:', migrationError.message)
      
      // Fallback: Try to create tables manually using raw SQL
      console.log('🔄 Trying manual table creation...')
      
      try {
        // Create Judge table
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Judge" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "hackathonId" TEXT NOT NULL,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
            FOREIGN KEY ("hackathonId") REFERENCES "Hackathon" ("id") ON DELETE CASCADE
          )
        `
        console.log('✅ Judge table created')

        // Create Criterion table
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Criterion" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "hackathonId" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "description" TEXT,
            "weight" REAL NOT NULL DEFAULT 1.0,
            "maxScore" INTEGER NOT NULL DEFAULT 10,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY ("hackathonId") REFERENCES "Hackathon" ("id") ON DELETE CASCADE
          )
        `
        console.log('✅ Criterion table created')

        // Create Score table
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Score" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "judgeId" TEXT NOT NULL,
            "teamId" TEXT NOT NULL,
            "hackathonId" TEXT NOT NULL,
            "criterionId" TEXT NOT NULL,
            "score" REAL NOT NULL,
            "feedback" TEXT,
            "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY ("judgeId") REFERENCES "Judge" ("id") ON DELETE CASCADE,
            FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE,
            FOREIGN KEY ("hackathonId") REFERENCES "Hackathon" ("id") ON DELETE CASCADE,
            FOREIGN KEY ("criterionId") REFERENCES "Criterion" ("id") ON DELETE CASCADE
          )
        `
        console.log('✅ Score table created')

      } catch (sqlError) {
        console.error('❌ Manual table creation failed:', sqlError.message)
        console.log('💡 This might be because you\'re using PostgreSQL. Tables will be created automatically on first deployment.')
      }
    }

    // Test tables again
    console.log('🧪 Testing tables after creation...')
    
    try {
      await prisma.judge.findFirst()
      console.log('✅ Judge table working')
    } catch (error) {
      console.log('⚠️ Judge table still not accessible')
    }

    try {
      await prisma.score.findFirst()
      console.log('✅ Score table working')
    } catch (error) {
      console.log('⚠️ Score table still not accessible')
    }

    console.log('🎉 Database setup completed!')
    console.log('💡 If tables are still missing, they will be created automatically on Render deployment.')

  } catch (error) {
    console.error('❌ Error setting up database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  createMissingTables()
    .then(() => {
      console.log('✅ Script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { createMissingTables }
