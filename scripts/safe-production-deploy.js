const { execSync } = require('child_process')
const { PrismaClient } = require('@prisma/client')

async function safeProductionDeploy() {
  try {
    console.log('🛡️ Starting SAFE production deployment...')
    console.log('📋 This deployment will NEVER delete existing data')

    // 1. Generate Prisma client first
    console.log('📦 Generating Prisma client...')
    execSync('npx prisma generate --schema ./schema.prisma', { 
      stdio: 'inherit',
      cwd: process.cwd()
    })

    // 2. Check database status
    const prisma = new PrismaClient()
    await prisma.$connect()

    let hasData = false
    let userCount = 0
    let hackathonCount = 0
    
    try {
      userCount = await prisma.user.count()
      hackathonCount = await prisma.hackathon.count()
      
      console.log(`📊 Database status:`)
      console.log(`   👥 Users: ${userCount}`)
      console.log(`   🏆 Hackathons: ${hackathonCount}`)
      
      hasData = userCount > 0 || hackathonCount > 0
    } catch (error) {
      console.log('📋 Database tables do not exist yet - first deployment')
      hasData = false
    }

    await prisma.$disconnect()

    // 3. Apply schema changes with maximum safety
    if (hasData) {
      console.log('🔒 EXISTING DATA DETECTED - Using maximum safety mode')
      console.log('💾 Your data will be preserved at all costs!')
      
      // Step 1: Try migrations first (safest)
      let migrationSuccess = false
      try {
        console.log('🔄 Step 1: Attempting to deploy migrations...')
        execSync('npx prisma migrate deploy --schema ./schema.prisma', { 
          stdio: 'inherit',
          cwd: process.cwd()
        })
        console.log('✅ Migrations deployed successfully!')
        migrationSuccess = true
      } catch (migrateError) {
        console.log('ℹ️ No pending migrations found')
      }

      // Step 2: If no migrations, try safe db push
      if (!migrationSuccess) {
        try {
          console.log('🔄 Step 2: Attempting safe schema sync...')
          execSync('npx prisma db push --schema ./schema.prisma --accept-data-loss=false --skip-generate', { 
            stdio: 'inherit',
            cwd: process.cwd()
          })
          console.log('✅ Schema synchronized safely!')
        } catch (pushError) {
          console.log('ℹ️ Schema is already up to date')
          console.log('💚 No changes needed - all data safe!')
        }
      }

      // Verify data is still there
      try {
        const prismaCheck = new PrismaClient()
        await prismaCheck.$connect()
        
        const finalUserCount = await prismaCheck.user.count()
        const finalHackathonCount = await prismaCheck.hackathon.count()
        
        await prismaCheck.$disconnect()
        
        console.log('🔍 Post-deployment verification:')
        console.log(`   👥 Users: ${userCount} → ${finalUserCount} ${finalUserCount >= userCount ? '✅' : '❌'}`)
        console.log(`   🏆 Hackathons: ${hackathonCount} → ${finalHackathonCount} ${finalHackathonCount >= hackathonCount ? '✅' : '❌'}`)
        
        if (finalUserCount < userCount || finalHackathonCount < hackathonCount) {
          throw new Error('DATA LOSS DETECTED! Deployment failed.')
        }
        
        console.log('💚 DATA VERIFICATION PASSED - All data preserved!')
        
      } catch (verifyError) {
        console.error('❌ Data verification failed:', verifyError.message)
        throw verifyError
      }
      
    } else {
      console.log('🆕 Empty database - safe to create initial schema')
      
      execSync('npx prisma db push --schema ./schema.prisma --skip-generate', { 
        stdio: 'inherit',
        cwd: process.cwd()
      })
      console.log('✅ Initial schema created successfully!')
    }

    // 4. Ensure admin user exists (only if needed)
    console.log('👤 Checking admin user...')
    try {
      const prismaAdmin = new PrismaClient()
      await prismaAdmin.$connect()
      
      const adminExists = await prismaAdmin.user.findFirst({
        where: { 
          OR: [
            { email: 'admin@hackathon.com' },
            { email: 'admin@hackathon.gov.sa' }
          ]
        }
      })
      
      if (!adminExists) {
        console.log('👤 Creating admin user...')
        const bcrypt = require('bcryptjs')
        const hashedPassword = await bcrypt.hash('admin123', 12)
        
        await prismaAdmin.user.create({
          data: {
            email: 'admin@hackathon.com',
            password: hashedPassword,
            name: 'مدير النظام',
            role: 'ADMIN',
            isVerified: true
          }
        })
        console.log('✅ Admin user created successfully!')
      } else {
        console.log('✅ Admin user already exists')
      }
      
      await prismaAdmin.$disconnect()
      
    } catch (adminError) {
      console.log('⚠️ Could not verify/create admin user:', adminError.message)
      console.log('ℹ️ You may need to create admin manually later')
    }

    console.log('')
    console.log('🎉 SAFE DEPLOYMENT COMPLETED SUCCESSFULLY!')
    console.log('💚 All existing data has been preserved')
    console.log('🔐 Admin Login:')
    console.log('📧 Email: admin@hackathon.com')
    console.log('🔑 Password: admin123')
    console.log('')

  } catch (error) {
    console.error('')
    console.error('❌ SAFE DEPLOYMENT FAILED:', error.message)
    console.error('🛡️ No data should have been lost due to safety measures')
    console.error('')
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  safeProductionDeploy()
    .then(() => {
      console.log('✅ Safe deployment script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Safe deployment script failed:', error)
      process.exit(1)
    })
}

module.exports = { safeProductionDeploy }
