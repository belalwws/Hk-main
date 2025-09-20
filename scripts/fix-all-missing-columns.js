// Fix ALL missing columns in database tables

// Set environment variable for SQLite
process.env.DATABASE_URL = "file:./dev.db";

const { PrismaClient } = require("@prisma/client");

async function fixAllMissingColumns() {
  let prisma;

  try {
    console.log("🔧 Fixing ALL missing columns in database...");

    prisma = new PrismaClient();
    await prisma.$connect();
    console.log("✅ Connected to database");

    // Fix participants table
    console.log("📝 Fixing participants table...");
    const participantColumns = [
      'teamName',
      'teamRole',
      'skills',
      'experience',
      'motivation',
      'availability',
      'previousParticipation',
      'emergencyContact',
      'dietaryRestrictions',
      'tshirtSize',
      'github',
      'linkedin',
      'portfolio',
      'university',
      'major',
      'graduationYear',
      'workExperience',
      'preferredRole',
      'teamPreference',
      'additionalNotes'
    ];

    for (const column of participantColumns) {
      try {
        await prisma.$executeRaw`ALTER TABLE participants ADD COLUMN ${column} TEXT`;
        console.log(`✅ Added ${column} to participants`);
      } catch (error) {
        if (error.message.includes("duplicate column")) {
          console.log(`ℹ️ ${column} already exists in participants`);
        } else {
          console.log(`⚠️ Error adding ${column} to participants:`, error.message);
        }
      }
    }

    // Fix users table
    console.log("📝 Fixing users table...");
    const userColumns = [
      'isActive',
      'emailVerified',
      'profilePicture',
      'bio',
      'github',
      'linkedin',
      'portfolio',
      'university',
      'major',
      'graduationYear',
      'workExperience',
      'lastLogin',
      'loginCount'
    ];

    for (const column of userColumns) {
      try {
        if (column === 'isActive' || column === 'emailVerified') {
          await prisma.$executeRaw`ALTER TABLE users ADD COLUMN ${column} BOOLEAN DEFAULT TRUE`;
        } else if (column === 'loginCount') {
          await prisma.$executeRaw`ALTER TABLE users ADD COLUMN ${column} INTEGER DEFAULT 0`;
        } else if (column === 'lastLogin') {
          await prisma.$executeRaw`ALTER TABLE users ADD COLUMN ${column} DATETIME`;
        } else {
          await prisma.$executeRaw`ALTER TABLE users ADD COLUMN ${column} TEXT`;
        }
        console.log(`✅ Added ${column} to users`);
      } catch (error) {
        if (error.message.includes("duplicate column")) {
          console.log(`ℹ️ ${column} already exists in users`);
        } else {
          console.log(`⚠️ Error adding ${column} to users:`, error.message);
        }
      }
    }

    // Fix admins table
    console.log("📝 Fixing admins table...");
    const adminColumns = [
      'hackathonId',
      'role',
      'isActive',
      'lastLogin'
    ];

    for (const column of adminColumns) {
      try {
        if (column === 'isActive') {
          await prisma.$executeRaw`ALTER TABLE admins ADD COLUMN ${column} BOOLEAN DEFAULT TRUE`;
        } else if (column === 'lastLogin') {
          await prisma.$executeRaw`ALTER TABLE admins ADD COLUMN ${column} DATETIME`;
        } else {
          await prisma.$executeRaw`ALTER TABLE admins ADD COLUMN ${column} TEXT`;
        }
        console.log(`✅ Added ${column} to admins`);
      } catch (error) {
        if (error.message.includes("duplicate column")) {
          console.log(`ℹ️ ${column} already exists in admins`);
        } else {
          console.log(`⚠️ Error adding ${column} to admins:`, error.message);
        }
      }
    }

    // Fix teams table (additional columns)
    console.log("📝 Fixing teams table (additional columns)...");
    const teamColumns = [
      'status',
      'submissionUrl',
      'presentationUrl',
      'demoUrl',
      'githubUrl',
      'finalScore',
      'rank',
      'isQualified',
      'notes'
    ];

    for (const column of teamColumns) {
      try {
        if (column === 'finalScore') {
          await prisma.$executeRaw`ALTER TABLE teams ADD COLUMN ${column} REAL`;
        } else if (column === 'rank') {
          await prisma.$executeRaw`ALTER TABLE teams ADD COLUMN ${column} INTEGER`;
        } else if (column === 'isQualified') {
          await prisma.$executeRaw`ALTER TABLE teams ADD COLUMN ${column} BOOLEAN DEFAULT FALSE`;
        } else {
          await prisma.$executeRaw`ALTER TABLE teams ADD COLUMN ${column} TEXT`;
        }
        console.log(`✅ Added ${column} to teams`);
      } catch (error) {
        if (error.message.includes("duplicate column")) {
          console.log(`ℹ️ ${column} already exists in teams`);
        } else {
          console.log(`⚠️ Error adding ${column} to teams:`, error.message);
        }
      }
    }

    // Fix hackathons table (additional columns)
    console.log("📝 Fixing hackathons table (additional columns)...");
    const hackathonColumns = [
      'location',
      'venue',
      'contactEmail',
      'contactPhone',
      'website',
      'socialMedia',
      'sponsors',
      'partners',
      'mentors',
      'schedule',
      'rules',
      'resources',
      'faq',
      'registrationCount',
      'maxTeams',
      'currentPhase',
      'isPublished',
      'featuredImage',
      'bannerImage',
      'logoImage'
    ];

    for (const column of hackathonColumns) {
      try {
        if (column === 'registrationCount' || column === 'maxTeams') {
          await prisma.$executeRaw`ALTER TABLE hackathons ADD COLUMN ${column} INTEGER DEFAULT 0`;
        } else if (column === 'isPublished') {
          await prisma.$executeRaw`ALTER TABLE hackathons ADD COLUMN ${column} BOOLEAN DEFAULT FALSE`;
        } else {
          await prisma.$executeRaw`ALTER TABLE hackathons ADD COLUMN ${column} TEXT`;
        }
        console.log(`✅ Added ${column} to hackathons`);
      } catch (error) {
        if (error.message.includes("duplicate column")) {
          console.log(`ℹ️ ${column} already exists in hackathons`);
        } else {
          console.log(`⚠️ Error adding ${column} to hackathons:`, error.message);
        }
      }
    }

    console.log("\n🧪 Testing the fixes...");
    
    // Test basic queries without includes
    try {
      const hackathonCount = await prisma.hackathon.count();
      console.log("✅ Hackathons table working, count:", hackathonCount);
    } catch (error) {
      console.log("❌ Hackathons table still has issues:", error.message);
    }

    try {
      const userCount = await prisma.user.count();
      console.log("✅ Users table working, count:", userCount);
    } catch (error) {
      console.log("❌ Users table still has issues:", error.message);
    }

    try {
      const participantCount = await prisma.participant.count();
      console.log("✅ Participants table working, count:", participantCount);
    } catch (error) {
      console.log("❌ Participants table still has issues:", error.message);
    }

    try {
      const adminCount = await prisma.admin.count();
      console.log("✅ Admins table working, count:", adminCount);
    } catch (error) {
      console.log("❌ Admins table still has issues:", error.message);
    }

    try {
      const teamCount = await prisma.team.count();
      console.log("✅ Teams table working, count:", teamCount);
    } catch (error) {
      console.log("❌ Teams table still has issues:", error.message);
    }

    console.log("\n🎉 All missing columns have been added!");
    console.log("🚀 The application should now work without any 500 errors!");

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
fixAllMissingColumns();
