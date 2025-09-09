const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestData() {
  try {
    console.log('🚀 إنشاء بيانات تجريبية...')

    // إنشاء hash للباسورد
    const passwordHash = await bcrypt.hash('password123', 10)

    // إنشاء الهاكاثون باستخدام raw SQL
    await prisma.$executeRaw`
      INSERT INTO hackathons (id, title, description, "startDate", "endDate", "registrationDeadline", "maxParticipants", status, requirements, "createdBy", "createdAt", "updatedAt")
      VALUES (
        'hackathon_test_2025',
        'هاكاثون تطوير التطبيقات المبتكرة 2025',
        'مسابقة لتطوير تطبيقات مبتكرة تخدم المجتمع السعودي',
        '2025-02-15 09:00:00'::timestamp,
        '2025-02-17 18:00:00'::timestamp,
        '2025-02-10 23:59:59'::timestamp,
        100,
        'open'::hackathonstatus,
        'خبرة في البرمجة، العمل الجماعي، الإبداع',
        'admin_user_id',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO NOTHING
    `

    console.log('✅ تم إنشاء الهاكاثون')

    // بيانات المشاركين
    const participants = [
      { id: 'user_001', name: 'أحمد محمد العلي', email: 'ahmed.ali@test.com', city: 'الرياض' },
      { id: 'user_002', name: 'فاطمة عبدالله الزهراني', email: 'fatima.zahrani@test.com', city: 'جدة' },
      { id: 'user_003', name: 'محمد سعد القحطاني', email: 'mohammed.qahtani@test.com', city: 'الدمام' },
      { id: 'user_004', name: 'نورا خالد الشمري', email: 'nora.shamri@test.com', city: 'الرياض' },
      { id: 'user_005', name: 'عبدالرحمن أحمد الغامدي', email: 'abdulrahman.ghamdi@test.com', city: 'الطائف' },
      { id: 'user_006', name: 'سارة عمر البقمي', email: 'sara.baqami@test.com', city: 'مكة المكرمة' },
      { id: 'user_007', name: 'يوسف علي الحربي', email: 'youssef.harbi@test.com', city: 'المدينة المنورة' },
      { id: 'user_008', name: 'ريم محمد العتيبي', email: 'reem.otaibi@test.com', city: 'جدة' },
      { id: 'user_009', name: 'خالد عبدالعزيز الدوسري', email: 'khalid.dosari@test.com', city: 'الخبر' },
      { id: 'user_010', name: 'هند سالم الشهري', email: 'hind.shahri@test.com', city: 'أبها' },
      { id: 'user_011', name: 'عمر فهد المطيري', email: 'omar.mutairi@test.com', city: 'حائل' },
      { id: 'user_012', name: 'لينا أحمد الجهني', email: 'lina.juhani@test.com', city: 'ينبع' },
      { id: 'user_013', name: 'سلطان عبدالله الرشيد', email: 'sultan.rashid@test.com', city: 'بريدة' },
      { id: 'user_014', name: 'مريم خالد العنزي', email: 'mariam.anzi@test.com', city: 'تبوك' },
      { id: 'user_015', name: 'بندر سعود الفيصل', email: 'bandar.faisal@test.com', city: 'الجوف' }
    ]

    console.log('📝 إنشاء المستخدمين...')

    // إنشاء المستخدمين
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i]
      try {
        await prisma.$executeRaw`
          INSERT INTO users (id, name, email, "password_hash", phone, city, nationality, role, "createdAt", "updatedAt")
          VALUES (
            ${p.id},
            ${p.name},
            ${p.email},
            ${passwordHash},
            ${`+96650${1000000 + i}`},
            ${p.city},
            'سعودي',
            'participant'::userrole,
            NOW(),
            NOW()
          )
          ON CONFLICT (email) DO NOTHING
        `
        console.log(`✅ ${i + 1}. ${p.name}`)
      } catch (error) {
        console.log(`⚠️ ${p.name} موجود مسبقاً`)
      }
    }

    console.log('📝 إنشاء المشاركات...')

    // إنشاء المشاركات
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i]
      try {
        await prisma.$executeRaw`
          INSERT INTO participants (id, "userId", "hackathonId", status, "registeredAt", "createdAt", "updatedAt")
          VALUES (
            ${`part_${String(i + 1).padStart(3, '0')}`},
            ${p.id},
            'hackathon_test_2025',
            'pending'::participantstatus,
            NOW(),
            NOW(),
            NOW()
          )
          ON CONFLICT (id) DO NOTHING
        `
      } catch (error) {
        console.log(`⚠️ مشاركة ${p.name} موجودة مسبقاً`)
      }
    }

    // التحقق من النتائج
    const hackathonCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM hackathons WHERE id = 'hackathon_test_2025'
    `
    
    const participantCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM participants WHERE "hackathonId" = 'hackathon_test_2025'
    `

    console.log('\n📊 النتائج:')
    console.log(`🎯 الهاكاثونات: ${hackathonCount[0].count}`)
    console.log(`👥 المشاركين: ${participantCount[0].count}`)
    console.log('✅ تم إنشاء البيانات بنجاح!')

  } catch (error) {
    console.error('❌ خطأ:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createTestData()
