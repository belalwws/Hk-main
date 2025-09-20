const { PrismaClient } = require('@prisma/client');
process.env.DATABASE_URL = 'file:./dev.db';
const prisma = new PrismaClient();

async function checkHackathon() {
  try {
    const hackathons = await prisma.hackathon.findMany({
      select: { id: true, title: true, status: true }
    });
    
    console.log('📋 Available hackathons:');
    hackathons.forEach(h => {
      console.log(`- ID: ${h.id}`);
      console.log(`  Title: ${h.title}`);
      console.log(`  Status: ${h.status}`);
      console.log('');
    });
    
    if (hackathons.length === 0) {
      console.log('❌ No hackathons found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkHackathon();
