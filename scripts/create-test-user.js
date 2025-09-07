const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: 'user@test.com' }
    })

    if (existingUser) {
      console.log('✅ مستخدم تجريبي موجود بالفعل:', existingUser.email)
      return existingUser
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('user123', 10)

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        name: 'أحمد محمد',
        email: 'user@test.com',
        password_hash: hashedPassword,
        phone: '0501234568',
        city: 'الرياض',
        nationality: 'سعودي',
        role: 'PARTICIPANT'
      }
    })

    console.log('✅ تم إنشاء مستخدم تجريبي بنجاح!')
    console.log('📧 البريد الإلكتروني: user@test.com')
    console.log('🔑 كلمة المرور: user123')
    
    return testUser
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم التجريبي:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
