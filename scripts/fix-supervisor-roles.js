/**
 * Script to fix supervisor roles in the database
 * This will update users who have supervisor records but wrong role
 * Usage: node scripts/fix-supervisor-roles.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixSupervisorRoles() {
  try {
    console.log('🔧 Starting supervisor role fix...\n')

    // Find all supervisor records
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
        }
      }
    })

    console.log(`📊 Found ${supervisors.length} supervisor records\n`)

    // Find supervisors with wrong role
    const supervisorsToFix = supervisors.filter(s => s.user.role !== 'supervisor')

    if (supervisorsToFix.length === 0) {
      console.log('✅ All supervisors have correct role!')
      return
    }

    console.log(`⚠️  Found ${supervisorsToFix.length} supervisors with wrong role:\n`)
    supervisorsToFix.forEach((s, index) => {
      console.log(`${index + 1}. ${s.user.name} (${s.user.email})`)
      console.log(`   Current role: ${s.user.role}`)
      console.log(`   Should be: supervisor`)
      console.log(`   Supervisor ID: ${s.id}`)
      console.log(`   Active: ${s.isActive ? '✅' : '❌'}\n`)
    })

    // Ask for confirmation (in production, you might want to add a --force flag)
    console.log('🔄 Fixing roles...\n')

    let fixedCount = 0
    const errors = []

    for (const supervisor of supervisorsToFix) {
      try {
        // Update user role to supervisor
        await prisma.user.update({
          where: { id: supervisor.userId },
          data: { 
            role: 'supervisor',
            isActive: true // Also ensure they're active
          }
        })

        console.log(`✅ Fixed: ${supervisor.user.name} (${supervisor.user.email})`)
        fixedCount++
      } catch (error) {
        console.error(`❌ Error fixing ${supervisor.user.email}:`, error.message)
        errors.push({
          email: supervisor.user.email,
          error: error.message
        })
      }
    }

    console.log(`\n\n📊 Summary:`)
    console.log(`   Total supervisors: ${supervisors.length}`)
    console.log(`   Needed fixing: ${supervisorsToFix.length}`)
    console.log(`   Successfully fixed: ${fixedCount}`)
    console.log(`   Errors: ${errors.length}`)

    if (errors.length > 0) {
      console.log('\n❌ Errors:')
      errors.forEach(err => {
        console.log(`   - ${err.email}: ${err.error}`)
      })
    }

    // Also check for accepted invitations without supervisor records
    console.log('\n\n🔍 Checking accepted invitations...\n')
    
    const acceptedInvitations = await prisma.supervisorInvitation.findMany({
      where: {
        status: 'accepted'
      }
    })

    console.log(`📊 Found ${acceptedInvitations.length} accepted invitations\n`)

    for (const invitation of acceptedInvitations) {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email: invitation.email }
      })

      if (!user) {
        console.log(`⚠️  No user found for accepted invitation: ${invitation.email}`)
        continue
      }

      // Check if supervisor record exists
      const supervisorRecord = await prisma.supervisor.findFirst({
        where: { userId: user.id }
      })

      if (!supervisorRecord) {
        console.log(`⚠️  User exists but no supervisor record: ${user.email}`)
        console.log(`   Creating supervisor record...`)
        
        try {
          await prisma.supervisor.create({
            data: {
              userId: user.id,
              hackathonId: invitation.hackathonId,
              permissions: invitation.permissions || {},
              department: invitation.department,
              isActive: true
            }
          })
          console.log(`   ✅ Created supervisor record for ${user.email}`)
        } catch (error) {
          console.error(`   ❌ Error creating supervisor record:`, error.message)
        }
      }

      // Ensure user has supervisor role
      if (user.role !== 'supervisor') {
        console.log(`⚠️  User has wrong role: ${user.email} (${user.role})`)
        console.log(`   Updating to supervisor...`)
        
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'supervisor' }
          })
          console.log(`   ✅ Updated role for ${user.email}`)
        } catch (error) {
          console.error(`   ❌ Error updating role:`, error.message)
        }
      }
    }

    console.log('\n\n✅ Fix complete!')

  } catch (error) {
    console.error('❌ Error fixing supervisor roles:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixSupervisorRoles()
  .then(() => {
    console.log('\n👋 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })

