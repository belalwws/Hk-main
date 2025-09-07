const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUsers() {
  try {
    console.log('🚀 Creating test users for email testing...')

    // Test users with real email addresses for testing
    const testUsers = [
      {
        name: 'أحمد محمد',
        email: 'racein668+ahmed@gmail.com', // Using + addressing for testing
        password: 'test123',
        phone: '0501234567',
        city: 'الرياض',
        nationality: 'سعودي',
        role: 'PARTICIPANT'
      },
      {
        name: 'فاطمة علي',
        email: 'racein668+fatima@gmail.com',
        password: 'test123',
        phone: '0501234568',
        city: 'جدة',
        nationality: 'سعودي',
        role: 'PARTICIPANT'
      },
      {
        name: 'محمد خالد',
        email: 'racein668+mohammed@gmail.com',
        password: 'test123',
        phone: '0501234569',
        city: 'الدمام',
        nationality: 'مقيم',
        role: 'PARTICIPANT'
      },
      {
        name: 'سارة أحمد',
        email: 'racein668+sara@gmail.com',
        password: 'test123',
        phone: '0501234570',
        city: 'الرياض',
        nationality: 'سعودي',
        role: 'PARTICIPANT'
      },
      {
        name: 'عبدالله سعد',
        email: 'racein668+abdullah@gmail.com',
        password: 'test123',
        phone: '0501234571',
        city: 'مكة',
        nationality: 'مقيم',
        role: 'PARTICIPANT'
      }
    ]

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (existingUser) {
        console.log(`✅ User ${userData.name} already exists`)
        continue
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10)

      // Create user
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password_hash: hashedPassword,
          phone: userData.phone,
          city: userData.city,
          nationality: userData.nationality,
          role: userData.role
        }
      })

      console.log(`✅ Created user: ${user.name} (${user.email})`)
    }

    console.log('🎉 Test users created successfully!')
    console.log('📧 You can now test email sending with these users')
    console.log('📝 All emails will be sent to racein668@gmail.com with different + addresses')

  } catch (error) {
    console.error('❌ Error creating test users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()
