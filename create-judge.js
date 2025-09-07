const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

async function createJudge() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 إنشاء حساب محكم...');

    const hackathonId = 'cmf7nx1av0001fdqklylpkzlz';
    
    // إنشاء مستخدم محكم
    const judgeUser = await prisma.user.create({
      data: {
        name: 'د. أحمد المحكم',
        email: 'judge2024@hackathon.com',
        password_hash: await bcrypt.hash('judge123', 10),
        role: 'JUDGE',
        phone: '0501234567',
        city: 'الرياض',
        nationality: 'سعودي'
      }
    });

    // ربط المحكم بالهاكاثون
    const judge = await prisma.judge.create({
      data: {
        userId: judgeUser.id,
        hackathonId: hackathonId,
        isActive: true
      }
    });

    console.log('✅ تم إنشاء حساب المحكم بنجاح!');
    console.log('📧 البريد الإلكتروني: judge2024@hackathon.com');
    console.log('🔑 كلمة المرور: judge123');
    console.log(`🎯 مرتبط بالهاكاثون: ${hackathonId}`);

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createJudge();
