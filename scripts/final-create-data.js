const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createFinalData() {
  try {
    console.log('🚀 إنشاء بيانات الهاكاثون والمشاركين...')

    // إنشاء الهاكاثون
    let hackathon
    try {
      hackathon = await prisma.hackathon.findUnique({
        where: { id: 'hackathon_test_2025' }
      })
      
      if (!hackathon) {
        hackathon = await prisma.hackathon.create({
          data: {
            id: 'hackathon_test_2025',
            title: 'هاكاثون تطوير التطبيقات المبتكرة 2025',
            description: 'مسابقة لتطوير تطبيقات مبتكرة تخدم المجتمع السعودي',
            startDate: new Date('2025-02-15T09:00:00.000Z'),
            endDate: new Date('2025-02-17T18:00:00.000Z'),
            registrationDeadline: new Date('2025-02-10T23:59:59.000Z'),
            maxParticipants: 100,
            status: 'open',
            requirements: 'خبرة في البرمجة، العمل الجماعي، الإبداع',
            createdBy: 'admin_user_id'
          }
        })
        console.log('✅ تم إنشاء الهاكاثون')
      } else {
        console.log('✅ الهاكاثون موجود مسبقاً')
      }
    } catch (error) {
      console.log('❌ خطأ في إنشاء الهاكاثون:', error.message)
      return
    }

    // بيانات المشاركين
    const participants = [
      { name: 'أحمد محمد العلي', email: 'ahmed.ali@test.com', city: 'الرياض' },
      { name: 'فاطمة عبدالله الزهراني', email: 'fatima.zahrani@test.com', city: 'جدة' },
      { name: 'محمد سعد القحطاني', email: 'mohammed.qahtani@test.com', city: 'الدمام' },
      { name: 'نورا خالد الشمري', email: 'nora.shamri@test.com', city: 'الرياض' },
      { name: 'عبدالرحمن أحمد الغامدي', email: 'abdulrahman.ghamdi@test.com', city: 'الطائف' },
      { name: 'سارة عمر البقمي', email: 'sara.baqami@test.com', city: 'مكة المكرمة' },
      { name: 'يوسف علي الحربي', email: 'youssef.harbi@test.com', city: 'المدينة المنورة' },
      { name: 'ريم محمد العتيبي', email: 'reem.otaibi@test.com', city: 'جدة' },
      { name: 'خالد عبدالعزيز الدوسري', email: 'khalid.dosari@test.com', city: 'الخبر' },
      { name: 'هند سالم الشهري', email: 'hind.shahri@test.com', city: 'أبها' },
      { name: 'عمر فهد المطيري', email: 'omar.mutairi@test.com', city: 'حائل' },
      { name: 'لينا أحمد الجهني', email: 'lina.juhani@test.com', city: 'ينبع' },
      { name: 'سلطان عبدالله الرشيد', email: 'sultan.rashid@test.com', city: 'بريدة' },
      { name: 'مريم خالد العنزي', email: 'mariam.anzi@test.com', city: 'تبوك' },
      { name: 'بندر سعود الفيصل', email: 'bandar.faisal@test.com', city: 'الجوف' }
    ]

    console.log('\n📝 إنشاء المشاركين...')
    let successCount = 0

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i]
      
      try {
        // التحقق من وجود المستخدم
        let user = await prisma.user.findUnique({
          where: { email: p.email }
        })

        if (!user) {
          // إنشاء المستخدم
          const hashedPassword = await bcrypt.hash('password123', 10)
          
          user = await prisma.user.create({
            data: {
              name: p.name,
              email: p.email,
              password_hash: hashedPassword,
              phone: `+96650${1000000 + i}`,
              city: p.city,
              nationality: 'سعودي',
              role: 'participant'
            }
          })
        }

        // التحقق من وجود المشاركة
        const existingParticipant = await prisma.participant.findFirst({
          where: {
            userId: user.id,
            hackathonId: hackathon.id
          }
        })

        if (!existingParticipant) {
          // إنشاء المشاركة
          await prisma.participant.create({
            data: {
              userId: user.id,
              hackathonId: hackathon.id,
              status: 'pending'
            }
          })
        }

        console.log(`✅ ${i + 1}. ${p.name} - ${p.city}`)
        successCount++
        
      } catch (error) {
        console.log(`❌ خطأ في ${p.name}:`, error.message)
      }
    }

    // إحصائيات نهائية
    const totalParticipants = await prisma.participant.count({
      where: { hackathonId: hackathon.id }
    })

    const pendingParticipants = await prisma.participant.count({
      where: { 
        hackathonId: hackathon.id,
        status: 'pending'
      }
    })

    console.log('\n📊 الإحصائيات النهائية:')
    console.log(`🎯 الهاكاثون: ${hackathon.title}`)
    console.log(`👥 إجمالي المشاركين: ${totalParticipants}`)
    console.log(`⏳ المشاركين في انتظار الموافقة: ${pendingParticipants}`)
    console.log(`🆔 معرف الهاكاثون: ${hackathon.id}`)
    console.log(`✅ تم إنشاء ${successCount} مشارك جديد`)

  } catch (error) {
    console.error('❌ خطأ عام:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createFinalData()
