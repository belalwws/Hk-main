// Fix hackathon status from 'active' to 'open'

process.env.DATABASE_URL = 'file:./dev.db';

const { PrismaClient } = require('@prisma/client');

async function fixStatus() {
  let prisma;

  try {
    console.log('🔧 Fixing hackathon status...');

    prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Update all hackathons with status 'active' to 'open'
    console.log('📝 Updating hackathon status from active to open...');
    
    const result = await prisma.$executeRaw`
      UPDATE hackathons SET status = 'open' WHERE status = 'active'
    `;

    console.log(`✅ Updated hackathon status - affected rows: ${result}`);

    // Verify the update
    console.log('🔍 Verifying hackathons...');
    const hackathons = await prisma.$queryRaw`
      SELECT id, title, status FROM hackathons
    `;

    console.log('📊 Current hackathons:');
    hackathons.forEach(h => {
      console.log(`   - ${h.title}: ${h.status}`);
    });

    console.log('\n🎉 Status fix completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Test: http://localhost:3000/admin/hackathons');

  } catch (error) {
    console.error('❌ Error fixing status:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Run the fix
fixStatus();
