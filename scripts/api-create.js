// استخدام fetch المدمج في Node.js 18+

async function createViaAPI() {
  try {
    console.log('🚀 إنشاء البيانات عبر API...')

    const baseUrl = 'http://localhost:3000'

    // بيانات المشاركين
    const participants = [
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

    console.log('📝 تسجيل المشاركين...')

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i]
      
      try {
        const response = await fetch(`${baseUrl}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: p.name,
            email: p.email,
            password: 'password123',
            phone: `+96650${1000000 + i}`,
            city: p.city,
            nationality: 'سعودي',
            skills: 'برمجة وتطوير',
            experience: 'خبرة متوسطة',
            preferredRole: 'مطور'
          })
        })

        const result = await response.json()
        
        if (response.ok) {
          console.log(`✅ ${i+1}. ${p.name} - ${p.city}`)
        } else {
          console.log(`⚠️ ${p.name}: ${result.error || 'خطأ غير معروف'}`)
        }
        
      } catch (error) {
        console.log(`❌ خطأ في ${p.name}:`, error.message)
      }

      // انتظار قصير بين الطلبات
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('\n🎯 تم تسجيل المشاركين!')
    console.log('📋 الآن اذهب للوحة الإدارة لإنشاء الهاكاثون وإضافة المشاركين إليه')
    console.log('🌐 رابط لوحة الإدارة: http://localhost:3000/admin')

  } catch (error) {
    console.error('❌ خطأ عام:', error.message)
  }
}

createViaAPI()
