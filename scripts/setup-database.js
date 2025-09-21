#!/usr/bin/env node

/**
 * 🗄️ Database Setup Script
 * Creates all necessary tables and initial data in Supabase
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function setupDatabase() {
  console.log('🚀 Setting up database...')
  
  try {
    // Test connection
    console.log('📡 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully!')

    // Create admin user
    console.log('👤 Creating admin user...')
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@hackathon.gov.sa' },
      update: {},
      create: {
        id: 'admin-001',
        name: 'Admin User',
        email: 'admin@hackathon.gov.sa',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
        role: 'admin',
        isActive: true,
      }
    })
    
    console.log('✅ Admin user created:', adminUser.email)

    // Create sample hackathon
    console.log('🏆 Creating sample hackathon...')
    
    const hackathon = await prisma.hackathon.upsert({
      where: { id: 'hack-001' },
      update: {},
      create: {
        id: 'hack-001',
        title: 'هاكاثون تجريبي',
        description: 'هاكاثون للاختبار والتطوير',
        startDate: new Date('2024-12-25'),
        endDate: new Date('2024-12-27'),
        registrationDeadline: new Date('2024-12-24'),
        status: 'published',
        isPinned: true,
        evaluationOpen: false,
        requirements: ['البرمجة', 'التصميم', 'الابتكار'],
        categories: ['تقنية', 'تعليم', 'صحة'],
        prizes: {
          first: '10000 ريال',
          second: '5000 ريال', 
          third: '2500 ريال'
        }
      }
    })
    
    console.log('✅ Sample hackathon created:', hackathon.title)

    // Create evaluation criteria
    console.log('📊 Creating evaluation criteria...')
    
    const criteria = [
      { name: 'الابتكار', description: 'مدى ابتكار الفكرة', weight: 1.0, maxScore: 10 },
      { name: 'التنفيذ', description: 'جودة التنفيذ التقني', weight: 1.0, maxScore: 10 },
      { name: 'التصميم', description: 'جودة التصميم والواجهة', weight: 0.8, maxScore: 10 },
      { name: 'الأثر', description: 'الأثر المتوقع للحل', weight: 1.2, maxScore: 10 }
    ]

    for (const criterion of criteria) {
      await prisma.evaluationCriterion.upsert({
        where: { 
          hackathonId_name: {
            hackathonId: hackathon.id,
            name: criterion.name
          }
        },
        update: {},
        create: {
          ...criterion,
          hackathonId: hackathon.id
        }
      })
    }
    
    console.log('✅ Evaluation criteria created')

    console.log('🎉 Database setup completed successfully!')
    console.log('')
    console.log('🔐 Admin Login:')
    console.log('   Email: admin@hackathon.gov.sa')
    console.log('   Password: password')
    console.log('')
    console.log('🌐 Your app: https://hk-mainda.vercel.app')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run setup
setupDatabase()
  .then(() => {
    console.log('✅ Setup completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  })
