/**
 * Script to check what data exists for supervisor pages
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkData() {
  console.log('🔍 Checking data for supervisor pages...\n')

  try {
    // Check Expert Invitations
    console.log('📧 Expert Invitations:')
    const expertInvitations = await prisma.expertInvitation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    console.log(`   Total: ${expertInvitations.length}`)
    if (expertInvitations.length > 0) {
      console.log('   Sample:')
      expertInvitations.forEach(inv => {
        console.log(`   - ${inv.email} (${inv.status}) - Created: ${inv.createdAt}`)
      })
    }

    // Check Expert Applications
    console.log('\n📝 Expert Applications:')
    const expertApplications = await prisma.expertApplication.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    console.log(`   Total: ${expertApplications.length}`)
    if (expertApplications.length > 0) {
      console.log('   Sample:')
      expertApplications.forEach(app => {
        console.log(`   - ${app.email} (${app.status}) - Created: ${app.createdAt}`)
      })
    }

    // Check Experts (from User table)
    console.log('\n👨‍💼 Experts (Users with role=expert):')
    const experts = await prisma.user.findMany({
      where: { role: 'expert' },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    console.log(`   Total: ${experts.length}`)
    if (experts.length > 0) {
      console.log('   Sample:')
      experts.forEach(expert => {
        console.log(`   - ${expert.name} (${expert.email}) - Created: ${expert.createdAt}`)
      })
    }

    // Check Judge Invitations
    console.log('\n📧 Judge Invitations:')
    const judgeInvitations = await prisma.judgeInvitation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    console.log(`   Total: ${judgeInvitations.length}`)
    if (judgeInvitations.length > 0) {
      console.log('   Sample:')
      judgeInvitations.forEach(inv => {
        console.log(`   - ${inv.email} (${inv.status}) - Created: ${inv.createdAt}`)
      })
    }

    // Check Judge Applications
    console.log('\n📝 Judge Applications:')
    const judgeApplications = await prisma.judgeApplication.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    console.log(`   Total: ${judgeApplications.length}`)
    if (judgeApplications.length > 0) {
      console.log('   Sample:')
      judgeApplications.forEach(app => {
        console.log(`   - ${app.email} (${app.status}) - Created: ${app.createdAt}`)
      })
    }

    // Check Judges (from User table)
    console.log('\n👨‍⚖️ Judges (Users with role=judge):')
    const judges = await prisma.user.findMany({
      where: { role: 'judge' },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    console.log(`   Total: ${judges.length}`)
    if (judges.length > 0) {
      console.log('   Sample:')
      judges.forEach(judge => {
        console.log(`   - ${judge.name} (${judge.email}) - Created: ${judge.createdAt}`)
      })
    }

    // Check Hackathons
    console.log('\n🎯 Hackathons:')
    const hackathons = await prisma.hackathon.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    console.log(`   Total: ${hackathons.length}`)
    if (hackathons.length > 0) {
      console.log('   Sample:')
      hackathons.forEach(h => {
        console.log(`   - ${h.title} (${h.status}) - ${h.startDate} to ${h.endDate}`)
      })
    }

    console.log('\n\n📊 Summary:')
    console.log(`   Expert Invitations: ${expertInvitations.length}`)
    console.log(`   Expert Applications: ${expertApplications.length}`)
    console.log(`   Experts (Users): ${experts.length}`)
    console.log(`   Judge Invitations: ${judgeInvitations.length}`)
    console.log(`   Judge Applications: ${judgeApplications.length}`)
    console.log(`   Judges (Users): ${judges.length}`)
    console.log(`   Hackathons: ${hackathons.length}`)

    if (expertInvitations.length === 0 && expertApplications.length === 0 && experts.length === 0) {
      console.log('\n⚠️  No expert data found in database!')
      console.log('   This explains why supervisor/experts page is empty.')
    }

    if (judgeInvitations.length === 0 && judgeApplications.length === 0 && judges.length === 0) {
      console.log('\n⚠️  No judge data found in database!')
      console.log('   This explains why supervisor/judges page is empty.')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
checkData()
  .then(() => {
    console.log('\n✅ Check completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error)
    process.exit(1)
  })

