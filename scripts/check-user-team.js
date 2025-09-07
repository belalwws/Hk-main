const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserTeam() {
  try {
    // البحث عن المستخدم
    const user = await prisma.user.findFirst({
      where: { email: 'belal.ahmed121sq1@gmail.com' }
    });
    
    if (!user) {
      console.log('❌ المستخدم غير موجود');
      return;
    }
    
    console.log('👤 المستخدم:', user.name, user.email);
    console.log('🆔 معرف المستخدم:', user.id);
    
    // البحث عن عضوية المستخدم
    const participation = await prisma.participant.findFirst({
      where: {
        userId: user.id,
        status: 'APPROVED'
      },
      include: {
        team: true,
        hackathon: true
      }
    });
    
    if (!participation) {
      console.log('❌ المستخدم ليس عضواً في أي فريق');
      return;
    }
    
    console.log('✅ المستخدم عضو في:');
    console.log('🏆 الهاكاثون:', participation.hackathon.title);
    console.log('👥 الفريق:', participation.team?.name);
    console.log('🆔 معرف الفريق:', participation.teamId);
    console.log('📊 حالة المشاركة:', participation.status);
    
    // التحقق من الفريق المحدد في الخطأ
    const targetTeamId = 'cmf9wu2v00007fd6s57ae7jel';
    console.log('\n🎯 الفريق المطلوب في الخطأ:', targetTeamId);
    console.log('🔍 هل هو نفس فريق المستخدم؟', participation.teamId === targetTeamId ? 'نعم ✅' : 'لا ❌');
    
    if (participation.teamId !== targetTeamId) {
      console.log('⚠️ المستخدم يحاول رفع ملف لفريق مختلف!');
      console.log('📍 فريق المستخدم:', participation.teamId);
      console.log('📍 الفريق المطلوب:', targetTeamId);
    }
    
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserTeam();
