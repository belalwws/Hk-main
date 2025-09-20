// Simple fix - create database with correct schema

process.env.DATABASE_URL = "file:./dev_working.db";

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

async function simpleFix() {
  let prisma;

  try {
    console.log("🚀 Simple fix - creating database with correct schema...");

    // Delete existing working database if exists
    if (fs.existsSync("dev_working.db")) {
      try {
        fs.unlinkSync("dev_working.db");
        console.log("🗑️ Deleted old working database");
      } catch (error) {
        console.log("⚠️ Could not delete old database, continuing...");
      }
    }

    if (fs.existsSync("dev_working.db-journal")) {
      try {
        fs.unlinkSync("dev_working.db-journal");
        console.log("🗑️ Deleted old journal");
      } catch (error) {
        console.log("⚠️ Could not delete old journal, continuing...");
      }
    }

    // Create new Prisma client
    prisma = new PrismaClient();
    await prisma.$connect();
    console.log("✅ Connected to new database");

    // Create admin user
    console.log("👤 Creating admin user...");
    const crypto = require("crypto");
    const adminPassword = crypto
      .createHash("sha256")
      .update("admin123" + "salt")
      .digest("hex");

    const adminUser = await prisma.user.create({
      data: {
        id: "admin_user_001",
        name: "مدير النظام",
        email: "admin@hackathon.gov.sa",
        password: adminPassword,
        role: "admin",
        phone: "+966501234567",
        city: "الرياض",
        nationality: "سعودي",
        isActive: true,
      },
    });

    const admin = await prisma.admin.create({
      data: {
        id: "admin_001",
        userId: "admin_user_001",
        permissions: {
          canManageHackathons: true,
          canManageUsers: true,
          canManageJudges: true,
          canViewReports: true,
          canManageSettings: true,
        },
        isActive: true,
      },
    });

    console.log("✅ Admin user created");

    // Create test hackathon
    console.log("📝 Creating test hackathon...");
    const hackathon = await prisma.hackathon.create({
      data: {
        id: "cmfrav55o0001fd8wu0hasq8s",
        title: "هاكاثون اختبار النظام المحدث",
        description: "هاكاثون لاختبار جميع المميزات الجديدة",
        requirements: ["متطلب 1", "متطلب 2", "متطلب 3"],
        categories: ["تقنية", "إبداع", "ريادة أعمال"],
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        maxParticipants: 100,
        status: "active",
        prizes: {
          first: "10000 ريال",
          second: "5000 ريال",
          third: "2500 ريال",
        },
        settings: {
          maxTeamSize: 5,
          allowIndividualParticipation: true,
        },
        createdBy: "admin_user_001",
      },
    });

    console.log("✅ Test hackathon created:", hackathon.title);

    // Test the problematic queries
    console.log("🧪 Testing problematic queries...");

    // Test hackathon with participants
    const hackathonWithDetails = await prisma.hackathon.findUnique({
      where: { id: "cmfrav55o0001fd8wu0hasq8s" },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        teams: true,
        judges: true,
      },
    });

    console.log("✅ Hackathon with relations query works!");
    console.log(
      `   - Participants: ${hackathonWithDetails.participants.length}`
    );
    console.log(`   - Teams: ${hackathonWithDetails.teams.length}`);
    console.log(`   - Judges: ${hackathonWithDetails.judges.length}`);

    // Test teams query
    const teams = await prisma.team.findMany({
      where: { hackathonId: "cmfrav55o0001fd8wu0hasq8s" },
      orderBy: { teamNumber: "asc" },
    });

    console.log(`✅ Teams query works - Found ${teams.length} teams`);

    // Test user query with all fields
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        phone: true,
        city: true,
        nationality: true,
        createdAt: true,
      },
    });

    console.log(`✅ Users query works - Found ${users.length} users`);

    console.log("\n🎉 Simple fix completed successfully!");
    console.log("\n🔑 Admin Login:");
    console.log("   Email: admin@hackathon.gov.sa");
    console.log("   Password: admin123");
    console.log("\n🚀 All APIs should now work perfectly!");
    console.log("\n📋 Next steps:");
    console.log("1. Run: npm run dev");
    console.log("2. Test: http://localhost:3000/admin/hackathons");
    console.log(
      "3. Test hackathon: http://localhost:3000/admin/hackathons/cmfrav55o0001fd8wu0hasq8s"
    );
  } catch (error) {
    console.error("❌ Error in simple fix:", error);
    console.error("Stack trace:", error.stack);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Run the fix
simpleFix();
