const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function pinHackathon() {
  try {
    console.log('🔧 Setting up pinned hackathon...')

    // إلغاء تثبيت جميع الهاكاثونات
    await prisma.hackathon.updateMany({
      where: { isPinned: true },
      data: { isPinned: false }
    })

    // تثبيت الهاكاثون الأول
    const firstHackathon = await prisma.hackathon.findFirst()
    
    if (firstHackathon) {
      await prisma.hackathon.update({
        where: { id: firstHackathon.id },
        data: { isPinned: true }
      })
      
      console.log(`✅ Pinned hackathon: ${firstHackathon.title}`)
    } else {
      console.log('❌ No hackathons found to pin')
    }

  } catch (error) {
    console.error('❌ Error pinning hackathon:', error)
  } finally {
    await prisma.$disconnect()
  }
}

pinHackathon()
