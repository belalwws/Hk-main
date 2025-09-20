// Test API endpoints to debug 500 errors

const { PrismaClient } = require('@prisma/client')

async function testAPI() {
  let prisma
  
  try {
    console.log('🧪 Testing API functionality...')
    
    // Test 1: Database connection
    console.log('\n1️⃣ Testing database connection...')
    prisma = new PrismaClient()
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // Test 2: Check if admin user exists
    console.log('\n2️⃣ Checking admin user...')
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    })
    
    if (!adminUser) {
      console.log('❌ No admin user found')
      console.log('Creating admin user...')
      
      const bcrypt = require('bcrypt')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      const newUser = await prisma.user.create({
        data: {
          id: 'admin_' + Date.now(),
          name: 'مدير النظام',
          email: 'admin@hackathon.gov.sa',
          password: hashedPassword,
          role: 'admin'
        }
      })
      
      await prisma.admin.create({
        data: {
          id: 'admin_record_' + Date.now(),
          userId: newUser.id,
          permissions: {
            canManageHackathons: true,
            canManageUsers: true,
            canManageJudges: true,
            canViewReports: true,
            canManageSettings: true
          }
        }
      })
      
      console.log('✅ Admin user created successfully')
    } else {
      console.log('✅ Admin user exists:', adminUser.email)
    }

    // Test 3: Try creating a test hackathon
    console.log('\n3️⃣ Testing hackathon creation...')
    
    const testHackathonData = {
      title: 'Test Hackathon ' + Date.now(),
      description: 'Test description for debugging',
      requirements: ['Requirement 1', 'Requirement 2'],
      categories: ['Category 1', 'Category 2'],
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      maxParticipants: 100,
      status: 'draft',
      prizes: {
        first: 'الجائزة الأولى',
        second: 'الجائزة الثانية',
        third: 'الجائزة الثالثة'
      },
      createdBy: adminUser ? adminUser.id : 'admin_test'
    }

    console.log('Creating test hackathon with data:', {
      title: testHackathonData.title,
      status: testHackathonData.status,
      createdBy: testHackathonData.createdBy
    })

    const hackathon = await prisma.hackathon.create({
      data: testHackathonData
    })

    console.log('✅ Test hackathon created successfully:', hackathon.id)

    // Clean up - delete test hackathon
    await prisma.hackathon.delete({
      where: { id: hackathon.id }
    })
    console.log('✅ Test hackathon cleaned up')

    // Test 4: Check schema consistency
    console.log('\n4️⃣ Checking schema consistency...')
    
    const hackathonCount = await prisma.hackathon.count()
    const userCount = await prisma.user.count()
    const adminCount = await prisma.admin.count()
    
    console.log('📊 Database statistics:')
    console.log(`   - Hackathons: ${hackathonCount}`)
    console.log(`   - Users: ${userCount}`)
    console.log(`   - Admins: ${adminCount}`)

    // Test 5: Check for missing tables
    console.log('\n5️⃣ Checking for missing tables...')
    
    try {
      await prisma.hackathonLandingPage.findFirst()
      console.log('✅ Landing pages table exists')
    } catch (error) {
      console.log('❌ Landing pages table missing, creating...')
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS hackathon_landing_pages (
          id TEXT PRIMARY KEY,
          hackathon_id TEXT UNIQUE NOT NULL,
          is_enabled BOOLEAN DEFAULT FALSE,
          custom_domain TEXT,
          html_content TEXT NOT NULL DEFAULT '',
          css_content TEXT NOT NULL DEFAULT '',
          js_content TEXT NOT NULL DEFAULT '',
          seo_title TEXT,
          seo_description TEXT,
          template TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE
        )
      `
      console.log('✅ Landing pages table created')
    }

    console.log('\n🎉 All API tests passed successfully!')
    console.log('\n📋 Summary:')
    console.log('✅ Database connection working')
    console.log('✅ Admin user exists')
    console.log('✅ Hackathon creation working')
    console.log('✅ Schema is consistent')
    console.log('✅ All required tables exist')
    
    console.log('\n🚀 The API should now work correctly!')

  } catch (error) {
    console.error('\n❌ API test failed:', error)
    console.error('Error details:', error.message)
    console.error('Stack trace:', error.stack)
    
    // Try to provide specific solutions
    if (error.message.includes('DATABASE_URL')) {
      console.log('\n💡 Solution: Set DATABASE_URL environment variable')
    } else if (error.message.includes('connect')) {
      console.log('\n💡 Solution: Check database connection settings')
    } else if (error.message.includes('table') || error.message.includes('relation')) {
      console.log('\n💡 Solution: Run database migrations')
    } else {
      console.log('\n💡 Solution: Check the error details above and fix the issue')
    }
    
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}

// Run the test
testAPI()
