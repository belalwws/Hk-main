// Script to preserve data during deployments
// This runs before deployment to backup data and after to restore it

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function backupData() {
  try {
    console.log('🔄 Backing up data before deployment...')

    // Backup critical data
    const backup = {
      hackathons: await prisma.hackathon.findMany({
        include: {
          participants: true,
          teams: true,
          judges: true,
          scores: true,
          evaluationCriteria: true,
          registrationForm: true
        }
      }),
      users: await prisma.user.findMany(),
      admins: await prisma.admin.findMany(),
      globalSettings: await prisma.globalSettings.findMany(),
      emailTemplates: await prisma.emailTemplate.findMany(),
      timestamp: new Date().toISOString()
    }

    // Save backup to file
    const backupPath = path.join(process.cwd(), 'data', 'backup.json')
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2))
    
    console.log('✅ Data backed up successfully to:', backupPath)
    console.log(`📊 Backed up:`)
    console.log(`   - ${backup.hackathons.length} hackathons`)
    console.log(`   - ${backup.users.length} users`)
    console.log(`   - ${backup.admins.length} admins`)
    console.log(`   - ${backup.globalSettings.length} settings`)
    console.log(`   - ${backup.emailTemplates.length} email templates`)

  } catch (error) {
    console.error('❌ Error backing up data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function restoreData() {
  try {
    console.log('🔄 Restoring data after deployment...')

    const backupPath = path.join(process.cwd(), 'data', 'backup.json')
    
    if (!fs.existsSync(backupPath)) {
      console.log('ℹ️ No backup file found, skipping restore')
      return
    }

    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
    
    console.log('📊 Restoring data from backup created at:', backup.timestamp)

    // Restore in correct order (dependencies first)
    
    // 1. Users first
    for (const user of backup.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      })
    }

    // 2. Admins
    for (const admin of backup.admins) {
      await prisma.admin.upsert({
        where: { id: admin.id },
        update: admin,
        create: admin
      })
    }

    // 3. Global Settings
    for (const setting of backup.globalSettings) {
      await prisma.globalSettings.upsert({
        where: { id: setting.id },
        update: setting,
        create: setting
      })
    }

    // 4. Email Templates
    for (const template of backup.emailTemplates) {
      await prisma.emailTemplate.upsert({
        where: { id: template.id },
        update: template,
        create: template
      })
    }

    // 5. Hackathons and related data
    for (const hackathon of backup.hackathons) {
      // Extract related data
      const { participants, teams, judges, scores, evaluationCriteria, registrationForm, ...hackathonData } = hackathon

      // Create/update hackathon
      await prisma.hackathon.upsert({
        where: { id: hackathon.id },
        update: hackathonData,
        create: hackathonData
      })

      // Restore participants
      for (const participant of participants || []) {
        await prisma.participant.upsert({
          where: { id: participant.id },
          update: participant,
          create: participant
        })
      }

      // Restore teams
      for (const team of teams || []) {
        await prisma.team.upsert({
          where: { id: team.id },
          update: team,
          create: team
        })
      }

      // Restore judges
      for (const judge of judges || []) {
        await prisma.judge.upsert({
          where: { id: judge.id },
          update: judge,
          create: judge
        })
      }

      // Restore evaluation criteria
      for (const criterion of evaluationCriteria || []) {
        await prisma.evaluationCriterion.upsert({
          where: { id: criterion.id },
          update: criterion,
          create: criterion
        })
      }

      // Restore scores
      for (const score of scores || []) {
        await prisma.score.upsert({
          where: { id: score.id },
          update: score,
          create: score
        })
      }

      // Restore registration form
      if (registrationForm) {
        await prisma.hackathonForm.upsert({
          where: { id: registrationForm.id },
          update: registrationForm,
          create: registrationForm
        })
      }
    }

    console.log('✅ Data restored successfully!')
    console.log(`📊 Restored:`)
    console.log(`   - ${backup.hackathons.length} hackathons`)
    console.log(`   - ${backup.users.length} users`)
    console.log(`   - ${backup.admins.length} admins`)

  } catch (error) {
    console.error('❌ Error restoring data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Check command line argument
const command = process.argv[2]

if (command === 'backup') {
  backupData()
} else if (command === 'restore') {
  restoreData()
} else {
  console.log('Usage: node preserve-data-on-deploy.js [backup|restore]')
}
