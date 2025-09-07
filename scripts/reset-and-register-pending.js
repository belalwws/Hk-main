const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetAndRegisterPending() {
  try {
    console.log('🔄 Resetting participants and re-registering as PENDING...')
    
    const hackathonId = 'cmf615vsc0000fdvwnr1jfiwy'
    
    // 1. Delete all current participants for this hackathon
    console.log('🗑️  Deleting current participants...')
    const deletedParticipants = await prisma.participant.deleteMany({
      where: { hackathonId }
    })
    console.log(`✅ Deleted ${deletedParticipants.count} participants`)
    
    // 2. Get all users except admin
    console.log('👥 Getting all users...')
    const users = await prisma.user.findMany({
      where: {
        role: 'PARTICIPANT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        preferredRole: true
      }
    })
    
    console.log(`📊 Found ${users.length} participant users`)
    
    // 3. Register all users as PENDING participants
    console.log('📝 Registering all users as PENDING participants...')
    
    const teamTypes = ['INDIVIDUAL', 'TEAM']
    let registeredCount = 0
    
    for (const user of users) {
      try {
        const teamType = teamTypes[Math.floor(Math.random() * teamTypes.length)]
        
        await prisma.participant.create({
          data: {
            userId: user.id,
            hackathonId: hackathonId,
            teamType: teamType,
            teamRole: user.preferredRole || 'مطور',
            status: 'PENDING', // All as PENDING
            registeredAt: new Date()
          }
        })
        
        registeredCount++
        console.log(`✅ Registered ${registeredCount}/${users.length}: ${user.name} - PENDING`)
        
      } catch (error) {
        console.error(`❌ Failed to register ${user.email}:`, error.message)
      }
    }
    
    // 4. Get final statistics
    const totalParticipants = await prisma.participant.count({
      where: { hackathonId }
    })
    
    const statusCounts = await prisma.participant.groupBy({
      by: ['status'],
      where: { hackathonId },
      _count: { status: true }
    })
    
    console.log('\n📊 Final Statistics:')
    console.log(`🎯 Total participants in hackathon: ${totalParticipants}`)
    console.log('\n📈 Participant status breakdown:')
    statusCounts.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count.status}`)
    })
    
    console.log('\n🎉 Done! All participants are now PENDING and waiting for your approval!')
    console.log(`🔗 Go approve them at: http://localhost:3000/admin/hackathons/${hackathonId}`)
    
  } catch (error) {
    console.error('❌ Error in process:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAndRegisterPending()
