const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSpecificEmail() {
  try {
    const email = 'belal.ahmed121sq1@gmail.com'
    console.log('🔍 Checking for email:', email)

    // Find the specific user
    const user = await prisma.user.findUnique({
      where: { email: email }
    })

    if (user) {
      console.log('✅ User found in database:')
      console.log(`- ID: ${user.id}`)
      console.log(`- Name: ${user.name}`)
      console.log(`- Email: ${user.email}`)
      console.log(`- Role: ${user.role}`)
      console.log(`- Created: ${user.createdAt}`)
    } else {
      console.log('❌ User not found in database!')
    }

    // Get all users to see what's in the database
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

    console.log(`\n👥 All users in database (${allUsers.length}):`)
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`)
    })

  } catch (error) {
    console.error('❌ Error checking email:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSpecificEmail()
