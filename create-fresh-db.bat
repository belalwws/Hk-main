@echo off
echo 🚀 Creating fresh database with updated schema...

REM Set environment variables
set DATABASE_URL=file:./dev.db
set JWT_SECRET=dev-jwt-secret-key-not-for-production
set NODE_ENV=development

echo 📊 Environment variables set:
echo    DATABASE_URL=%DATABASE_URL%
echo.

echo 🗑️ Removing old database...
if exist dev.db del /f dev.db
if exist dev.db-journal del /f dev.db-journal

echo 📝 Pushing schema to create new database...
npx prisma db push --force-reset

if %errorlevel% neq 0 (
    echo ❌ Schema push failed
    pause
    exit /b 1
)

echo 👤 Creating admin user...
node -e "
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
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
        isActive: true
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

    console.log('✅ Admin user created successfully');
    await prisma.$disconnect();
  } catch (error) {
    console.log('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
"

if %errorlevel% neq 0 (
    echo ❌ Admin creation failed
    pause
    exit /b 1
)

echo 📝 Creating test hackathon...
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestHackathon() {
  try {
    const hackathon = await prisma.hackathon.create({
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
        createdBy: 'admin_user_001'
      }
    });

    console.log('✅ Test hackathon created:', hackathon.title);
    await prisma.$disconnect();
  } catch (error) {
    console.log('❌ Error creating hackathon:', error.message);
    process.exit(1);
  }
}

createTestHackathon();
"

if %errorlevel% neq 0 (
    echo ❌ Hackathon creation failed
    pause
    exit /b 1
)

echo.
echo 🎉 Fresh database created successfully!
echo 🔑 Admin login: admin@hackathon.gov.sa / admin123
echo 📊 Test hackathon ID: cmfrav55o0001fd8wu0hasq8s
echo.
echo 🚀 Starting development server...
npm run dev
