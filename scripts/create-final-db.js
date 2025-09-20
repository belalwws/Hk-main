// Create final database with updated schema

// Set environment variable for the final database
process.env.DATABASE_URL = "file:./dev_final.db";

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

async function createFinalDatabase() {
  let prisma;

  try {
    console.log("🚀 Creating final database with updated schema...");

    // Delete existing final database if exists
    if (fs.existsSync("dev_final.db")) {
      try {
        fs.unlinkSync("dev_final.db");
        console.log("🗑️ Deleted existing final database");
      } catch (error) {
        console.log("⚠️ Could not delete existing database, continuing...");
      }
    }

    prisma = new PrismaClient();
    await prisma.$connect();
    console.log("✅ Connected to final database");

    // Generate Prisma client first
    console.log("📝 Generating Prisma client...");
    const { spawn } = require('child_process');
    
    await new Promise((resolve, reject) => {
      const generate = spawn('npx', ['prisma', 'generate'], {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: 'file:./dev_final.db' }
      });
      
      generate.on('close', (code) => {
        if (code === 0) {
          console.log("✅ Prisma client generated");
          resolve();
        } else {
          reject(new Error(`Prisma generate failed with code ${code}`));
        }
      });
    });

    // Push schema to database
    console.log("📝 Pushing schema to database...");
    
    await new Promise((resolve, reject) => {
      const push = spawn('npx', ['prisma', 'db', 'push', '--force-reset'], {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: 'file:./dev_final.db' }
      });
      
      push.on('close', (code) => {
        if (code === 0) {
          console.log("✅ Schema pushed to database");
          resolve();
        } else {
          reject(new Error(`Prisma push failed with code ${code}`));
        }
      });
    });

    // Reconnect with new schema
    await prisma.$disconnect();
    prisma = new PrismaClient();
    await prisma.$connect();

    // Create default admin user
    console.log("👤 Creating default admin user...");
    
    const crypto = require('crypto');
    const adminPassword = crypto.createHash('sha256').update('admin123' + 'salt').digest('hex');
    
    const adminUser = await prisma.user.create({
      data: {
        id: 'admin_user_001',
        name: 'مدير النظام',
        email: 'admin@hackathon.gov.sa',
        password: adminPassword,
        role: 'admin',
        phone: '+966501234567',
        city: 'الرياض',
        nationality: 'سعودي',
        isActive: true,
        emailVerified: true
      }
    });

    const admin = await prisma.admin.create({
      data: {
        id: 'admin_001',
        userId: 'admin_user_001',
        permissions: {
          canManageHackathons: true,
          canManageUsers: true,
          canManageJudges: true,
          canViewReports: true,
          canManageSettings: true
        },
        isActive: true
      }
    });

    console.log("✅ Default admin user created");

    // Create test hackathon with problematic ID
    console.log("📝 Creating test hackathon...");
    
    const testHackathon = await prisma.hackathon.create({
      data: {
        id: 'cmfrav55o0001fd8wu0hasq8s',
        title: 'هاكاثون اختبار النظام المحدث',
        description: 'هاكاثون لاختبار جميع المميزات الجديدة',
        requirements: ['متطلب 1', 'متطلب 2', 'متطلب 3'],
        categories: ['تقنية', 'إبداع', 'ريادة أعمال'],
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
        location: 'الرياض',
        venue: 'مركز الملك عبدالعزيز للمؤتمرات',
        contactEmail: 'info@hackathon.gov.sa',
        contactPhone: '+966112345678',
        isPublished: true,
        createdBy: 'admin_user_001'
      }
    });

    console.log("✅ Test hackathon created");

    // Test all queries that were failing
    console.log("🧪 Testing all problematic queries...");

    // Test hackathon with participants
    const hackathonWithDetails = await prisma.hackathon.findUnique({
      where: { id: 'cmfrav55o0001fd8wu0hasq8s' },
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

    console.log("✅ Hackathon with relations query works");

    // Test teams with teamNumber
    const teams = await prisma.team.findMany({
      where: { hackathonId: 'cmfrav55o0001fd8wu0hasq8s' },
      orderBy: { teamNumber: 'asc' }
    });

    console.log("✅ Teams with teamNumber query works");

    // Test users with all fields
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        phone: true,
        university: true,
        major: true,
        graduationYear: true,
        city: true,
        nationality: true,
        skills: true,
        experience: true,
        preferredRole: true,
        createdAt: true
      }
    });

    console.log("✅ Users with all fields query works");

    // Test participants with teamName
    const participants = await prisma.participant.findMany({
      select: {
        id: true,
        teamName: true,
        teamRole: true,
        status: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    console.log("✅ Participants with teamName query works");

    // Verify final database
    console.log("🔍 Final database verification:");
    
    const stats = {
      hackathons: await prisma.hackathon.count(),
      users: await prisma.user.count(),
      teams: await prisma.team.count(),
      participants: await prisma.participant.count(),
      admins: await prisma.admin.count(),
      judges: await prisma.judge.count(),
      landingPages: await prisma.hackathonLandingPage.count()
    };

    console.log(`   - Hackathons: ${stats.hackathons}`);
    console.log(`   - Users: ${stats.users}`);
    console.log(`   - Teams: ${stats.teams}`);
    console.log(`   - Participants: ${stats.participants}`);
    console.log(`   - Admins: ${stats.admins}`);
    console.log(`   - Judges: ${stats.judges}`);
    console.log(`   - Landing Pages: ${stats.landingPages}`);

    console.log("\n🎉 Final database created successfully!");
    console.log("\n🔑 Admin Login:");
    console.log("   Email: admin@hackathon.gov.sa");
    console.log("   Password: admin123");
    console.log("\n🚀 All APIs should now work perfectly!");
    console.log("\n📋 Next steps:");
    console.log("1. Stop current server (Ctrl+C)");
    console.log("2. Run: copy dev_final.db dev.db");
    console.log("3. Run: npm run dev");
    console.log("4. Test: http://localhost:3000/admin/hackathons");

  } catch (error) {
    console.error("❌ Error creating final database:", error);
    console.error("Stack trace:", error.stack);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Run the creation
createFinalDatabase();
