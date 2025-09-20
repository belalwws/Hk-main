const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testLogin() {
  try {
    console.log('🧪 Testing admin login...')

    // Connect to database
    await prisma.$connect()
    console.log('✅ Database connected')

    // Find admin user
    const admin = await prisma.user.findFirst({
      where: { 
        email: 'admin@hackathon.com',
        role: 'admin'
      }
    })

    if (!admin) {
      console.log('❌ Admin user not found!')
      console.log('Run: npm run create-admin')
      return
    }

    console.log('✅ Admin user found:')
    console.log('📧 Email:', admin.email)
    console.log('👤 Name:', admin.name)
    console.log('🆔 ID:', admin.id)
    console.log('🔐 Password hash:', admin.password ? admin.password.substring(0, 20) + '...' : 'NOT SET')

    // Test password
    if (admin.password) {
      const testPassword = await bcrypt.compare('admin123', admin.password)
      console.log('🧪 Password test for "admin123":', testPassword ? '✅ CORRECT' : '❌ WRONG')
      
      if (!testPassword) {
        console.log('🔧 Password might be hashed differently. Trying to fix...')
        
        // Update password with correct hash
        const newHash = await bcrypt.hash('admin123', 12)
        await prisma.user.update({
          where: { id: admin.id },
          data: { password: newHash }
        })
        
        console.log('✅ Password updated successfully')
        console.log('🔑 New password: admin123')
      }
    } else {
      console.log('❌ No password set for admin user!')
      
      // Set password
      const newHash = await bcrypt.hash('admin123', 12)
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: newHash }
      })
      
      console.log('✅ Password set successfully')
      console.log('🔑 Password: admin123')
    }

    console.log('\n🎉 Login test completed!')
    console.log('\n🔗 Try logging in:')
    console.log('URL: http://localhost:3000/login')
    console.log('📧 Email: admin@hackathon.com')
    console.log('🔑 Password: admin123')

  } catch (error) {
    console.error('❌ Error testing login:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()
