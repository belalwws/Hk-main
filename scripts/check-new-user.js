const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkNewUser() {
  try {
    console.log('🔍 Checking for new user: game.overtnt.123@gmail.com')

    // Find the specific user
    const user = await prisma.user.findUnique({
      where: { email: 'game.overtnt.123@gmail.com' }
    })

    if (user) {
      console.log('✅ User found in database:')
      console.log(`- ID: ${user.id}`)
      console.log(`- Name: ${user.name}`)
      console.log(`- Email: ${user.email}`)
      console.log(`- Role: ${user.role}`)
      console.log(`- Created: ${user.createdAt}`)
      console.log(`- Skills: ${user.skills || 'Not set'}`)
      console.log(`- Experience: ${user.experience || 'Not set'}`)
      console.log(`- Preferred Role: ${user.preferredRole || 'Not set'}`)
    } else {
      console.log('❌ User not found in database!')
    }

    // Get total users count
    const totalUsers = await prisma.user.count()
    console.log(`\n👥 Total users in database: ${totalUsers}`)

    // Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('\n📋 All users:')
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.createdAt.toISOString()}`)
    })

  } catch (error) {
    console.error('❌ Error checking user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkNewUser()
