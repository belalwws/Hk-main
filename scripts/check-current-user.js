const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCurrentUser() {
  try {
    console.log('🔍 Checking current user and participations...')

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

    console.log(`\n👤 Found ${users.length} users:`)
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} - ID: ${user.id}`)
    })

    // Get all participations
    const participations = await prisma.participant.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        hackathon: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        team: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    preferredRole: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        registeredAt: 'desc'
      }
    })

    console.log(`\n🎯 Found ${participations.length} participations:`)
    participations.forEach((participation, index) => {
      console.log(`${index + 1}. ${participation.user.name} in ${participation.hackathon.title}`)
      console.log(`   - Status: ${participation.status}`)
      console.log(`   - Team: ${participation.team ? participation.team.name : 'No team'}`)
      console.log(`   - Registered: ${participation.registeredAt}`)
      console.log('')
    })

    // Check specific user (belal ahmed)
    const belalUser = users.find(u => u.name.toLowerCase().includes('belal'))
    if (belalUser) {
      console.log(`\n🎯 Found Belal user: ${belalUser.name} (${belalUser.id})`)
      
      const belalParticipations = participations.filter(p => p.user.id === belalUser.id)
      console.log(`📊 Belal's participations: ${belalParticipations.length}`)
      
      belalParticipations.forEach((participation, index) => {
        console.log(`${index + 1}. ${participation.hackathon.title}`)
        console.log(`   - Status: ${participation.status}`)
        console.log(`   - Team: ${participation.team ? participation.team.name : 'No team'}`)
        if (participation.team) {
          console.log(`   - Team members: ${participation.team.participants.length}`)
          participation.team.participants.forEach(member => {
            console.log(`     * ${member.user.name} (${member.user.preferredRole || 'No role'})`)
          })
        }
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCurrentUser()
