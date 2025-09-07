const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Checking database users...')

    // Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        city: true,
        nationality: true,
        createdAt: true
      }
    })

    console.log(`\n📊 Total users in database: ${allUsers.length}`)
    console.log('\n👥 Users list:')
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.city || 'No city'} - ${user.nationality || 'No nationality'}`)
    })

    // Check participants
    const participants = await prisma.participant.findMany({
      include: {
        user: true,
        hackathon: true
      }
    })

    console.log(`\n🏆 Total participants: ${participants.length}`)
    participants.forEach((participant, index) => {
      console.log(`${index + 1}. ${participant.user.name} - ${participant.hackathon.title} - Status: ${participant.status}`)
    })

    // Check hackathons
    const hackathons = await prisma.hackathon.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            participants: true
          }
        }
      }
    })

    console.log(`\n🎯 Hackathons:`)
    hackathons.forEach((hackathon, index) => {
      console.log(`${index + 1}. ${hackathon.title} (${hackathon.id}) - ${hackathon._count.participants} participants`)
    })

  } catch (error) {
    console.error('❌ Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
