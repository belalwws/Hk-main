const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTeamForBelal() {
  try {
    console.log('🔍 Finding approved participants...')

    // Find the hackathon
    const hackathon = await prisma.hackathon.findFirst({
      where: {
        title: 'تصميم وبرمجة موقع الكترونى'
      }
    })

    if (!hackathon) {
      console.log('❌ Hackathon not found')
      return
    }

    console.log(`✅ Found hackathon: ${hackathon.title}`)

    // Find approved participants
    const approvedParticipants = await prisma.participant.findMany({
      where: {
        hackathonId: hackathon.id,
        status: 'APPROVED',
        teamId: null // Not yet assigned to a team
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            preferredRole: true
          }
        }
      },
      take: 3 // Take first 3 for a team
    })

    console.log(`✅ Found ${approvedParticipants.length} approved participants without teams`)

    if (approvedParticipants.length === 0) {
      console.log('❌ No approved participants found')
      return
    }

    // Create a team
    const team = await prisma.team.create({
      data: {
        name: 'فريق الإبداع التقني',
        hackathonId: hackathon.id,
        teamNumber: 1,
        leaderId: approvedParticipants[0].id
      }
    })

    console.log(`🎉 Created team: ${team.name} (Team #${team.teamNumber})`)

    // Assign participants to the team
    for (const participant of approvedParticipants) {
      await prisma.participant.update({
        where: {
          id: participant.id
        },
        data: {
          teamId: team.id
        }
      })

      console.log(`✅ Added ${participant.user.name} to team`)
    }

    console.log('🎯 Team creation completed!')
    console.log(`   - Team ID: ${team.id}`)
    console.log(`   - Team Name: ${team.name}`)
    console.log(`   - Members: ${approvedParticipants.length}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTeamForBelal()
