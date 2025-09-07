const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkParticipantsTable() {
  try {
    console.log('🔍 Checking participants table...')

    // Get all participants
    const participants = await prisma.participant.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        hackathon: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        registeredAt: 'desc'
      }
    })

    console.log(`\n👥 Found ${participants.length} participants:`)
    participants.forEach((participant, index) => {
      console.log(`${index + 1}. ${participant.user?.name || 'Unknown'} (${participant.user?.email || 'No email'})`)
      console.log(`   - Status: ${participant.status}`)
      console.log(`   - Type: ${participant.participationType}`)
      console.log(`   - Hackathon: ${participant.hackathon?.title || 'Unknown'}`)
      console.log(`   - Registered: ${participant.registeredAt}`)
      console.log('')
    })

    // Check if there's a temporary participants table or similar
    console.log('🔍 Checking for other participant-related data...')

    // Get all users
    const users = await prisma.user.findMany({
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

    console.log(`\n👤 Users table (${users.length}):`)
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`)
    })

    // Get all hackathons
    const hackathons = await prisma.hackathon.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        _count: {
          select: {
            participants: true
          }
        }
      }
    })

    console.log(`\n🏆 Hackathons table (${hackathons.length}):`)
    hackathons.forEach((hackathon, index) => {
      console.log(`${index + 1}. ${hackathon.title} - Status: ${hackathon.status} - Participants: ${hackathon._count.participants}`)
    })

  } catch (error) {
    console.error('❌ Error checking participants:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkParticipantsTable()
