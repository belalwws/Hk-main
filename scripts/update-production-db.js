const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateProductionDatabase() {
  try {
    console.log('🔄 Updating production database schema...')

    // Connect to database
    await prisma.$connect()
    console.log('✅ Connected to database')

    // Check if HackathonFormDesign table exists
    try {
      await prisma.hackathonFormDesign.count()
      console.log('✅ HackathonFormDesign table already exists')
    } catch (error) {
      console.log('📋 Creating HackathonFormDesign table...')
      
      // Create the table using raw SQL for production
      await prisma.$executeRaw`
        CREATE TABLE "hackathon_form_designs" (
          "id" TEXT NOT NULL,
          "hackathonId" TEXT NOT NULL,
          "isEnabled" BOOLEAN NOT NULL DEFAULT false,
          "template" TEXT NOT NULL DEFAULT 'modern',
          "htmlContent" TEXT,
          "cssContent" TEXT,
          "jsContent" TEXT,
          "settings" JSONB,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          
          CONSTRAINT "hackathon_form_designs_pkey" PRIMARY KEY ("id")
        )
      `
      
      // Add unique constraint
      await prisma.$executeRaw`
        ALTER TABLE "hackathon_form_designs" 
        ADD CONSTRAINT "hackathon_form_designs_hackathonId_key" 
        UNIQUE ("hackathonId")
      `
      
      // Add foreign key constraint
      await prisma.$executeRaw`
        ALTER TABLE "hackathon_form_designs" 
        ADD CONSTRAINT "hackathon_form_designs_hackathonId_fkey" 
        FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE
      `
      
      console.log('✅ HackathonFormDesign table created successfully')
    }

    // Test the table
    const count = await prisma.hackathonFormDesign.count()
    console.log(`📊 HackathonFormDesign records: ${count}`)

    // Check admin user
    const adminUser = await prisma.user.findFirst({
      where: { 
        email: 'admin@hackathon.com',
        role: 'admin'
      }
    })

    if (!adminUser) {
      console.log('⚠️ No admin user found, creating one...')
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      await prisma.user.create({
        data: {
          name: 'مدير النظام',
          email: 'admin@hackathon.com',
          password: hashedPassword,
          phone: '+966500000000',
          city: 'الرياض',
          nationality: 'سعودي',
          role: 'admin',
          isActive: true,
          emailVerified: true,
          preferredRole: 'مدير النظام'
        }
      })
      
      console.log('✅ Admin user created')
    } else {
      console.log('✅ Admin user exists')
    }

    console.log('\n🎉 Production database update completed!')
    console.log('\n🔐 Admin Login:')
    console.log('📧 Email: admin@hackathon.com')
    console.log('🔑 Password: admin123')

  } catch (error) {
    console.error('❌ Error updating production database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  updateProductionDatabase()
    .then(() => {
      console.log('✅ Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { updateProductionDatabase }
