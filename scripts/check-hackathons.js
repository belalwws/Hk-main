const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkHackathons() {
  try {
    const hackathons = await prisma.hackathon.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('🎯 الهاكاثونات الموجودة:')
    console.log('=' .repeat(50))
    
    if (hackathons.length === 0) {
      console.log('❌ لا توجد هاكاثونات في قاعدة البيانات')
    } else {
      hackathons.forEach((hackathon, index) => {
        console.log(`${index + 1}. العنوان: ${hackathon.title}`)
        console.log(`   ID: ${hackathon.id}`)
        console.log(`   الحالة: ${hackathon.status}`)
        console.log(`   تاريخ الإنشاء: ${hackathon.createdAt}`)
        console.log(`   الرابط الصحيح: http://localhost:3001/hackathons/${hackathon.id}`)
        console.log(`   رابط التسجيل: http://localhost:3001/hackathons/${hackathon.id}/register`)
        console.log('-'.repeat(40))
      })
    }
    
  } catch (error) {
    console.error('❌ خطأ في جلب الهاكاثونات:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkHackathons()
