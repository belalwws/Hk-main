const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function approveBelal() {
  try {
    console.log('🔍 Finding Belal\'s participation...')

    // Find Belal's participation
    const belalUser = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'belal'
        }
      }
    })

    if (!belalUser) {
      console.log('❌ Belal user not found')
      return
    }

    console.log(`✅ Found Belal: ${belalUser.name} (${belalUser.id})`)

    // Find his participation
    const participation = await prisma.participant.findFirst({
      where: {
        userId: belalUser.id,
        status: 'PENDING'
      },
      include: {
        hackathon: true
      }
    })

    if (!participation) {
      console.log('❌ No pending participation found for Belal')
      return
    }

    console.log(`✅ Found participation in: ${participation.hackathon.title}`)

    // Approve the participation
    const updatedParticipation = await prisma.participant.update({
      where: {
        id: participation.id
      },
      data: {
        status: 'APPROVED',
        approvedAt: new Date()
      }
    })

    console.log('🎉 Belal has been approved!')
    console.log(`   - Participation ID: ${updatedParticipation.id}`)
    console.log(`   - Status: ${updatedParticipation.status}`)
    console.log(`   - Approved at: ${updatedParticipation.approvedAt}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

approveBelal()
