const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testUsersAPI() {
  try {
    console.log('🔍 Testing users API...')

    // Get all users directly from database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        nationality: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`\n👥 Found ${users.length} users in database:`)
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`)
    })

    // Test the API response format
    const apiResponse = {
      users: users
    }

    console.log('\n📡 API Response format:')
    console.log(JSON.stringify(apiResponse, null, 2))

  } catch (error) {
    console.error('❌ Error testing users API:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testUsersAPI()
