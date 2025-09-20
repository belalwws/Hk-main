// Test current database

process.env.DATABASE_URL = 'file:./dev.db';

const { PrismaClient } = require('@prisma/client');

async function testCurrentDatabase() {
  let prisma;

  try {
    console.log('🧪 Testing current database...');

    prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test basic counts
    const stats = {
      hackathons: await prisma.hackathon.count(),
      users: await prisma.user.count(),
      teams: await prisma.team.count(),
      participants: await prisma.participant.count(),
      admins: await prisma.admin.count()
    };

    console.log('📊 Database stats:');
    console.log(`   - Hackathons: ${stats.hackathons}`);
    console.log(`   - Users: ${stats.users}`);
    console.log(`   - Teams: ${stats.teams}`);
    console.log(`   - Participants: ${stats.participants}`);
    console.log(`   - Admins: ${stats.admins}`);

    // Create test hackathon if it doesn't exist
    const hackathonId = 'cmfrav55o0001fd8wu0hasq8s';
    let hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    });

    if (!hackathon) {
      console.log('📝 Creating test hackathon...');
      hackathon = await prisma.hackathon.create({
        data: {
          id: hackathonId,
          title: 'هاكاثون اختبار الإصلاح النهائي',
          description: 'هاكاثون لاختبار جميع الإصلاحات',
          requirements: ['متطلب 1', 'متطلب 2'],
          categories: ['تقنية', 'إبداع'],
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          maxParticipants: 100,
          status: 'active',
          prizes: {
            first: '10000 ريال',
            second: '5000 ريال',
            third: '2500 ريال'
          },
          settings: {
            maxTeamSize: 5,
            allowIndividualParticipation: true
          },
          createdBy: 'admin_user_001'
        }
      });
      console.log('✅ Test hackathon created:', hackathon.title);
    } else {
      console.log('✅ Test hackathon already exists:', hackathon.title);
    }

    // Test the problematic query
    console.log('🔍 Testing problematic hackathon query...');
    try {
      const hackathonWithDetails = await prisma.hackathon.findUnique({
        where: { id: hackathonId },
        include: {
          participants: {
            include: {
              user: true
            }
          },
          teams: true,
          judges: true
        }
      });

      if (hackathonWithDetails) {
        console.log('✅ Hackathon query with relations works!');
        console.log(`   - Participants: ${hackathonWithDetails.participants.length}`);
        console.log(`   - Teams: ${hackathonWithDetails.teams.length}`);
        console.log(`   - Judges: ${hackathonWithDetails.judges.length}`);
      }
    } catch (error) {
      console.log('❌ Hackathon query failed:', error.message);
      
      // Try simpler query
      console.log('🔍 Trying simpler hackathon query...');
      const simpleHackathon = await prisma.hackathon.findUnique({
        where: { id: hackathonId }
      });
      
      if (simpleHackathon) {
        console.log('✅ Simple hackathon query works');
      } else {
        console.log('❌ Even simple hackathon query failed');
      }
    }

    // Test teams query
    console.log('🔍 Testing teams query...');
    try {
      const teams = await prisma.team.findMany({
        where: { hackathonId: hackathonId },
        orderBy: { teamNumber: 'asc' }
      });
      console.log(`✅ Teams query works - Found ${teams.length} teams`);
    } catch (error) {
      console.log('❌ Teams query failed:', error.message);
    }

    console.log('\n🎉 Database test completed!');

  } catch (error) {
    console.error('❌ Error testing database:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Run the test
testCurrentDatabase();
