const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetHackathons() {
  try {
    console.log('🗑️ حذف الهاكاثونات القديمة...')
    
    // Delete all participants first (foreign key constraint)
    await prisma.participant.deleteMany({})
    console.log('✅ تم حذف جميع المشاركين')
    
    // Delete all hackathons
    await prisma.hackathon.deleteMany({})
    console.log('✅ تم حذف جميع الهاكاثونات')

    // Find admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.log('❌ لا يوجد مستخدم أدمن')
      return
    }

    // Create new hackathon with simple data
    const hackathon = await prisma.hackathon.create({
      data: {
        title: 'هاكاثون الابتكار التقني 2024',
        description: 'هاكاثون مثير للمطورين والمبدعين لتطوير حلول تقنية مبتكرة تخدم المجتمع والاقتصاد الرقمي',
        startDate: new Date('2024-12-15T09:00:00Z'),
        endDate: new Date('2024-12-17T18:00:00Z'),
        registrationDeadline: new Date('2024-12-10T23:59:59Z'),
        maxParticipants: 100,
        status: 'OPEN',
        createdBy: adminUser.id,
        prizes: {
          first: '50,000 ريال سعودي',
          second: '30,000 ريال سعودي',
          third: '20,000 ريال سعودي'
        },
        requirements: [
          'خبرة في البرمجة أو التصميم',
          'القدرة على العمل ضمن فريق',
          'تقديم مشروع مكتمل في نهاية الهاكاثون',
          'الالتزام بالمواعيد المحددة',
          'احترام قواعد السلوك المهني'
        ],
        categories: [
          'الذكاء الاصطناعي',
          'تطبيقات الجوال',
          'الأمن السيبراني',
          'إنترنت الأشياء',
          'البلوك تشين',
          'الواقع المعزز والافتراضي'
        ]
      }
    })

    console.log('🎉 تم إنشاء هاكاثون جديد بنجاح!')
    console.log('📋 معرف الهاكاثون:', hackathon.id)
    console.log('🎯 العنوان:', hackathon.title)
    console.log('📅 حالة الهاكاثون:', hackathon.status)
    console.log('')
    console.log('🔗 الروابط:')
    console.log(`📋 تفاصيل الهاكاثون: http://localhost:3001/hackathons/${hackathon.id}`)
    console.log(`📝 التسجيل: http://localhost:3001/hackathons/${hackathon.id}/register`)
    console.log('')
    console.log('✅ يمكنك الآن الذهاب إلى http://localhost:3001/hackathons لرؤية الهاكاثون!')
    
  } catch (error) {
    console.error('❌ خطأ في إعادة تعيين الهاكاثونات:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetHackathons()
