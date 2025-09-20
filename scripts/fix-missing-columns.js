// Fix missing columns in database tables

// Set environment variable for SQLite
process.env.DATABASE_URL = "file:./dev.db";

const { PrismaClient } = require("@prisma/client");

async function fixMissingColumns() {
  let prisma;

  try {
    console.log("🔧 Fixing missing columns in database...");

    prisma = new PrismaClient();
    await prisma.$connect();
    console.log("✅ Connected to database");

    // Fix teams table - add missing columns
    console.log("📝 Adding missing columns to teams table...");
    
    try {
      await prisma.$executeRaw`ALTER TABLE teams ADD COLUMN teamNumber INTEGER`;
      console.log("✅ Added teamNumber column");
    } catch (error) {
      if (error.message.includes("duplicate column")) {
        console.log("ℹ️ teamNumber column already exists");
      } else {
        console.log("⚠️ Error adding teamNumber:", error.message);
      }
    }

    try {
      await prisma.$executeRaw`ALTER TABLE teams ADD COLUMN ideaFile TEXT`;
      console.log("✅ Added ideaFile column");
    } catch (error) {
      if (error.message.includes("duplicate column")) {
        console.log("ℹ️ ideaFile column already exists");
      } else {
        console.log("⚠️ Error adding ideaFile:", error.message);
      }
    }

    try {
      await prisma.$executeRaw`ALTER TABLE teams ADD COLUMN ideaTitle TEXT`;
      console.log("✅ Added ideaTitle column");
    } catch (error) {
      if (error.message.includes("duplicate column")) {
        console.log("ℹ️ ideaTitle column already exists");
      } else {
        console.log("⚠️ Error adding ideaTitle:", error.message);
      }
    }

    try {
      await prisma.$executeRaw`ALTER TABLE teams ADD COLUMN ideaDescription TEXT`;
      console.log("✅ Added ideaDescription column");
    } catch (error) {
      if (error.message.includes("duplicate column")) {
        console.log("ℹ️ ideaDescription column already exists");
      } else {
        console.log("⚠️ Error adding ideaDescription:", error.message);
      }
    }

    // Fix hackathons table - add missing columns if needed
    console.log("📝 Checking hackathons table...");
    
    try {
      await prisma.$executeRaw`ALTER TABLE hackathons ADD COLUMN judgeSettings TEXT`;
      console.log("✅ Added judgeSettings column");
    } catch (error) {
      if (error.message.includes("duplicate column")) {
        console.log("ℹ️ judgeSettings column already exists");
      } else {
        console.log("⚠️ Error adding judgeSettings:", error.message);
      }
    }

    try {
      await prisma.$executeRaw`ALTER TABLE hackathons ADD COLUMN emailTemplates TEXT`;
      console.log("✅ Added emailTemplates column");
    } catch (error) {
      if (error.message.includes("duplicate column")) {
        console.log("ℹ️ emailTemplates column already exists");
      } else {
        console.log("⚠️ Error adding emailTemplates:", error.message);
      }
    }

    try {
      await prisma.$executeRaw`ALTER TABLE hackathons ADD COLUMN customFields TEXT`;
      console.log("✅ Added customFields column");
    } catch (error) {
      if (error.message.includes("duplicate column")) {
        console.log("ℹ️ customFields column already exists");
      } else {
        console.log("⚠️ Error adding customFields:", error.message);
      }
    }

    // Test the fixes
    console.log("🧪 Testing the fixes...");
    
    try {
      const teamCount = await prisma.team.count();
      console.log("✅ Teams table working, count:", teamCount);
    } catch (error) {
      console.log("❌ Teams table still has issues:", error.message);
    }

    try {
      const hackathonCount = await prisma.hackathon.count();
      console.log("✅ Hackathons table working, count:", hackathonCount);
    } catch (error) {
      console.log("❌ Hackathons table still has issues:", error.message);
    }

    // Create a test hackathon if none exist
    const existingHackathons = await prisma.hackathon.count();
    if (existingHackathons === 0) {
      console.log("📝 Creating test hackathon...");
      
      const testHackathon = await prisma.hackathon.create({
        data: {
          id: 'test_hackathon_' + Date.now(),
          title: 'هاكاثون تجريبي',
          description: 'هاكاثون للاختبار',
          requirements: JSON.stringify(['متطلب 1', 'متطلب 2']),
          categories: JSON.stringify(['فئة 1', 'فئة 2']),
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          maxParticipants: 100,
          status: 'draft',
          prizes: JSON.stringify({
            first: 'الجائزة الأولى',
            second: 'الجائزة الثانية',
            third: 'الجائزة الثالثة'
          }),
          settings: JSON.stringify({
            maxTeamSize: 5,
            allowIndividualParticipation: true
          }),
          createdBy: 'admin_user_001'
        }
      });
      
      console.log("✅ Test hackathon created:", testHackathon.id);
    }

    console.log("\n🎉 Database fixes completed successfully!");
    console.log("\n📊 Current database status:");
    
    const stats = {
      hackathons: await prisma.hackathon.count(),
      users: await prisma.user.count(),
      teams: await prisma.team.count(),
      participants: await prisma.participant.count(),
      admins: await prisma.admin.count()
    };

    console.log(`   - Hackathons: ${stats.hackathons}`);
    console.log(`   - Users: ${stats.users}`);
    console.log(`   - Teams: ${stats.teams}`);
    console.log(`   - Participants: ${stats.participants}`);
    console.log(`   - Admins: ${stats.admins}`);

    console.log("\n🚀 The application should now work without 500 errors!");

  } catch (error) {
    console.error("❌ Error fixing columns:", error);
    console.error("Stack trace:", error.stack);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Run the fix
fixMissingColumns();
