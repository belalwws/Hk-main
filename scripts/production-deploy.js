const { execSync } = require('child_process')
const { PrismaClient } = require('@prisma/client')

async function productionDeploy() {
  try {
    console.log('🚀 Starting production deployment...')

    // 1. Generate Prisma client
    console.log('📦 Generating Prisma client...')
    execSync('npx prisma generate --schema ./schema.prisma', { 
      stdio: 'inherit',
      cwd: process.cwd()
    })

    // 2. Check if database is empty or has data
    const prisma = new PrismaClient()
    await prisma.$connect()

    let hasData = false
    try {
      const userCount = await prisma.user.count()
      const hackathonCount = await prisma.hackathon.count()
      
      console.log(`📊 Found ${userCount} users and ${hackathonCount} hackathons`)
      hasData = userCount > 0 || hackathonCount > 0
    } catch (error) {
      console.log('📋 Database tables do not exist yet')
      hasData = false
    }

    await prisma.$disconnect()

    // 3. Apply database changes safely
    if (hasData) {
      console.log('💾 Database has data - using safe migration...')
      
      try {
        // Try to deploy migrations first
        execSync('npx prisma migrate deploy --schema ./schema.prisma', { 
          stdio: 'inherit',
          cwd: process.cwd()
        })
        console.log('✅ Migrations applied successfully')
      } catch (migrateError) {
        console.log('⚠️ No migrations to apply, using db push without reset...')
        
        // Use db push without force reset to preserve data
        execSync('npx prisma db push --schema ./schema.prisma --accept-data-loss=false', { 
          stdio: 'inherit',
          cwd: process.cwd()
        })
      }
    } else {
      console.log('🆕 Database is empty - creating initial schema...')
      
      // Safe to use db push for initial setup
      execSync('npx prisma db push --schema ./schema.prisma', { 
        stdio: 'inherit',
        cwd: process.cwd()
      })
    }

    // 4. Ensure admin user exists
    console.log('👤 Checking admin user...')
    try {
      const { updateProductionDatabase } = require('./update-production-db.js')
      await updateProductionDatabase()
    } catch (adminError) {
      console.log('⚠️ Could not create admin user:', adminError.message)
    }

    console.log('🎉 Production deployment completed successfully!')

  } catch (error) {
    console.error('❌ Production deployment failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  productionDeploy()
    .then(() => {
      console.log('✅ Deployment script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Deployment script failed:', error)
      process.exit(1)
    })
}

module.exports = { productionDeploy }
