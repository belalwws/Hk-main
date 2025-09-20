// Create all required database tables

// Set environment variable for SQLite
process.env.DATABASE_URL = "file:./dev.db";

const { PrismaClient } = require("@prisma/client");

async function createTables() {
  let prisma;

  try {
    console.log("🚀 Creating database tables...");
    console.log("📊 Using SQLite database: ./dev.db");

    prisma = new PrismaClient();
    await prisma.$connect();
    console.log("✅ Connected to database");

    // Create all tables using raw SQL
    console.log("📝 Creating tables...");

    // 1. Users table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS users (
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
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Users table created");

    // 2. Admins table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        userId TEXT UNIQUE NOT NULL,
        permissions TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    console.log("✅ Admins table created");

    // 3. Hackathons table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS hackathons (
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
        createdBy TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Hackathons table created");

    // 4. Participants table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS participants (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        hackathonId TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        teamType TEXT DEFAULT 'individual',
        additionalInfo TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (hackathonId) REFERENCES hackathons(id) ON DELETE CASCADE
      )
    `;
    console.log("✅ Participants table created");

    // 5. Teams table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS teams (
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
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hackathonId) REFERENCES hackathons(id) ON DELETE CASCADE,
        FOREIGN KEY (leaderId) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    console.log("✅ Teams table created");

    // 6. Judges table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS judges (
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
    console.log("✅ Judges table created");

    // 7. Scores table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS scores (
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
    console.log("✅ Scores table created");

    // 8. Evaluation Criteria table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS evaluation_criteria (
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
    console.log("✅ Evaluation Criteria table created");

    // 9. Email Templates table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS email_templates (
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
    console.log("✅ Email Templates table created");

    // 10. Global Settings table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS global_settings (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Global Settings table created");

    // 11. Hackathon Forms table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS hackathon_forms (
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
    console.log("✅ Hackathon Forms table created");

    // 12. Landing Pages table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS hackathon_landing_pages (
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
    console.log("✅ Landing Pages table created");

    // Create default admin user
    console.log("👤 Creating default admin user...");

    const crypto = require("crypto");
    const adminPassword = crypto
      .createHash("sha256")
      .update("admin123" + "salt")
      .digest("hex");

    await prisma.$executeRaw`
      INSERT OR IGNORE INTO users (
        id, name, email, password, role, phone, city, nationality
      ) VALUES (
        'admin_user_001',
        'مدير النظام',
        'admin@hackathon.gov.sa',
        ${adminPassword},
        'admin',
        '+966501234567',
        'الرياض',
        'سعودي'
      )
    `;

    await prisma.$executeRaw`
      INSERT OR IGNORE INTO admins (
        id, userId, permissions
      ) VALUES (
        'admin_001',
        'admin_user_001',
        '{"canManageHackathons":true,"canManageUsers":true,"canManageJudges":true,"canViewReports":true,"canManageSettings":true}'
      )
    `;

    console.log("✅ Default admin user created");

    // Verify tables exist
    console.log("🔍 Verifying tables...");

    const hackathonCount = await prisma.hackathon.count();
    const userCount = await prisma.user.count();
    const adminCount = await prisma.admin.count();

    console.log("📊 Database verification:");
    console.log(`   - Hackathons: ${hackathonCount}`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Admins: ${adminCount}`);

    console.log("\n🎉 Database setup completed successfully!");
    console.log("\n🔑 Admin Login:");
    console.log("   Email: admin@hackathon.gov.sa");
    console.log("   Password: admin123");
    console.log("\n🚀 You can now use the application!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    console.error("Stack trace:", error.stack);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Run the setup
createTables();
