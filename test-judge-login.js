const { PrismaClient } = require('@prisma/client');

async function testJudgeLogin() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 فحص بيانات المحكم...');

    // Check if judge user exists
    const judgeUser = await prisma.user.findUnique({
      where: { email: 'judge2024@hackathon.com' }
    });

    if (!judgeUser) {
      console.log('❌ المحكم غير موجود');
      return;
    }

    console.log('✅ المحكم موجود:', judgeUser.name, judgeUser.email);

    // Check if judge is linked to hackathon
    const judge = await prisma.judge.findFirst({
      where: { 
        userId: judgeUser.id,
        isActive: true
      },
      include: {
        hackathon: {
          select: {
            id: true,
            title: true,
            evaluationOpen: true
          }
        }
      }
    });

    if (!judge) {
      console.log('❌ المحكم غير مرتبط بأي هاكاثون');
      return;
    }

    console.log('✅ المحكم مرتبط بالهاكاثون:', judge.hackathon.title);
    console.log('📊 حالة التقييم:', judge.hackathon.evaluationOpen ? 'مفتوح' : 'مغلق');

    console.log('\n🔑 بيانات تسجيل الدخول:');
    console.log('📧 الإيميل: judge2024@hackathon.com');
    console.log('🔐 كلمة المرور: judge123');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testJudgeLogin();
