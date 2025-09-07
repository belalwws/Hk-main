const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('✅ مستخدم أدمن موجود بالفعل:', existingAdmin.email)
      return existingAdmin
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'مدير النظام',
        email: 'admin@hackathon.com',
        password_hash: hashedPassword,
        phone: '0501234567',
        city: 'الرياض',
        nationality: 'سعودي',
        role: 'ADMIN'
      }
    })

    console.log('✅ تم إنشاء مستخدم أدمن بنجاح!')
    console.log('📧 البريد الإلكتروني: admin@hackathon.com')
    console.log('🔑 كلمة المرور: admin123')
    
    return adminUser
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء مستخدم الأدمن:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
