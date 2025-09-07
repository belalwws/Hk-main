const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function addMissingUser() {
  try {
    console.log('🔄 Adding missing user...')

    // Create a default password hash for the user without password
    const defaultPassword = 'temp123456'
    const hashedPassword = await bcrypt.hash(defaultPassword, 12)

    const newUser = await prisma.user.create({
      data: {
        name: 'Belal Ahmed',
        email: 'belal.ahmed121sq1@gmail.com',
        password_hash: hashedPassword,
        phone: '01128300607',
        city: 'جدة',
        nationality: 'مصر',
        skills: null,
        experience: null,
        preferredRole: 'مطور واجهات أمامية',
        role: 'PARTICIPANT'
      }
    })

    console.log('✅ Added missing user:', newUser.email)

    // Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`\n👥 Total users in database: ${allUsers.length}`)
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`)
    })

  } catch (error) {
    console.error('❌ Error adding user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addMissingUser()
