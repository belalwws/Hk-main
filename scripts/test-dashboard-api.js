const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDashboardAPI() {
  try {
    console.log('🔍 Testing dashboard API data...')

    // Get total hackathons count
    const totalHackathons = await prisma.hackathon.count()
    console.log(`📊 Total hackathons: ${totalHackathons}`)

    // Get active hackathons count
    const activeHackathons = await prisma.hackathon.count({
      where: { status: 'OPEN' }
    })
    console.log(`🟢 Active hackathons: ${activeHackathons}`)

    // Get participants statistics
    const totalParticipants = await prisma.participant.count()
    console.log(`👥 Total participants: ${totalParticipants}`)

    const pendingParticipants = await prisma.participant.count({
      where: { status: 'PENDING' }
    })
    console.log(`⏳ Pending participants: ${pendingParticipants}`)

    const approvedParticipants = await prisma.participant.count({
      where: { status: 'APPROVED' }
    })
    console.log(`✅ Approved participants: ${approvedParticipants}`)

    const rejectedParticipants = await prisma.participant.count({
      where: { status: 'REJECTED' }
    })
    console.log(`❌ Rejected participants: ${rejectedParticipants}`)

    // Get users statistics
    const totalUsers = await prisma.user.count()
    console.log(`👤 Total users: ${totalUsers}`)

    // Get total teams count
    const totalTeams = await prisma.team.count()
    console.log(`🏆 Total teams: ${totalTeams}`)

    // Get total judges count
    const totalJudges = await prisma.judge.count()
    console.log(`⚖️ Total judges: ${totalJudges}`)

    console.log('\n📋 Summary:')
    console.log(`- Hackathons: ${totalHackathons} (${activeHackathons} active)`)
    console.log(`- Users: ${totalUsers}`)
    console.log(`- Participants: ${totalParticipants} (${pendingParticipants} pending, ${approvedParticipants} approved, ${rejectedParticipants} rejected)`)
    console.log(`- Teams: ${totalTeams}`)
    console.log(`- Judges: ${totalJudges}`)

  } catch (error) {
    console.error('❌ Error testing dashboard API:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDashboardAPI()
