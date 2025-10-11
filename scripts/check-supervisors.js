/**
 * Script to check supervisors in the database
 * Usage: node scripts/check-supervisors.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSupervisors() {
  try {
    console.log('🔍 Checking supervisors in database...\n')

    // Get all users with supervisor role
    const supervisorUsers = await prisma.user.findMany({
      where: { role: 'supervisor' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    console.log(`📊 Found ${supervisorUsers.length} users with supervisor role:`)
    supervisorUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Active: ${user.isActive ? '✅' : '❌'}`)
      console.log(`   Created: ${user.createdAt.toISOString()}`)
    })

    // Get all supervisor records
    console.log('\n\n🔍 Checking supervisor records...\n')
    const supervisors = await prisma.supervisor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true
          }
        },
        hackathon: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    console.log(`📊 Found ${supervisors.length} supervisor records:`)
    supervisors.forEach((supervisor, index) => {
      console.log(`\n${index + 1}. ${supervisor.user.name}`)
      console.log(`   Email: ${supervisor.user.email}`)
      console.log(`   User Role: ${supervisor.user.role}`)
      console.log(`   Supervisor ID: ${supervisor.id}`)
      console.log(`   Department: ${supervisor.department || 'N/A'}`)
      console.log(`   Hackathon: ${supervisor.hackathon?.title || 'General Supervisor'}`)
      console.log(`   Active: ${supervisor.isActive ? '✅' : '❌'}`)
      console.log(`   User Active: ${supervisor.user.isActive ? '✅' : '❌'}`)
      console.log(`   Created: ${supervisor.createdAt.toISOString()}`)
    })

    // Check for mismatches
    console.log('\n\n🔍 Checking for mismatches...\n')
    
    // Users with supervisor role but no supervisor record
    const usersWithoutRecord = supervisorUsers.filter(user => 
      !supervisors.some(s => s.userId === user.id)
    )
    
    if (usersWithoutRecord.length > 0) {
      console.log('⚠️  Users with supervisor role but no supervisor record:')
      usersWithoutRecord.forEach(user => {
        console.log(`   - ${user.name} (${user.email})`)
      })
    } else {
      console.log('✅ All supervisor users have supervisor records')
    }

    // Supervisor records with non-supervisor users
    const recordsWithWrongRole = supervisors.filter(s => 
      s.user.role !== 'supervisor'
    )
    
    if (recordsWithWrongRole.length > 0) {
      console.log('\n⚠️  Supervisor records with users that have wrong role:')
      recordsWithWrongRole.forEach(s => {
        console.log(`   - ${s.user.name} (${s.user.email}) - Role: ${s.user.role}`)
      })
    } else {
      console.log('✅ All supervisor records have correct user roles')
    }

    // Check pending invitations
    console.log('\n\n🔍 Checking pending supervisor invitations...\n')
    const pendingInvitations = await prisma.supervisorInvitation.findMany({
      where: {
        status: 'pending',
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Found ${pendingInvitations.length} pending invitations:`)
    pendingInvitations.forEach((inv, index) => {
      console.log(`\n${index + 1}. ${inv.name || 'N/A'}`)
      console.log(`   Email: ${inv.email}`)
      console.log(`   Status: ${inv.status}`)
      console.log(`   Expires: ${inv.expiresAt.toISOString()}`)
      console.log(`   Created: ${inv.createdAt.toISOString()}`)
    })

    // Check accepted invitations
    const acceptedInvitations = await prisma.supervisorInvitation.findMany({
      where: {
        status: 'accepted'
      },
      orderBy: {
        acceptedAt: 'desc'
      },
      take: 10
    })

    console.log(`\n\n📊 Last ${acceptedInvitations.length} accepted invitations:`)
    acceptedInvitations.forEach((inv, index) => {
      console.log(`\n${index + 1}. ${inv.name || 'N/A'}`)
      console.log(`   Email: ${inv.email}`)
      console.log(`   Accepted: ${inv.acceptedAt?.toISOString() || 'N/A'}`)
    })

    console.log('\n\n✅ Check complete!')

  } catch (error) {
    console.error('❌ Error checking supervisors:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the check
checkSupervisors()
  .then(() => {
    console.log('\n👋 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })

