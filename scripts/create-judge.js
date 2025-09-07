const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createJudge() {
  try {
    // بيانات المحكم
    const judgeData = {
      name: 'محكم الهاكاثون',
      email: 'judge@hackathon.com',
      password: 'judge123',
      role: 'JUDGE'
    };

    console.log('🔐 إنشاء حساب محكم...');
    console.log('📧 الإيميل:', judgeData.email);
    console.log('🔑 كلمة المرور:', judgeData.password);

    // التحقق من وجود المحكم
    const existingJudge = await prisma.user.findUnique({
      where: { email: judgeData.email }
    });

    if (existingJudge) {
      console.log('⚠️ المحكم موجود بالفعل');
      console.log('🆔 معرف المحكم:', existingJudge.id);
      console.log('👤 الاسم:', existingJudge.name);
      console.log('📧 الإيميل:', existingJudge.email);
      console.log('🎭 الدور:', existingJudge.role);
      return;
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(judgeData.password, 10);

    // إنشاء المحكم
    const judge = await prisma.user.create({
      data: {
        name: judgeData.name,
        email: judgeData.email,
        password_hash: hashedPassword,
        role: judgeData.role,
        isActive: true
      }
    });

    console.log('✅ تم إنشاء حساب المحكم بنجاح!');
    console.log('🆔 معرف المحكم:', judge.id);
    console.log('👤 الاسم:', judge.name);
    console.log('📧 الإيميل:', judge.email);
    console.log('🎭 الدور:', judge.role);

    console.log('\n🔑 بيانات تسجيل الدخول:');
    console.log('📧 الإيميل: judge@hackathon.com');
    console.log('🔐 كلمة المرور: judge123');
    console.log('🌐 رابط تسجيل الدخول: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ خطأ في إنشاء المحكم:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createJudge();
