const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createFreshHackathon() {
  try {
    console.log('🧹 تنظيف البيانات القديمة...')
    
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

    // Create new hackathon
    const hackathon = await prisma.hackathon.create({
      data: {
        title: 'هاكاثون الابتكار التقني 2024',
        description: 'هاكاثون مثير للمطورين والمبدعين لتطوير حلول تقنية مبتكرة تخدم المجتمع والاقتصاد الرقمي. شارك معنا في رحلة الإبداع والابتكار!',
        startDate: new Date('2024-12-15T09:00:00Z'),
        endDate: new Date('2024-12-17T18:00:00Z'),
        registrationDeadline: new Date('2024-12-10T23:59:59Z'),
        maxParticipants: 100,
        status: 'OPEN',
        createdBy: adminUser.id,
        prizes: {
          first: '50,000 ريال سعودي + شهادة تقدير',
          second: '30,000 ريال سعودي + شهادة تقدير',
          third: '20,000 ريال سعودي + شهادة تقدير'
        },
        requirements: [
          'خبرة في البرمجة أو التصميم أو إدارة المشاريع',
          'القدرة على العمل ضمن فريق متعدد التخصصات',
          'تقديم مشروع مكتمل وقابل للتطبيق في نهاية الهاكاثون',
          'الالتزام بالمواعيد المحددة وحضور جميع الجلسات',
          'احترام قواعد السلوك المهني وأخلاقيات العمل',
          'تقديم عرض تقديمي للمشروع أمام لجنة التحكيم'
        ],
        categories: [
          'الذكاء الاصطناعي وتعلم الآلة',
          'تطبيقات الجوال والويب',
          'الأمن السيبراني وحماية البيانات',
          'إنترنت الأشياء والمدن الذكية',
          'البلوك تشين والعملات الرقمية',
          'الواقع المعزز والافتراضي',
          'التجارة الإلكترونية والفنتك',
          'الصحة الرقمية والتطبيقات الطبية'
        ]
      }
    })

    console.log('')
    console.log('🎉 تم إنشاء هاكاثون جديد بنجاح!')
    console.log('=' .repeat(60))
    console.log(`📋 معرف الهاكاثون: ${hackathon.id}`)
    console.log(`🎯 العنوان: ${hackathon.title}`)
    console.log(`📅 حالة الهاكاثون: ${hackathon.status}`)
    console.log(`👥 الحد الأقصى للمشاركين: ${hackathon.maxParticipants}`)
    console.log('')
    console.log('🔗 الروابط المهمة:')
    console.log(`🏠 الصفحة الرئيسية: http://localhost:3001/hackathons`)
    console.log(`📋 تفاصيل الهاكاثون: http://localhost:3001/hackathons/${hackathon.id}`)
    console.log(`📝 التسجيل: http://localhost:3001/hackathons/${hackathon.id}/register`)
    console.log(`⚙️ إدارة الهاكاثون: http://localhost:3001/admin/hackathons/${hackathon.id}`)
    console.log('')
    console.log('👨‍💼 للأدمن:')
    console.log('📧 البريد: admin@hackathon.com')
    console.log('🔑 كلمة المرور: admin123')
    console.log('')
    console.log('👤 للمستخدم العادي:')
    console.log('📧 البريد: user@test.com')
    console.log('🔑 كلمة المرور: user123')
    console.log('')
    console.log('✅ يمكنك الآن اختبار النظام!')
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الهاكاثون:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createFreshHackathon()
