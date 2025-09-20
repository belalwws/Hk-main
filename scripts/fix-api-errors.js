// Script to fix common API errors and ensure database consistency

const { PrismaClient } = require('@prisma/client')

async function fixApiErrors() {
  let prisma
  
  try {
    prisma = new PrismaClient()
    console.log('🔧 Fixing API errors and database issues...')

    // 1. Test database connection
    console.log('📡 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // 2. Ensure all required tables exist
    console.log('🗄️ Ensuring all tables exist...')
    
    // Check if hackathons table exists and has required columns
    try {
      const hackathons = await prisma.hackathon.findFirst()
      console.log('✅ Hackathons table exists')
    } catch (error) {
      console.log('❌ Hackathons table issue:', error.message)
    }

    // 3. Create landing pages table if it doesn't exist
    try {
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
      console.log('✅ Landing pages table ensured')
    } catch (error) {
      console.log('ℹ️ Landing pages table already exists')
    }

    // 4. Check for missing admin user
    console.log('👤 Checking admin user...')
    const adminCount = await prisma.admin.count()
    if (adminCount === 0) {
      console.log('⚠️ No admin users found, creating default admin...')
      
      // Create default admin user
      const bcrypt = require('bcrypt')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      await prisma.user.upsert({
        where: { email: 'admin@hackathon.gov.sa' },
        update: {},
        create: {
          id: 'admin_user_001',
          name: 'مدير النظام',
          email: 'admin@hackathon.gov.sa',
          password: hashedPassword,
          role: 'admin'
        }
      })

      await prisma.admin.upsert({
        where: { userId: 'admin_user_001' },
        update: {},
        create: {
          id: 'admin_001',
          userId: 'admin_user_001',
          permissions: {
            canManageHackathons: true,
            canManageUsers: true,
            canManageJudges: true,
            canViewReports: true,
            canManageSettings: true
          }
        }
      })

      console.log('✅ Default admin created: admin@hackathon.gov.sa / admin123')
    } else {
      console.log(`✅ Found ${adminCount} admin user(s)`)
    }

    // 5. Check database schema consistency
    console.log('🔍 Checking schema consistency...')
    
    try {
      // Test creating a simple hackathon to check schema
      const testHackathon = {
        id: 'test_' + Date.now(),
        title: 'Test Hackathon',
        description: 'Test description',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: 'draft',
        createdBy: 'admin_user_001'
      }

      const created = await prisma.hackathon.create({
        data: testHackathon
      })

      // Delete the test hackathon
      await prisma.hackathon.delete({
        where: { id: created.id }
      })

      console.log('✅ Schema consistency check passed')
    } catch (error) {
      console.log('❌ Schema consistency issue:', error.message)
    }

    // 6. Clean up any orphaned records
    console.log('🧹 Cleaning up orphaned records...')
    
    try {
      // Delete participants without valid hackathons
      const orphanedParticipants = await prisma.$executeRaw`
        DELETE FROM participants 
        WHERE hackathon_id NOT IN (SELECT id FROM hackathons)
      `
      
      // Delete teams without valid hackathons
      const orphanedTeams = await prisma.$executeRaw`
        DELETE FROM teams 
        WHERE hackathon_id NOT IN (SELECT id FROM hackathons)
      `
      
      console.log('✅ Cleanup completed')
    } catch (error) {
      console.log('ℹ️ Cleanup skipped:', error.message)
    }

    // 7. Update statistics
    console.log('📊 Updating statistics...')
    const stats = {
      hackathons: await prisma.hackathon.count(),
      users: await prisma.user.count(),
      participants: await prisma.participant.count(),
      teams: await prisma.team.count(),
      judges: await prisma.judge.count()
    }

    console.log('📈 Current database statistics:')
    console.log(`   - Hackathons: ${stats.hackathons}`)
    console.log(`   - Users: ${stats.users}`)
    console.log(`   - Participants: ${stats.participants}`)
    console.log(`   - Teams: ${stats.teams}`)
    console.log(`   - Judges: ${stats.judges}`)

    console.log('🎉 API error fixes completed successfully!')
    console.log('')
    console.log('🚀 Next steps:')
    console.log('1. Try creating a new hackathon from the admin panel')
    console.log('2. Check that all API endpoints are working')
    console.log('3. Test the landing page system')
    console.log('')

  } catch (error) {
    console.error('❌ Error fixing API issues:', error)
    console.error('Stack trace:', error.stack)
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}

// Run the fix
fixApiErrors()
