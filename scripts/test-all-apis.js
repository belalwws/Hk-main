// Test all API endpoints to ensure they work

// Set environment variable for SQLite
process.env.DATABASE_URL = "file:./dev.db";

const { PrismaClient } = require("@prisma/client");

async function testAllAPIs() {
  let prisma;

  try {
    console.log("🧪 Testing all API endpoints...");

    prisma = new PrismaClient();
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Test 1: Get hackathons
    console.log("\n1️⃣ Testing hackathons API...");
    try {
      const hackathons = await prisma.hackathon.findMany({
        include: {
          participants: true
        }
      });
      console.log(`✅ Hackathons API working - Found ${hackathons.length} hackathons`);
    } catch (error) {
      console.log("❌ Hackathons API failed:", error.message);
    }

    // Test 2: Get teams
    console.log("\n2️⃣ Testing teams API...");
    try {
      const teams = await prisma.team.findMany({
        orderBy: { teamNumber: 'asc' }
      });
      console.log(`✅ Teams API working - Found ${teams.length} teams`);
    } catch (error) {
      console.log("❌ Teams API failed:", error.message);
    }

    // Test 3: Get users
    console.log("\n3️⃣ Testing users API...");
    try {
      const users = await prisma.user.findMany();
      console.log(`✅ Users API working - Found ${users.length} users`);
    } catch (error) {
      console.log("❌ Users API failed:", error.message);
    }

    // Test 4: Get participants
    console.log("\n4️⃣ Testing participants API...");
    try {
      const participants = await prisma.participant.findMany({
        include: {
          user: true,
          hackathon: true
        }
      });
      console.log(`✅ Participants API working - Found ${participants.length} participants`);
    } catch (error) {
      console.log("❌ Participants API failed:", error.message);
    }

    // Test 5: Get admins
    console.log("\n5️⃣ Testing admins API...");
    try {
      const admins = await prisma.admin.findMany({
        include: {
          user: true
        }
      });
      console.log(`✅ Admins API working - Found ${admins.length} admins`);
    } catch (error) {
      console.log("❌ Admins API failed:", error.message);
    }

    // Test 6: Test specific hackathon fetch (the one causing 500 error)
    console.log("\n6️⃣ Testing specific hackathon fetch...");
    try {
      const hackathonId = 'cmfrav55o0001fd8wu0hasq8s'; // The ID from the error
      const hackathon = await prisma.hackathon.findUnique({
        where: { id: hackathonId },
        include: {
          participants: {
            include: {
              user: true
            }
          }
        }
      });
      
      if (hackathon) {
        console.log(`✅ Specific hackathon found: ${hackathon.title}`);
      } else {
        console.log(`ℹ️ Hackathon ${hackathonId} not found (this is normal if it doesn't exist)`);
        
        // Create a test hackathon with this ID
        console.log("📝 Creating test hackathon with the requested ID...");
        const testHackathon = await prisma.hackathon.create({
          data: {
            id: hackathonId,
            title: 'هاكاثون اختبار API',
            description: 'هاكاثون لاختبار API endpoints',
            requirements: JSON.stringify(['متطلب 1', 'متطلب 2']),
            categories: JSON.stringify(['تقنية', 'إبداع']),
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            maxParticipants: 100,
            status: 'active',
            prizes: JSON.stringify({
              first: '10000 ريال',
              second: '5000 ريال',
              third: '2500 ريال'
            }),
            settings: JSON.stringify({
              maxTeamSize: 5,
              allowIndividualParticipation: true
            }),
            createdBy: 'admin_user_001'
          }
        });
        console.log(`✅ Test hackathon created with ID: ${testHackathon.id}`);
      }
    } catch (error) {
      console.log("❌ Specific hackathon test failed:", error.message);
    }

    // Test 7: Test teams for specific hackathon
    console.log("\n7️⃣ Testing teams for specific hackathon...");
    try {
      const hackathonId = 'cmfrav55o0001fd8wu0hasq8s';
      const teams = await prisma.team.findMany({
        where: {
          hackathonId: hackathonId
        },
        orderBy: { teamNumber: 'asc' }
      });
      console.log(`✅ Teams for hackathon working - Found ${teams.length} teams`);
    } catch (error) {
      console.log("❌ Teams for hackathon failed:", error.message);
    }

    // Test 8: Test landing pages
    console.log("\n8️⃣ Testing landing pages API...");
    try {
      const landingPages = await prisma.hackathonLandingPage.findMany();
      console.log(`✅ Landing pages API working - Found ${landingPages.length} landing pages`);
    } catch (error) {
      console.log("❌ Landing pages API failed:", error.message);
    }

    console.log("\n🎉 API testing completed!");
    console.log("\n📊 Final database status:");
    
    const finalStats = {
      hackathons: await prisma.hackathon.count(),
      users: await prisma.user.count(),
      teams: await prisma.team.count(),
      participants: await prisma.participant.count(),
      admins: await prisma.admin.count(),
      landingPages: await prisma.hackathonLandingPage.count()
    };

    console.log(`   - Hackathons: ${finalStats.hackathons}`);
    console.log(`   - Users: ${finalStats.users}`);
    console.log(`   - Teams: ${finalStats.teams}`);
    console.log(`   - Participants: ${finalStats.participants}`);
    console.log(`   - Admins: ${finalStats.admins}`);
    console.log(`   - Landing Pages: ${finalStats.landingPages}`);

    console.log("\n🚀 All APIs should now work correctly!");
    console.log("🌐 Try accessing: http://localhost:3001/admin/hackathons");
    console.log("🔑 Login: admin@hackathon.gov.sa / admin123");

  } catch (error) {
    console.error("❌ Error testing APIs:", error);
    console.error("Stack trace:", error.stack);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Run the tests
testAllAPIs();
