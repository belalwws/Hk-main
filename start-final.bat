@echo off
echo 🚀 Starting server with final fixed database...

REM Kill any existing processes
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Set environment variables
set DATABASE_URL=file:./dev.db
set JWT_SECRET=dev-jwt-secret-key-not-for-production
set NODE_ENV=development
set NEXTAUTH_URL=http://localhost:3000
set NEXTAUTH_SECRET=dev-nextauth-secret

echo 📊 Environment variables set:
echo    DATABASE_URL=%DATABASE_URL%
echo    NODE_ENV=%NODE_ENV%
echo.

echo 🧪 Testing database connection...
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$connect()
  .then(() => {
    console.log('✅ Database connection successful');
    return Promise.all([
      prisma.user.count(),
      prisma.hackathon.count(),
      prisma.participant.count(),
      prisma.team.count(),
      prisma.admin.count()
    ]);
  })
  .then(([users, hackathons, participants, teams, admins]) => {
    console.log('📊 Database stats:');
    console.log('   - Users:', users);
    console.log('   - Hackathons:', hackathons);
    console.log('   - Participants:', participants);
    console.log('   - Teams:', teams);
    console.log('   - Admins:', admins);
    return prisma.$disconnect();
  })
  .then(() => {
    console.log('🎉 Database is ready!');
  })
  .catch(error => {
    console.log('❌ Database test failed:', error.message);
    process.exit(1);
  });
"

if %errorlevel% neq 0 (
    echo ❌ Database test failed
    pause
    exit /b 1
)

echo.
echo 🎉 All systems ready!
echo 🔑 Admin login: admin@hackathon.gov.sa / admin123
echo.
echo 🚀 Starting Next.js development server...
echo 🌐 Server will be available at: http://localhost:3000
echo 📊 Admin panel: http://localhost:3000/admin/hackathons
echo.

npm run dev
