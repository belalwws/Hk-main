// Setup local SQLite database for development

const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Simple hash function for development (not for production)
function simpleHash(password) {
  return crypto
    .createHash("sha256")
    .update(password + "salt")
    .digest("hex");
}

async function setupLocalDB() {
  let prisma;

  try {
    console.log("🚀 Setting up local development database...");

    // Initialize Prisma with SQLite
    prisma = new PrismaClient();

    console.log("📡 Connecting to database...");
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Create admin user
    console.log("👤 Creating admin user...");

    const hashedPassword = simpleHash("admin123");

    const adminUser = await prisma.user.upsert({
      where: { email: "admin@hackathon.gov.sa" },
      update: {},
      create: {
        id: "admin_user_local",
        name: "مدير النظام",
        email: "admin@hackathon.gov.sa",
        password: hashedPassword,
        role: "admin",
        phone: "+966501234567",
        city: "الرياض",
        nationality: "سعودي",
      },
    });

    const adminRecord = await prisma.admin.upsert({
      where: { userId: adminUser.id },
      update: {},
      create: {
        id: "admin_record_local",
        userId: adminUser.id,
        permissions: {
          canManageHackathons: true,
          canManageUsers: true,
          canManageJudges: true,
          canViewReports: true,
          canManageSettings: true,
        },
      },
    });

    console.log("✅ Admin user created:", adminUser.email);

    // Create sample hackathon
    console.log("🏆 Creating sample hackathon...");

    const sampleHackathon = await prisma.hackathon.upsert({
      where: { id: "sample_hackathon_1" },
      update: {},
      create: {
        id: "sample_hackathon_1",
        title: "هاكاثون الابتكار التقني",
        description: "هاكاثون تجريبي لاختبار النظام والتطوير المحلي",
        requirements: ["خبرة في البرمجة", "العمل الجماعي", "الإبداع والابتكار"],
        categories: [
          "الذكاء الاصطناعي",
          "تطبيقات الجوال",
          "الأمن السيبراني",
          "إنترنت الأشياء",
        ],
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
        registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        maxParticipants: 100,
        status: "open",
        prizes: {
          first: "50,000 ريال سعودي",
          second: "30,000 ريال سعودي",
          third: "20,000 ريال سعودي",
        },
        createdBy: adminUser.id,
        settings: {
          maxTeamSize: 5,
          allowIndividualParticipation: true,
          autoTeaming: false,
          evaluationCriteria: [
            { name: "الابتكار", weight: 0.25 },
            { name: "الأثر التقني", weight: 0.25 },
            { name: "قابلية التنفيذ", weight: 0.25 },
            { name: "العرض التقديمي", weight: 0.25 },
          ],
        },
      },
    });

    console.log("✅ Sample hackathon created:", sampleHackathon.title);

    // Create sample users
    console.log("👥 Creating sample users...");

    const sampleUsers = [
      {
        id: "user_1",
        name: "أحمد محمد",
        email: "ahmed@example.com",
        password: simpleHash("password123"),
        role: "participant",
        phone: "+966501111111",
        city: "الرياض",
        nationality: "سعودي",
      },
      {
        id: "user_2",
        name: "فاطمة علي",
        email: "fatima@example.com",
        password: simpleHash("password123"),
        role: "participant",
        phone: "+966502222222",
        city: "جدة",
        nationality: "سعودي",
      },
      {
        id: "judge_1",
        name: "د. محمد الأحمد",
        email: "judge@example.com",
        password: simpleHash("password123"),
        role: "judge",
        phone: "+966503333333",
        city: "الدمام",
        nationality: "سعودي",
      },
    ];

    for (const userData of sampleUsers) {
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData,
      });
    }

    console.log("✅ Sample users created");

    // Create sample participants
    console.log("🎯 Creating sample participants...");

    await prisma.participant.upsert({
      where: { id: "participant_1" },
      update: {},
      create: {
        id: "participant_1",
        userId: "user_1",
        hackathonId: sampleHackathon.id,
        status: "approved",
        teamType: "individual",
        additionalInfo: {
          experience: "متوسط",
          skills: "JavaScript, React, Node.js",
          motivation: "أريد تطوير مهاراتي في البرمجة",
        },
      },
    });

    await prisma.participant.upsert({
      where: { id: "participant_2" },
      update: {},
      create: {
        id: "participant_2",
        userId: "user_2",
        hackathonId: sampleHackathon.id,
        status: "pending",
        teamType: "individual",
        additionalInfo: {
          experience: "مبتدئ",
          skills: "Python, HTML, CSS",
          motivation: "أحب التحديات التقنية",
        },
      },
    });

    console.log("✅ Sample participants created");

    // Create sample judge
    console.log("⚖️ Creating sample judge...");

    await prisma.judge.upsert({
      where: { id: "judge_record_1" },
      update: {},
      create: {
        id: "judge_record_1",
        userId: "judge_1",
        hackathonId: sampleHackathon.id,
        expertise: ["الذكاء الاصطناعي", "تطوير البرمجيات"],
        isActive: true,
      },
    });

    console.log("✅ Sample judge created");

    // Create landing pages table
    console.log("🎨 Creating landing pages table...");

    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS hackathon_landing_pages (
          id TEXT PRIMARY KEY,
          hackathon_id TEXT UNIQUE NOT NULL,
          is_enabled BOOLEAN DEFAULT FALSE,
          custom_domain TEXT,
          html_content TEXT NOT NULL DEFAULT '',
          css_content TEXT NOT NULL DEFAULT '',
          js_content TEXT NOT NULL DEFAULT '',
          seo_title TEXT,
          seo_description TEXT,
          template TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE
        )
      `;
      console.log("✅ Landing pages table created");
    } catch (error) {
      console.log("ℹ️ Landing pages table already exists");
    }

    // Display summary
    console.log("\n🎉 Local development database setup completed!");
    console.log("\n📊 Database Summary:");

    const stats = {
      hackathons: await prisma.hackathon.count(),
      users: await prisma.user.count(),
      participants: await prisma.participant.count(),
      judges: await prisma.judge.count(),
      admins: await prisma.admin.count(),
    };

    console.log(`   - Hackathons: ${stats.hackathons}`);
    console.log(`   - Users: ${stats.users}`);
    console.log(`   - Participants: ${stats.participants}`);
    console.log(`   - Judges: ${stats.judges}`);
    console.log(`   - Admins: ${stats.admins}`);

    console.log("\n🔑 Login Credentials:");
    console.log("   Admin: admin@hackathon.gov.sa / admin123");
    console.log("   User: ahmed@example.com / password123");
    console.log("   Judge: judge@example.com / password123");

    console.log("\n🚀 You can now run: npm run dev");
  } catch (error) {
    console.error("❌ Error setting up local database:", error);
    console.error("Stack trace:", error.stack);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Run setup
setupLocalDB();
