// Final fix - create database with all tables

process.env.DATABASE_URL = 'file:./dev_working.db';

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function finalFix() {
  let prisma;

  try {
    console.log('🚀 Final fix - creating complete database...');

    // Delete existing working database if exists
    if (fs.existsSync('dev_working.db')) {
      try {
        fs.unlinkSync('dev_working.db');
        console.log('🗑️ Deleted old working database');
      } catch (error) {
        console.log('⚠️ Could not delete old database, continuing...');
      }
    }

    // Create new Prisma client
    prisma = new PrismaClient();
    
    // Create all tables using raw SQL
    console.log('📝 Creating all tables...');
    
    // Users table
    await prisma.$executeRaw`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        phone TEXT,
        city TEXT,
        nationality TEXT,
        skills TEXT,
        experience TEXT,
        preferredRole TEXT,
        isActive BOOLEAN NOT NULL DEFAULT true,
        emailVerified BOOLEAN DEFAULT false,
        profilePicture TEXT,
        bio TEXT,
        github TEXT,
        linkedin TEXT,
        portfolio TEXT,
        university TEXT,
        major TEXT,
        graduationYear INTEGER,
        workExperience TEXT,
        lastLogin DATETIME,
        loginCount INTEGER DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Hackathons table
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
        status TEXT NOT NULL DEFAULT 'draft',
        prizes TEXT,
        settings TEXT,
        certificateTemplate TEXT,
        isPinned BOOLEAN NOT NULL DEFAULT false,
        evaluationOpen BOOLEAN NOT NULL DEFAULT false,
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
        registrationCount INTEGER NOT NULL DEFAULT 0,
        maxTeams INTEGER NOT NULL DEFAULT 0,
        currentPhase TEXT,
        isPublished BOOLEAN NOT NULL DEFAULT false,
        featuredImage TEXT,
        bannerImage TEXT,
        logoImage TEXT,
        createdBy TEXT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Participants table
    await prisma.$executeRaw`
      CREATE TABLE participants (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        hackathonId TEXT NOT NULL,
        teamName TEXT,
        projectTitle TEXT,
        projectDescription TEXT,
        githubRepo TEXT,
        teamType TEXT,
        teamRole TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        score REAL,
        feedback TEXT,
        registeredAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        approvedAt DATETIME,
        rejectedAt DATETIME,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        additionalInfo TEXT,
        teamId TEXT,
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
        graduationYear INTEGER,
        workExperience TEXT,
        preferredRole TEXT,
        teamPreference TEXT,
        additionalNotes TEXT
      )
    `;

    // Teams table
    await prisma.$executeRaw`
      CREATE TABLE teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        hackathonId TEXT NOT NULL,
        teamNumber INTEGER,
        leaderId TEXT,
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
        isQualified BOOLEAN NOT NULL DEFAULT false,
        notes TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Admins table
    await prisma.$executeRaw`
      CREATE TABLE admins (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        hackathonId TEXT,
        permissions TEXT,
        role TEXT,
        isActive BOOLEAN NOT NULL DEFAULT true,
        lastLogin DATETIME,
        assignedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Judges table
    await prisma.$executeRaw`
      CREATE TABLE judges (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        hackathonId TEXT NOT NULL,
        expertise TEXT,
        assignedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Scores table
    await prisma.$executeRaw`
      CREATE TABLE scores (
        id TEXT PRIMARY KEY,
        judgeId TEXT NOT NULL,
        teamId TEXT NOT NULL,
        hackathonId TEXT NOT NULL,
        criterionId TEXT NOT NULL,
        score REAL NOT NULL,
        feedback TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Other tables
    await prisma.$executeRaw`
      CREATE TABLE evaluation_criteria (
        id TEXT PRIMARY KEY,
        hackathonId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        weight REAL NOT NULL DEFAULT 1.0,
        maxScore REAL NOT NULL DEFAULT 10.0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE hackathon_forms (
        id TEXT PRIMARY KEY,
        hackathonId TEXT UNIQUE NOT NULL,
        formFields TEXT NOT NULL,
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE hackathon_landing_pages (
        id TEXT PRIMARY KEY,
        hackathonId TEXT UNIQUE NOT NULL,
        isEnabled BOOLEAN NOT NULL DEFAULT false,
        customDomain TEXT,
        htmlContent TEXT NOT NULL,
        cssContent TEXT NOT NULL,
        jsContent TEXT NOT NULL,
        seoTitle TEXT,
        seoDescription TEXT,
        template TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('✅ All tables created successfully');

    // Now create admin user
    console.log('👤 Creating admin user...');
    const crypto = require('crypto');
    const adminPassword = crypto.createHash('sha256').update('admin123' + 'salt').digest('hex');
    
    await prisma.$executeRaw`
      INSERT INTO users (id, name, email, password, role, phone, city, nationality, isActive, emailVerified)
      VALUES ('admin_user_001', 'مدير النظام', 'admin@hackathon.gov.sa', ${adminPassword}, 'admin', '+966501234567', 'الرياض', 'سعودي', true, true)
    `;

    await prisma.$executeRaw`
      INSERT INTO admins (id, userId, permissions, isActive)
      VALUES ('admin_001', 'admin_user_001', '{"canManageHackathons":true,"canManageUsers":true,"canManageJudges":true,"canViewReports":true,"canManageSettings":true}', true)
    `;

    console.log('✅ Admin user created');

    // Create test hackathon
    console.log('📝 Creating test hackathon...');
    await prisma.$executeRaw`
      INSERT INTO hackathons (
        id, title, description, requirements, categories, startDate, endDate, registrationDeadline,
        maxParticipants, status, prizes, settings, createdBy
      ) VALUES (
        'cmfrav55o0001fd8wu0hasq8s',
        'هاكاثون اختبار النظام المحدث',
        'هاكاثون لاختبار جميع المميزات الجديدة',
        '["متطلب 1", "متطلب 2", "متطلب 3"]',
        '["تقنية", "إبداع", "ريادة أعمال"]',
        datetime('now', '+7 days'),
        datetime('now', '+14 days'),
        datetime('now', '+5 days'),
        100,
        'active',
        '{"first":"10000 ريال","second":"5000 ريال","third":"2500 ريال"}',
        '{"maxTeamSize":5,"allowIndividualParticipation":true}',
        'admin_user_001'
      )
    `;

    console.log('✅ Test hackathon created');

    // Test queries
    console.log('🧪 Testing queries...');
    
    const hackathonCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM hackathons`;
    const userCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`;
    
    console.log(`✅ Database working - Hackathons: ${hackathonCount[0].count}, Users: ${userCount[0].count}`);

    console.log('\n🎉 Final fix completed successfully!');
    console.log('\n🔑 Admin Login:');
    console.log('   Email: admin@hackathon.gov.sa');
    console.log('   Password: admin123');
    console.log('\n📋 Next steps:');
    console.log('1. Copy dev_working.db to dev.db');
    console.log('2. Run: npm run dev');
    console.log('3. Test: http://localhost:3000/admin/hackathons');

  } catch (error) {
    console.error('❌ Error in final fix:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Run the fix
finalFix();
