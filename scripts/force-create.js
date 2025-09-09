const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function forceCreate() {
  try {
    console.log('🚀 إنشاء قسري للبيانات...')

    // أولاً نشوف إيه الـ enums المتاحة
    const result = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::hackathonstatus)) as status_value
    `
    console.log('📋 Enum values:', result)

    // إنشاء الهاكاثون بـ raw SQL
    const hackathonId = 'hack_' + Date.now()
    
    await prisma.$executeRaw`
      INSERT INTO hackathons (
        id, 
        title, 
        description, 
        "startDate", 
        "endDate", 
        "registrationDeadline", 
        "maxParticipants", 
        status, 
        requirements, 
        "createdBy", 
        "createdAt", 
        "updatedAt"
      ) VALUES (
        ${hackathonId},
        'هاكاثون تطوير التطبيقات 2025',
        'مسابقة تطوير تطبيقات مبتكرة',
        '2025-02-15 09:00:00',
        '2025-02-17 18:00:00', 
        '2025-02-10 23:59:59',
        100,
        'open',
        'خبرة برمجة',
        'admin-id',
        datetime('now'),
        datetime('now')
      )
    `
    
    console.log('✅ تم إنشاء الهاكاثون:', hackathonId)

    // إنشاء المستخدمين والمشاركين
    const people = [
      'أحمد العلي', 'فاطمة الزهراني', 'محمد القحطاني', 'نورا الشمري', 'عبدالرحمن الغامدي',
      'سارة البقمي', 'يوسف الحربي', 'ريم العتيبي', 'خالد الدوسري', 'هند الشهري',
      'عمر المطيري', 'لينا الجهني', 'سلطان الرشيد', 'مريم العنزي', 'بندر الفيصل'
    ]

    const cities = ['الرياض', 'جدة', 'الدمام', 'مكة', 'الطائف']
    const passwordHash = await bcrypt.hash('password123', 10)

    for (let i = 0; i < people.length; i++) {
      const userId = 'user_' + Date.now() + '_' + i
      const participantId = 'part_' + Date.now() + '_' + i
      const name = people[i]
      const email = `user${i+1}_${Date.now()}@test.com`
      const city = cities[i % cities.length]

      try {
        // إنشاء المستخدم
        await prisma.$executeRaw`
          INSERT INTO users (
            id, 
            name, 
            email, 
            "password_hash", 
            phone, 
            city, 
            nationality, 
            role, 
            "createdAt", 
            "updatedAt"
          ) VALUES (
            ${userId},
            ${name},
            ${email},
            ${passwordHash},
            ${`+96650${1000000 + i}`},
            ${city},
            'سعودي',
            'participant',
            datetime('now'),
            datetime('now')
          )
        `

        // إنشاء المشاركة
        await prisma.$executeRaw`
          INSERT INTO participants (
            id, 
            "userId", 
            "hackathonId", 
            status, 
            "createdAt", 
            "updatedAt"
          ) VALUES (
            ${participantId},
            ${userId},
            ${hackathonId},
            'pending',
            datetime('now'),
            datetime('now')
          )
        `

        console.log(`✅ ${i+1}. ${name} - ${city}`)
        
      } catch (error) {
        console.log(`❌ خطأ في ${name}:`, error.message)
      }
    }

    // التحقق من النتائج
    const hackathonCheck = await prisma.$queryRaw`
      SELECT * FROM hackathons WHERE id = ${hackathonId}
    `
    
    const participantCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM participants WHERE "hackathonId" = ${hackathonId}
    `

    console.log('\n📊 النتائج النهائية:')
    console.log('🎯 الهاكاثون:', hackathonCheck[0]?.title)
    console.log('👥 عدد المشاركين:', participantCount[0]?.count)
    console.log('🆔 معرف الهاكاثون:', hackathonId)
    console.log('✅ تم إنشاء كل شيء بنجاح!')

  } catch (error) {
    console.error('❌ خطأ:', error.message)
    console.error('📋 تفاصيل الخطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

forceCreate()
