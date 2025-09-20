const { PrismaClient } = require('@prisma/client');
process.env.DATABASE_URL = 'file:./dev.db';
const prisma = new PrismaClient();

async function checkParticipantsTable() {
  try {
    console.log('🔍 Checking participants table structure...');
    
    // Try to get table info using raw SQL
    const result = await prisma.$queryRaw`PRAGMA table_info(participants)`;
    console.log('📊 Participants table columns:');
    result.forEach(col => {
      console.log(`- ${col.name}: ${col.type}`);
    });
    
    // Try simple query without include
    const count = await prisma.participant.count();
    console.log('📊 Total participants:', count);
    
    if (count > 0) {
      // Try to get one participant without include
      const participant = await prisma.participant.findFirst();
      console.log('📊 Sample participant:', participant);
    }
    
    // Check if we can query participants without problematic fields
    console.log('🔍 Testing simple participant query...');
    const participants = await prisma.participant.findMany({
      select: {
        id: true,
        userId: true,
        hackathonId: true,
        status: true,
        teamId: true,
        teamName: true
      }
    });
    console.log('✅ Simple query works! Found:', participants.length);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkParticipantsTable();
