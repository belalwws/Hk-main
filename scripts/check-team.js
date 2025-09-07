const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTeamStructure() {
  try {
    // التحقق من الفريق المحدد
    const team = await prisma.team.findUnique({
      where: { id: 'cmf9wu2v00007fd6s57ae7jel' },
      include: {
        participants: {
          include: {
            user: true
          }
        },
        hackathon: true
      }
    });
    
    if (!team) {
      console.log('❌ الفريق غير موجود');
      return;
    }
    
    console.log('🎯 معلومات الفريق:');
    console.log('- اسم الفريق:', team.name);
    console.log('- الهاكاثون:', team.hackathon?.title);
    console.log('- عدد الأعضاء:', team.participants?.length || 0);
    
    if (team.participants && team.participants.length > 0) {
      console.log('\n👥 أعضاء الفريق:');
      team.participants.forEach((participant, index) => {
        console.log(`${index + 1}. ${participant.user.name} (${participant.user.email})`);
        console.log(`   - الحالة: ${participant.status}`);
        console.log(`   - معرف المستخدم: ${participant.userId}`);
        console.log(`   - معرف المشارك: ${participant.id}`);
      });
    }
    
    // التحقق من المستخدم الحالي
    const currentUser = await prisma.user.findFirst({
      where: { email: 'belal.ahmed121sq1@gmail.com' }
    });
    
    if (currentUser) {
      console.log('\n🔍 المستخدم الحالي:');
      console.log('- الاسم:', currentUser.name);
      console.log('- الإيميل:', currentUser.email);
      console.log('- معرف المستخدم:', currentUser.id);
      
      // التحقق من عضوية الفريق
      const membership = await prisma.participant.findFirst({
        where: {
          userId: currentUser.id,
          teamId: 'cmf9wu2v00007fd6s57ae7jel',
          status: 'APPROVED'
        }
      });
      
      if (membership) {
        console.log('✅ المستخدم عضو في الفريق');
      } else {
        console.log('❌ المستخدم ليس عضواً في الفريق');
        
        // البحث عن عضوية في أي فريق
        const anyMembership = await prisma.participant.findFirst({
          where: {
            userId: currentUser.id,
            status: 'APPROVED'
          },
          include: {
            team: true
          }
        });
        
        if (anyMembership) {
          console.log(`🔍 المستخدم عضو في فريق آخر: ${anyMembership.team?.name} (${anyMembership.teamId})`);
        } else {
          console.log('❌ المستخدم ليس عضواً في أي فريق');
        }
      }
    }
    
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTeamStructure();
