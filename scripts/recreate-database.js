// Recreate database with all required columns

// Set environment variable for SQLite
process.env.DATABASE_URL = "file:./dev_new.db";

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

async function recreateDatabase() {
  let prisma;

  try {
    console.log("🔄 Creating new database with all required columns...");

    // Delete existing new database if exists
    if (fs.existsSync("dev_new.db")) {
      try {
        fs.unlinkSync("dev_new.db");
        console.log("🗑️ Deleted existing new database");
      } catch (error) {
        console.log("⚠️ Could not delete existing database, continuing...");
      }
    }

    prisma = new PrismaClient();
    await prisma.$connect();
    console.log("✅ Connected to new database");

    // Create users table with all columns
    await prisma.$executeRaw`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        city TEXT,
        nationality TEXT DEFAULT 'سعودي',
        preferredRole TEXT,
        skills TEXT,
        experience TEXT,
        role TEXT DEFAULT 'participant',
        isActive BOOLEAN DEFAULT TRUE,
        emailVerified BOOLEAN DEFAULT FALSE,
        profilePicture TEXT,
        bio TEXT,
        github TEXT,
        linkedin TEXT,
        portfolio TEXT,
        university TEXT,
        major TEXT,
        graduationYear TEXT,
        workExperience TEXT,
        lastLogin DATETIME,
        loginCount INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Users table created");

    // Create admins table
    await prisma.$executeRaw`
      CREATE TABLE admins (
        id TEXT PRIMARY KEY,
        userId TEXT UNIQUE NOT NULL,
        permissions TEXT NOT NULL,
        hackathonId TEXT,
        role TEXT,
        isActive BOOLEAN DEFAULT TRUE,
        lastLogin DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    console.log("✅ Admins table created");

    // Create hackathons table
    await prisma.$executeRaw`
      CREATE TABLE hackathons (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        requirements TEXT,
        categories TEXT,
        startDate DATETIME NOT NULL,
        endDate DATETIME NOT NULL,
        registrationDeadline DATETIME NOT NULL,
        maxParticipants INTEGER,
        status TEXT DEFAULT 'draft',
        prizes TEXT,
        settings TEXT,
        certificateTemplate TEXT,
        isPinned BOOLEAN DEFAULT FALSE,
        evaluationOpen BOOLEAN DEFAULT FALSE,
        judgeSettings TEXT,
        emailTemplates TEXT,
        customFields TEXT,
        location TEXT,
        venue TEXT,
        contactEmail TEXT,
        contactPhone TEXT,
        website TEXT,
        socialMedia TEXT,
        sponsors TEXT,
        partners TEXT,
        mentors TEXT,
        schedule TEXT,
        rules TEXT,
        resources TEXT,
        faq TEXT,
        registrationCount INTEGER DEFAULT 0,
        maxTeams INTEGER DEFAULT 0,
        currentPhase TEXT,
        isPublished BOOLEAN DEFAULT FALSE,
        featuredImage TEXT,
        bannerImage TEXT,
        logoImage TEXT,
        createdBy TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Hackathons table created");

    // Create participants table
    await prisma.$executeRaw`
      CREATE TABLE participants (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        hackathonId TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        teamType TEXT DEFAULT 'individual',
        additionalInfo TEXT,
        teamName TEXT,
        teamRole TEXT,
        skills TEXT,
        experience TEXT,
        motivation TEXT,
        availability TEXT,
        previousParticipation TEXT,
        emergencyContact TEXT,
        dietaryRestrictions TEXT,
        tshirtSize TEXT,
        github TEXT,
        linkedin TEXT,
        portfolio TEXT,
        university TEXT,
        major TEXT,
        graduationYear TEXT,
        workExperience TEXT,
        preferredRole TEXT,
        teamPreference TEXT,
        additionalNotes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (hackathonId) REFERENCES hackathons(id) ON DELETE CASCADE
      )
    `;
    console.log("✅ Participants table created");

    // Create teams table
    await prisma.$executeRaw`
      CREATE TABLE teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        hackathonId TEXT NOT NULL,
        teamNumber INTEGER,
        leaderId TEXT NOT NULL,
        members TEXT,
        ideaFile TEXT,
        ideaTitle TEXT,
        ideaDescription TEXT,
        projectName TEXT,
        projectDescription TEXT,
        projectUrl TEXT,
        status TEXT,
        submissionUrl TEXT,
        presentationUrl TEXT,
        demoUrl TEXT,
        githubUrl TEXT,
        finalScore REAL,
        rank INTEGER,
        isQualified BOOLEAN DEFAULT FALSE,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hackathonId) REFERENCES hackathons(id) ON DELETE CASCADE,
        FOREIGN KEY (leaderId) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    console.log("✅ Teams table created");

    // Create other tables
    await prisma.$executeRaw`
      CREATE TABLE judges (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        hackathonId TEXT NOT NULL,
        expertise TEXT,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (hackathonId) REFERENCES hackathons(id) ON DELETE CASCADE
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE scores (
        id TEXT PRIMARY KEY,
        judgeId TEXT NOT NULL,
        participantId TEXT,
        teamId TEXT,
        hackathonId TEXT NOT NULL,
        criteriaScores TEXT NOT NULL,
        totalScore REAL NOT NULL,
        feedback TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (judgeId) REFERENCES judges(id) ON DELETE CASCADE,
        FOREIGN KEY (participantId) REFERENCES participants(id) ON DELETE CASCADE,
        FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (hackathonId) REFERENCES hackathons(id) ON DELETE CASCADE
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE evaluation_criteria (
        id TEXT PRIMARY KEY,
        hackathonId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        weight REAL NOT NULL,
        maxScore INTEGER DEFAULT 10,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hackathonId) REFERENCES hackathons(id) ON DELETE CASCADE
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE email_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        variables TEXT,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE global_settings (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE hackathon_forms (
        id TEXT PRIMARY KEY,
        hackathonId TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        isActive BOOLEAN DEFAULT TRUE,
        fields TEXT NOT NULL,
        settings TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hackathonId) REFERENCES hackathons(id) ON DELETE CASCADE
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE hackathon_landing_pages (
        id TEXT PRIMARY KEY,
        hackathonId TEXT UNIQUE NOT NULL,
        isEnabled BOOLEAN DEFAULT FALSE,
        customDomain TEXT,
        htmlContent TEXT NOT NULL DEFAULT '',
        cssContent TEXT NOT NULL DEFAULT '',
        jsContent TEXT NOT NULL DEFAULT '',
        seoTitle TEXT,
        seoDescription TEXT,
        template TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hackathonId) REFERENCES hackathons(id) ON DELETE CASCADE
      )
    `;

    console.log("✅ All tables created");

    // Create default admin user
    console.log("👤 Creating default admin user...");

    const crypto = require("crypto");
    const adminPassword = crypto
      .createHash("sha256")
      .update("admin123" + "salt")
      .digest("hex");

    await prisma.$executeRaw`
      INSERT INTO users (
        id, name, email, password, role, phone, city, nationality, isActive, emailVerified
      ) VALUES (
        'admin_user_001',
        'مدير النظام',
        'admin@hackathon.gov.sa',
        ${adminPassword},
        'admin',
        '+966501234567',
        'الرياض',
        'سعودي',
        TRUE,
        TRUE
      )
    `;

    await prisma.$executeRaw`
      INSERT INTO admins (
        id, userId, permissions, isActive
      ) VALUES (
        'admin_001',
        'admin_user_001',
        '{"canManageHackathons":true,"canManageUsers":true,"canManageJudges":true,"canViewReports":true,"canManageSettings":true}',
        TRUE
      )
    `;

    console.log("✅ Default admin user created");

    // Test all tables
    console.log("🧪 Testing all tables...");

    const stats = {
      hackathons: await prisma.hackathon.count(),
      users: await prisma.user.count(),
      teams: await prisma.team.count(),
      participants: await prisma.participant.count(),
      admins: await prisma.admin.count(),
      judges: await prisma.judge.count(),
      landingPages: await prisma.hackathonLandingPage.count(),
    };

    console.log("📊 Database verification:");
    console.log(`   - Hackathons: ${stats.hackathons}`);
    console.log(`   - Users: ${stats.users}`);
    console.log(`   - Teams: ${stats.teams}`);
    console.log(`   - Participants: ${stats.participants}`);
    console.log(`   - Admins: ${stats.admins}`);
    console.log(`   - Judges: ${stats.judges}`);
    console.log(`   - Landing Pages: ${stats.landingPages}`);

    console.log("\n🎉 Database recreated successfully!");
    console.log("\n🔑 Admin Login:");
    console.log("   Email: admin@hackathon.gov.sa");
    console.log("   Password: admin123");
    console.log("\n🚀 All APIs should now work without any errors!");
  } catch (error) {
    console.error("❌ Error recreating database:", error);
    console.error("Stack trace:", error.stack);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Run the recreation
recreateDatabase();
