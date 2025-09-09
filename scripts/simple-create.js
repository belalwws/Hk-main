const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function simpleCreate() {
  try {
    console.log('🚀 إنشاء بسيط...')

    // إنشاء المستخدمين فقط أولاً
    const people = [
      { name: 'أحمد العلي', email: 'ahmed1@test.com', city: 'الرياض' },
      { name: 'فاطمة الزهراني', email: 'fatima2@test.com', city: 'جدة' },
      { name: 'محمد القحطاني', email: 'mohammed3@test.com', city: 'الدمام' },
      { name: 'نورا الشمري', email: 'nora4@test.com', city: 'الرياض' },
      { name: 'عبدالرحمن الغامدي', email: 'abdulrahman5@test.com', city: 'الطائف' },
      { name: 'سارة البقمي', email: 'sara6@test.com', city: 'مكة' },
      { name: 'يوسف الحربي', email: 'youssef7@test.com', city: 'المدينة' },
      { name: 'ريم العتيبي', email: 'reem8@test.com', city: 'جدة' },
      { name: 'خالد الدوسري', email: 'khalid9@test.com', city: 'الخبر' },
      { name: 'هند الشهري', email: 'hind10@test.com', city: 'أبها' },
      { name: 'عمر المطيري', email: 'omar11@test.com', city: 'حائل' },
      { name: 'لينا الجهني', email: 'lina12@test.com', city: 'ينبع' },
      { name: 'سلطان الرشيد', email: 'sultan13@test.com', city: 'بريدة' },
      { name: 'مريم العنزي', email: 'mariam14@test.com', city: 'تبوك' },
      { name: 'بندر الفيصل', email: 'bandar15@test.com', city: 'الجوف' }
    ]

    const passwordHash = await bcrypt.hash('password123', 10)
    const createdUsers = []

    console.log('📝 إنشاء المستخدمين...')

    for (let i = 0; i < people.length; i++) {
      const p = people[i]
      
      try {
        // التحقق من وجود المستخدم
        const existingUser = await prisma.user.findUnique({
          where: { email: p.email }
        })

        if (existingUser) {
          console.log(`⚠️ ${p.name} موجود مسبقاً`)
          createdUsers.push(existingUser)
          continue
        }

        // إنشاء المستخدم
        const user = await prisma.user.create({
          data: {
            name: p.name,
            email: p.email,
            password_hash: passwordHash,
            phone: `+96650${1000000 + i}`,
            city: p.city,
            nationality: 'سعودي',
            role: 'participant'
          }
        })

        createdUsers.push(user)
        console.log(`✅ ${i+1}. ${p.name} - ${p.city}`)
        
      } catch (error) {
        console.log(`❌ خطأ في ${p.name}:`, error.message)
      }
    }

    console.log(`\n✅ تم إنشاء ${createdUsers.length} مستخدم`)
    console.log('\n📋 الآن اذهب لـ Prisma Studio لإنشاء الهاكاثون والمشاركات:')
    console.log('🌐 http://localhost:5555')
    console.log('\n📝 خطوات إنشاء الهاكاثون:')
    console.log('1. اذهب لـ Hackathon table')
    console.log('2. اضغط Add record')
    console.log('3. املأ البيانات:')
    console.log('   - Title: هاكاثون تطوير التطبيقات 2025')
    console.log('   - Description: مسابقة تطوير تطبيقات مبتكرة')
    console.log('   - Start Date: 2025-02-15T09:00:00.000Z')
    console.log('   - End Date: 2025-02-17T18:00:00.000Z')
    console.log('   - Registration Deadline: 2025-02-10T23:59:59.000Z')
    console.log('   - Max Participants: 100')
    console.log('   - Status: open')
    console.log('   - Requirements: خبرة برمجة')
    console.log('   - Created By: admin-id')
    console.log('\n📝 خطوات إنشاء المشاركات:')
    console.log('1. اذهب لـ Participant table')
    console.log('2. اضغط Add record لكل مستخدم')
    console.log('3. اختر User ID و Hackathon ID')
    console.log('4. Status: pending')

    console.log('\n👥 المستخدمين المُنشأين:')
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.id}) - ${user.email}`)
    })

  } catch (error) {
    console.error('❌ خطأ عام:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

simpleCreate()
