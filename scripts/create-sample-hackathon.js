const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createSampleHackathon() {
  try {
    // First, find an admin user to be the creator
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.log('❌ لا يوجد مستخدم أدمن. يجب إنشاء مستخدم أدمن أولاً.')
      return
    }

    // Create a sample hackathon with OPEN status
    const hackathon = await prisma.hackathon.create({
      data: {
        title: 'هاكاثون الابتكار التقني 2024',
        description: 'هاكاثون مثير للمطورين والمبدعين لتطوير حلول تقنية مبتكرة تخدم المجتمع',
        startDate: new Date('2024-12-15T09:00:00Z'),
        endDate: new Date('2024-12-17T18:00:00Z'),
        registrationDeadline: new Date('2024-12-10T23:59:59Z'),
        maxParticipants: 100,
        status: 'open', // مفتوح للتسجيل
        createdBy: adminUser.id,
        prizes: {
          first: '50,000 ريال سعودي',
          second: '30,000 ريال سعودي',
          third: '20,000 ريال سعودي'
        },
        requirements: [
          'خبرة في البرمجة أو التصميم',
          'العمل ضمن فريق',
          'تقديم مشروع مكتمل',
          'الالتزام بالمواعيد المحددة'
        ],
        categories: [
          'الذكاء الاصطناعي',
          'تطبيقات الجوال',
          'الأمن السيبراني',
          'إنترنت الأشياء'
        ]
      }
    })

    console.log('✅ تم إنشاء هاكاثون تجريبي بنجاح!')
    console.log('📋 معرف الهاكاثون:', hackathon.id)
    console.log('🎯 العنوان:', hackathon.title)
    console.log('📅 حالة الهاكاثون:', hackathon.status)
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الهاكاثون:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleHackathon()
