const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteAllUsersExceptAdmin() {
  try {
    console.log('🔍 Starting cleanup process...')

    // First, get all users to see what we have
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    console.log(`\n👥 Found ${allUsers.length} total users:`)
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`)
    })

    // Find admin users
    const adminUsers = allUsers.filter(user => user.role === 'admin')
    const nonAdminUsers = allUsers.filter(user => user.role !== 'admin')

    console.log(`\n🛡️  Admin users (will be kept): ${adminUsers.length}`)
    adminUsers.forEach(admin => {
      console.log(`   - ${admin.name} (${admin.email})`)
    })

    console.log(`\n🗑️  Non-admin users (will be deleted): ${nonAdminUsers.length}`)
    nonAdminUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`)
    })

    if (nonAdminUsers.length === 0) {
      console.log('\n✅ No non-admin users to delete!')
      return
    }

    // Delete related records first (to avoid foreign key constraints)
    console.log('\n🔄 Step 1: Deleting related records...')

    // Delete participants
    const participantIds = nonAdminUsers.map(user => user.id)
    const deletedParticipants = await prisma.participant.deleteMany({
      where: {
        userId: {
          in: participantIds
        }
      }
    })
    console.log(`   ✅ Deleted ${deletedParticipants.count} participant records`)

    // Delete judge assignments
    const deletedJudges = await prisma.judge.deleteMany({
      where: {
        userId: {
          in: participantIds
        }
      }
    })
    console.log(`   ✅ Deleted ${deletedJudges.count} judge assignment records`)

    // Delete admin actions (if any non-admin somehow has admin actions)
    const deletedAdminActions = await prisma.admin.deleteMany({
      where: {
        userId: {
          in: participantIds
        }
      }
    })
    console.log(`   ✅ Deleted ${deletedAdminActions.count} admin action records`)

    // Now delete the users
    console.log('\n🔄 Step 2: Deleting non-admin users...')
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: {
          not: 'admin'
        }
      }
    })

    console.log(`   ✅ Deleted ${deletedUsers.count} non-admin users`)

    // Verify the cleanup
    console.log('\n🔍 Verification: Checking remaining users...')
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    console.log(`\n✅ Cleanup completed! Remaining users: ${remainingUsers.length}`)
    remainingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`)
    })

    // Summary
    console.log('\n📊 Summary:')
    console.log(`   🗑️  Deleted: ${deletedUsers.count} users`)
    console.log(`   🛡️  Kept: ${remainingUsers.length} admin users`)
    console.log(`   📝 Deleted related records: ${deletedParticipants.count + deletedJudges.count + deletedAdminActions.count}`)

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
deleteAllUsersExceptAdmin()
