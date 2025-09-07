const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignJudgeToHackathon() {
  try {
    console.log('🔍 البحث عن المحكم والهاكاثون...');

    // البحث عن المحكم
    const judge = await prisma.user.findUnique({
      where: { email: 'judge@hackathon.com' }
    });

    if (!judge) {
      console.log('❌ المحكم غير موجود');
      return;
    }

    console.log('✅ تم العثور على المحكم:', judge.name);

    // البحث عن الهاكاثون النشط
    const hackathon = await prisma.hackathon.findFirst({
      where: {
        status: { in: ['OPEN', 'CLOSED'] } // الهاكاثونات المفتوحة أو المغلقة
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!hackathon) {
      console.log('❌ لا توجد هاكاثونات متاحة');
      return;
    }

    console.log('✅ تم العثور على الهاكاثون:', hackathon.title);

    // التحقق من وجود تعيين سابق
    const existingAssignment = await prisma.judge.findFirst({
      where: {
        userId: judge.id,
        hackathonId: hackathon.id
      }
    });

    if (existingAssignment) {
      console.log('⚠️ المحكم مُعيَّن بالفعل لهذا الهاكاثون');
      console.log('🆔 معرف التعيين:', existingAssignment.id);
      return;
    }

    // تعيين المحكم للهاكاثون
    const assignment = await prisma.judge.create({
      data: {
        userId: judge.id,
        hackathonId: hackathon.id,
        isActive: true
      }
    });

    console.log('✅ تم تعيين المحكم للهاكاثون بنجاح!');
    console.log('🆔 معرف التعيين:', assignment.id);
    console.log('👤 المحكم:', judge.name);
    console.log('🏆 الهاكاثون:', hackathon.title);

    // عرض معايير التقييم
    const criteria = await prisma.evaluationCriterion.findMany({
      where: { hackathonId: hackathon.id }
    });

    if (criteria.length > 0) {
      console.log('\n📊 معايير التقييم المتاحة:');
      criteria.forEach((criterion, index) => {
        console.log(`${index + 1}. ${criterion.name} (الوزن: ${criterion.weight}%)`);
        if (criterion.description) {
          console.log(`   الوصف: ${criterion.description}`);
        }
      });
    } else {
      console.log('\n⚠️ لا توجد معايير تقييم محددة لهذا الهاكاثون');
    }

    // عرض الفرق المتاحة للتقييم
    const teams = await prisma.team.findMany({
      where: { hackathonId: hackathon.id },
      include: {
        participants: {
          include: { user: true }
        }
      }
    });

    if (teams.length > 0) {
      console.log(`\n👥 الفرق المتاحة للتقييم (${teams.length} فريق):`);
      teams.forEach((team, index) => {
        console.log(`${index + 1}. ${team.name} (${team.participants.length} أعضاء)`);
        if (team.ideaTitle) {
          console.log(`   الفكرة: ${team.ideaTitle}`);
        }
      });
    } else {
      console.log('\n⚠️ لا توجد فرق مسجلة في هذا الهاكاثون');
    }

    console.log('\n🎯 يمكن للمحكم الآن الوصول إلى:');
    console.log('📊 صفحة التقييم: http://localhost:3000/judge/evaluate');
    console.log('🏠 لوحة التحكم: http://localhost:3000/judge/dashboard');

  } catch (error) {
    console.error('❌ خطأ في تعيين المحكم:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignJudgeToHackathon();
