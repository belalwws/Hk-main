/**
 * Check if Cloudinary files exist
 */

const https = require('https')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({
        exists: res.statusCode === 200,
        status: res.statusCode,
        url: url
      })
    }).on('error', () => {
      resolve({ exists: false, status: 'ERROR', url: url })
    })
  })
}

async function checkCloudinaryFiles() {
  console.log('🔍 Checking if Cloudinary files exist...\n')

  try {
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

    console.log(`📊 Checking ${teams.length} files...\n`)

    const results = []

    for (const team of teams) {
      const url = team.ideaFile
      console.log(`Checking: ${team.name}`)
      
      // Try current URL
      const result1 = await checkUrl(url)
      
      // If failed and using /raw/, try /image/
      let result2 = null
      if (!result1.exists && url.includes('/raw/upload/')) {
        const imageUrl = url.replace('/raw/upload/', '/image/upload/')
        result2 = await checkUrl(imageUrl)
      }
      
      // If failed and using /image/, try /raw/
      let result3 = null
      if (!result1.exists && url.includes('/image/upload/')) {
        const rawUrl = url.replace('/image/upload/', '/raw/upload/')
        result3 = await checkUrl(rawUrl)
      }

      const working = result1.exists ? result1 : (result2?.exists ? result2 : result3)

      results.push({
        team: team.name,
        id: team.id,
        current: result1,
        raw: result2,
        image: result3,
        working: working
      })

      if (working && working.exists) {
        console.log(`  ✅ Found: ${working.url.includes('/raw/') ? '/raw/' : '/image/'}`)
      } else {
        console.log(`  ❌ NOT FOUND (404)`)
      }
    }

    console.log('\n\n📊 Summary:')
    const found = results.filter(r => r.working?.exists).length
    const missing = results.length - found
    
    console.log(`  ✅ Files found: ${found}`)
    console.log(`  ❌ Files missing: ${missing}`)

    if (missing > 0) {
      console.log('\n❌ Missing files:')
      results.filter(r => !r.working?.exists).forEach(r => {
        console.log(`  - ${r.team} (${r.id})`)
        console.log(`    URL: ${r.current.url}`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCloudinaryFiles()
