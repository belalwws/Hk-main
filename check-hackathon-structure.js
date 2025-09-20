const { PrismaClient } = require('@prisma/client');
process.env.DATABASE_URL = 'file:./dev.db';
const prisma = new PrismaClient();

async function checkHackathonStructure() {
  try {
    const hackathon = await prisma.hackathon.findFirst({
      where: { id: 'cmfrd5gme0002fdmgt2urqx6g' }
    });
    
    console.log('🔍 Hackathon structure:');
    console.log(JSON.stringify(hackathon, null, 2));
    
    // Test the API call format
    console.log('\n📊 Testing API response format:');
    if (hackathon) {
      const response = {
        id: hackathon.id,
        title: hackathon.title,
        description: hackathon.description,
        startDate: hackathon.startDate ? hackathon.startDate.toISOString() : null,
        endDate: hackathon.endDate ? hackathon.endDate.toISOString() : null,
        registrationDeadline: hackathon.registrationDeadline ? hackathon.registrationDeadline.toISOString() : null,
        maxParticipants: hackathon.maxParticipants,
        status: hackathon.status,
        prizes: hackathon.prizes,
        requirements: hackathon.requirements,
        categories: hackathon.categories,
        location: hackathon.location,
        createdAt: hackathon.createdAt ? hackathon.createdAt.toISOString() : null
      };
      
      console.log('API Response would be:');
      console.log(JSON.stringify(response, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkHackathonStructure();
