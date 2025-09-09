const { PrismaClient } = require('@prisma/client')
const { v4: uuidv4 } = require('uuid')

const prisma = new PrismaClient()

async function quickCreate() {
  try {
    console.log('🚀 إنشاء سريع...')

    // إنشاء الهاكاثون
    const hackathon = await prisma.hackathon.create({
      data: {
        title: 'هاكاثون تطوير التطبيقات 2025',
        description: 'مسابقة تطوير تطبيقات مبتكرة',
        startDate: new Date('2025-02-15'),
        endDate: new Date('2025-02-17'),
        registrationDeadline: new Date('2025-02-10'),
        maxParticipants: 100,
        status: 'open',
        requirements: 'خبرة برمجة',
        createdBy: 'admin-id'
      }
    })
    console.log('✅ هاكاثون تم')

    // المشاركين
    const people = [
      'أحمد العلي', 'فاطمة الزهراني', 'محمد القحطاني', 'نورا الشمري', 'عبدالرحمن الغامدي',
      'سارة البقمي', 'يوسف الحربي', 'ريم العتيبي', 'خالد الدوسري', 'هند الشهري',
      'عمر المطيري', 'لينا الجهني', 'سلطان الرشيد', 'مريم العنزي', 'بندر الفيصل'
    ]

    const cities = ['الرياض', 'جدة', 'الدمام', 'مكة', 'الطائف']

    for (let i = 0; i < people.length; i++) {
      const name = people[i]
      const email = `user${i+1}@test.com`
      const city = cities[i % cities.length]

      try {
        // إنشاء المستخدم
        const user = await prisma.user.create({
          data: {
            name: name,
            email: email,
            password_hash: '$2a$10$hash',
            phone: `+96650${1000000 + i}`,
            city: city,
            nationality: 'سعودي',
            role: 'participant'
          }
        })

        // إنشاء المشاركة
        await prisma.participant.create({
          data: {
            userId: user.id,
            hackathonId: hackathon.id,
            status: 'pending'
          }
        })

        console.log(`✅ ${i+1}. ${name}`)
      } catch (error) {
        console.log(`❌ ${name}: ${error.message}`)
      }
    }

    console.log(`\n🎯 تم! هاكاثون مع 15 مشارك pending`)
    console.log(`🆔 ID: ${hackathon.id}`)

  } catch (error) {
    console.error('❌', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

quickCreate()
