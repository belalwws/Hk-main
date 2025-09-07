const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testUnpin() {
  try {
    console.log('🔄 Testing unpin functionality...')

    // البحث عن الهاكاثون المثبت
    const pinnedHackathon = await prisma.hackathon.findFirst({
      where: { isPinned: true },
      select: {
        id: true,
        title: true,
        isPinned: true
      }
    })

    if (!pinnedHackathon) {
      console.log('❌ لا يوجد هاكاثون مثبت حالياً')
      
      // تثبيت الهاكاثون الأول للاختبار
      const firstHackathon = await prisma.hackathon.findFirst()
      if (firstHackathon) {
        await prisma.hackathon.update({
          where: { id: firstHackathon.id },
          data: { isPinned: true }
        })
        console.log(`📌 تم تثبيت الهاكاثون للاختبار: ${firstHackathon.title}`)
        
        // الآن إلغاء التثبيت
        await prisma.hackathon.update({
          where: { id: firstHackathon.id },
          data: { isPinned: false }
        })
        console.log(`📍 تم إلغاء تثبيت الهاكاثون: ${firstHackathon.title}`)
      }
    } else {
      console.log(`📌 الهاكاثون المثبت حالياً: ${pinnedHackathon.title}`)
      
      // إلغاء التثبيت
      await prisma.hackathon.update({
        where: { id: pinnedHackathon.id },
        data: { isPinned: false }
      })
      console.log(`📍 تم إلغاء تثبيت الهاكاثون: ${pinnedHackathon.title}`)
    }

    // التحقق من النتيجة
    const allHackathons = await prisma.hackathon.findMany({
      select: {
        id: true,
        title: true,
        isPinned: true
      }
    })

    console.log('\n🎯 حالة جميع الهاكاثونات بعد الاختبار:')
    allHackathons.forEach((h, index) => {
      console.log(`${index + 1}. ${h.title} - ${h.isPinned ? 'مثبت ✅' : 'غير مثبت ❌'}`)
    })

    console.log('\n✅ اختبار إلغاء التثبيت مكتمل!')

  } catch (error) {
    console.error('❌ خطأ في اختبار إلغاء التثبيت:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testUnpin()
