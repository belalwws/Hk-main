const { PrismaClient } = require('@prisma/client');
process.env.DATABASE_URL = 'file:./dev.db';
const prisma = new PrismaClient();

async function testHackathonAPI() {
  try {
    const hackathonId = 'cmfrd5gme0002fdmgt2urqx6g';
    console.log('🔍 Testing hackathon API for:', hackathonId);
    
    // Simulate the API logic
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    });
    
    console.log('📊 Hackathon found:', hackathon ? 'Yes' : 'No');
    
    if (!hackathon) {
      console.log('❌ Hackathon not found');
      return;
    }
    
    // Get participant count separately
    let participantCount = 0;
    try {
      const participants = await prisma.participant.count({
        where: { hackathonId: hackathonId }
      });
      participantCount = participants;
      console.log('👥 Participant count:', participantCount);
    } catch (error) {
      console.log('⚠️ Could not count participants:', error.message);
    }
    
    // Format the response
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
      participantCount: participantCount,
      createdAt: hackathon.createdAt ? hackathon.createdAt.toISOString() : null
    };
    
    console.log('✅ API Response would be:');
    console.log(JSON.stringify({ hackathon: response }, null, 2));
    
    // Test actual HTTP call
    console.log('\n🌐 Testing actual HTTP call...');
    try {
      const fetch = (await import('node-fetch')).default;
      const httpResponse = await fetch(`http://localhost:3000/api/hackathons/${hackathonId}`);
      const data = await httpResponse.json();
      
      console.log('HTTP Status:', httpResponse.status);
      console.log('HTTP Response:', JSON.stringify(data, null, 2));
    } catch (httpError) {
      console.log('⚠️ HTTP test failed (server might not be running):', httpError.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testHackathonAPI();
