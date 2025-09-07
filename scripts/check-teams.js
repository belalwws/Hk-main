const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const hackathon = await prisma.hackathon.findFirst({
      where: { title: 'تصميم وبرمجة موقع الكتروني' },
      include: {
        teams: {
          include: {
            participants: true,
            scores: true
          }
        }
      }
    });
    
    console.log('🎯 الهاكاثون:', hackathon?.title);
    console.log('👥 عدد الفرق:', hackathon?.teams?.length || 0);
    
    if (hackathon?.teams) {
      hackathon.teams.forEach((team, index) => {
        console.log(`فريق ${index + 1}: ${team.name || 'بدون اسم'}`);
        console.log(`  - عدد الأعضاء: ${team.participants?.length || 0}`);
        console.log(`  - عدد التقييمات: ${team.scores?.length || 0}`);
      });
    }
    
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
