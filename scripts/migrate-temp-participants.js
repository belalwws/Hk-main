const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function migrateTempParticipants() {
  try {
    console.log('🔄 Starting migration from temp storage to database...')

    // Read temp participants file
    const STORAGE_FILE = path.join(process.cwd(), 'participants-data.json')
    
    if (!fs.existsSync(STORAGE_FILE)) {
      console.log('❌ No temp participants file found!')
      return
    }

    const data = fs.readFileSync(STORAGE_FILE, 'utf8')
    const tempParticipants = JSON.parse(data)

    console.log(`📊 Found ${tempParticipants.length} participants in temp storage:`)
    tempParticipants.forEach((participant, index) => {
      console.log(`${index + 1}. ${participant.name} (${participant.email}) - Status: ${participant.status}`)
    })

    // Get existing users to avoid duplicates
    const existingUsers = await prisma.user.findMany({
      select: { email: true }
    })
    const existingEmails = existingUsers.map(u => u.email)

    console.log('\n🔄 Migrating participants to users table...')

    let migratedCount = 0
    let skippedCount = 0

    for (const participant of tempParticipants) {
      if (existingEmails.includes(participant.email)) {
        console.log(`⏭️  Skipping ${participant.email} - already exists in users table`)
        skippedCount++
        continue
      }

      try {
        // Create user in database
        const newUser = await prisma.user.create({
          data: {
            name: participant.name,
            email: participant.email,
            password_hash: participant.passwordHash, // Already hashed
            phone: participant.phone || null,
            city: participant.city || null,
            nationality: participant.nationality || null,
            skills: participant.skills || null,
            experience: participant.experience || null,
            preferredRole: participant.preferredRole || null,
            role: 'PARTICIPANT'
          }
        })

        console.log(`✅ Migrated: ${participant.name} (${participant.email})`)
        migratedCount++

      } catch (error) {
        console.error(`❌ Failed to migrate ${participant.email}:`, error.message)
      }
    }

    console.log('\n📊 Migration Summary:')
    console.log(`✅ Migrated: ${migratedCount} participants`)
    console.log(`⏭️  Skipped: ${skippedCount} participants (already exist)`)
    console.log(`📝 Total processed: ${tempParticipants.length} participants`)

    // Verify migration
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`\n👥 Total users in database after migration: ${allUsers.length}`)
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`)
    })

    // Optionally backup and remove temp file
    console.log('\n🗂️  Backing up temp file...')
    const backupFile = path.join(process.cwd(), `participants-data-backup-${Date.now()}.json`)
    fs.copyFileSync(STORAGE_FILE, backupFile)
    console.log(`✅ Backup created: ${backupFile}`)

    // Remove temp file
    fs.unlinkSync(STORAGE_FILE)
    console.log('🗑️  Temp file removed')

  } catch (error) {
    console.error('❌ Error during migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateTempParticipants()
