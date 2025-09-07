const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

async function addTestUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 إضافة 20 مستخدم تجريبي...');

    const hackathonId = 'cmf7qg3e80002fd74fas4n8vc';
    
    // أسماء عربية عشوائية
    const firstNames = [
      'أحمد', 'محمد', 'عبدالله', 'سارة', 'فاطمة', 'علي', 'خالد', 'نورا', 'ريم', 'عمر',
      'يوسف', 'مريم', 'عبدالرحمن', 'هند', 'سلمان', 'دانا', 'فهد', 'لينا', 'بندر', 'رنا'
    ];
    
    const lastNames = [
      'الأحمد', 'المحمد', 'العلي', 'الخالد', 'السعد', 'الحربي', 'القحطاني', 'الغامدي',
      'العتيبي', 'الدوسري', 'الشهري', 'الزهراني', 'العنزي', 'الرشيد', 'المطيري',
      'الشمري', 'البقمي', 'الجهني', 'الثقفي', 'السبيعي'
    ];

    const cities = ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة', 'الطائف', 'تبوك', 'أبها', 'الخبر', 'القطيف'];
    
    const roles = [
      'مطور واجهات أمامية',
      'مطور خلفية', 
      'مصمم UI/UX',
      'مطور ذكاء اصطناعي',
      'محلل أعمال',
      'مطور تطبيقات موبايل',
      'مختص أمن سيبراني',
      'مصمم جرافيك',
      'قائد الفريق',
      'مطور قواعد البيانات'
    ];

    const projectTitles = [
      'منصة التعليم الذكي',
      'تطبيق إدارة المهام',
      'نظام إدارة المستشفيات',
      'منصة التجارة الإلكترونية',
      'تطبيق الصحة الذكي',
      'نظام إدارة المخزون',
      'منصة التواصل الاجتماعي',
      'تطبيق الطعام والتوصيل',
      'نظام إدارة الموارد البشرية',
      'منصة الحجوزات الذكية',
      'تطبيق اللياقة البدنية',
      'نظام إدارة المدارس',
      'منصة الاستثمار الذكي',
      'تطبيق النقل الذكي',
      'نظام إدارة العقارات',
      'منصة التعلم عن بُعد',
      'تطبيق الطقس الذكي',
      'نظام إدارة المشاريع',
      'منصة الألعاب التعليمية',
      'تطبيق الذكاء الاصطناعي'
    ];

    const users = [];
    
    for (let i = 1; i <= 20; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${firstName} ${lastName}`;
      const email = `user${i}.test2024@gmail.com`;
      const city = cities[Math.floor(Math.random() * cities.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const projectTitle = projectTitles[i - 1]; // استخدام عنوان مختلف لكل مستخدم
      
      // إنشاء المستخدم
      const user = await prisma.user.create({
        data: {
          name: fullName,
          email: email,
          password_hash: await bcrypt.hash('123456', 10),
          role: 'PARTICIPANT',
          phone: `05${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
          city: city,
          nationality: 'سعودي',
          preferredRole: role
        }
      });

      // تسجيل المستخدم في الهاكاثون
      await prisma.participant.create({
        data: {
          userId: user.id,
          hackathonId: hackathonId,
          teamName: `فريق ${fullName}`,
          projectTitle: projectTitle,
          projectDescription: `وصف مشروع ${projectTitle} - مشروع مبتكر يهدف إلى حل مشاكل حقيقية باستخدام التكنولوجيا الحديثة`,
          githubRepo: `https://github.com/user${i}/${projectTitle.replace(/\s+/g, '-').toLowerCase()}`,
          teamRole: role,
          status: Math.random() > 0.2 ? 'APPROVED' : 'PENDING' // 80% مقبولين، 20% في الانتظار
        }
      });

      users.push({ name: fullName, email, city, role, project: projectTitle });
      console.log(`✅ تم إنشاء المستخدم ${i}: ${fullName} - ${city} - ${role}`);
    }

    console.log('\n🎉 تم إنشاء وتسجيل 20 مستخدم بنجاح!');
    console.log('\n📊 ملخص المستخدمين:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.city} - ${user.role}`);
      console.log(`   المشروع: ${user.project}`);
    });
    
    console.log('\n🔑 جميع كلمات المرور: 123456');
    console.log(`🎯 تم تسجيلهم في الهاكاثون: ${hackathonId}`);

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addTestUsers();
