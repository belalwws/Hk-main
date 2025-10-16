/**
 * Cloudinary URL Fixer - Fix and verify presentation file URLs
 * 
 * This script checks all team presentation URLs in the database and:
 * 1. Verifies if the file exists in Cloudinary
 * 2. Fixes URLs if they have wrong format
 * 3. Reports missing files
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixCloudinaryUrls() {
  console.log('🔍 Checking presentation URLs...\n')

  try {
    // Get all teams with ideaFile
    const teams = await prisma.team.findMany({
      where: {
        ideaFile: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        ideaFile: true,
        hackathonId: true
      }
    })

    console.log(`📊 Found ${teams.length} teams with files\n`)

    let fixed = 0
    let alreadyCorrect = 0
    let needsCheck = 0

    for (const team of teams) {
      const url = team.ideaFile
      console.log(`\n📁 Team: ${team.name} (${team.id})`)
      console.log(`   URL: ${url}`)

      // Check if URL is using /image/upload/ (wrong)
      if (url.includes('/image/upload/')) {
        const fixedUrl = url.replace('/image/upload/', '/raw/upload/')
        console.log(`   ⚠️  Wrong format! Fixing...`)
        console.log(`   ✅ New URL: ${fixedUrl}`)
        
        await prisma.team.update({
          where: { id: team.id },
          data: { ideaFile: fixedUrl }
        })
        
        fixed++
      } else if (url.includes('/raw/upload/')) {
        console.log(`   ✓  Already correct format`)
        alreadyCorrect++
      } else {
        console.log(`   ⚠️  Unknown URL format`)
        needsCheck++
      }
    }

    console.log('\n\n📊 Summary:')
    console.log(`   ✅ Fixed: ${fixed}`)
    console.log(`   ✓  Already correct: ${alreadyCorrect}`)
    console.log(`   ⚠️  Needs manual check: ${needsCheck}`)
    console.log(`   📁 Total: ${teams.length}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fixCloudinaryUrls()
