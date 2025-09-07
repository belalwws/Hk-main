const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function approveMoreParticipants() {
  try {
    console.log('🔍 Finding pending participants...')

    // Find pending participants
    const pendingParticipants = await prisma.participant.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            preferredRole: true
          }
        },
        hackathon: {
          select: {
            title: true
          }
        }
      },
      take: 5 // Approve 5 more
    })

    console.log(`✅ Found ${pendingParticipants.length} pending participants`)

    // Approve them
    for (const participant of pendingParticipants) {
      await prisma.participant.update({
        where: {
          id: participant.id
        },
        data: {
          status: 'APPROVED',
          approvedAt: new Date()
        }
      })

      console.log(`✅ Approved: ${participant.user.name}`)
    }

    // Now find the team and add some to it
    const team = await prisma.team.findFirst({
      where: {
        name: 'فريق الإبداع التقني'
      }
    })

    if (team) {
      // Add 2 more members to the team
      const newApprovedParticipants = await prisma.participant.findMany({
        where: {
          status: 'APPROVED',
          teamId: null,
          hackathonId: team.hackathonId
        },
        include: {
          user: {
            select: {
              name: true,
              preferredRole: true
            }
          }
        },
        take: 2
      })

      for (const participant of newApprovedParticipants) {
        await prisma.participant.update({
          where: {
            id: participant.id
          },
          data: {
            teamId: team.id
          }
        })

        console.log(`🎯 Added ${participant.user.name} to team ${team.name}`)
      }
    }

    console.log('🎉 Approval and team assignment completed!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

approveMoreParticipants()
