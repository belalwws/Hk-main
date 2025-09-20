@echo off
echo 🚀 Starting server with fixed database...

REM Kill any existing processes
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Set environment variables to use the fixed database
set DATABASE_URL=file:./dev_fixed.db
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
process.env.DATABASE_URL = 'file:./dev_fixed.db';
const prisma = new PrismaClient();
prisma.$connect()
  .then(() => prisma.user.count())
  .then(count => {
    console.log('✅ Database connection successful - Users:', count);
    return prisma.hackathon.count();
  })
  .then(count => {
    console.log('✅ Hackathons table working - Count:', count);
    return prisma.participant.count();
  })
  .then(count => {
    console.log('✅ Participants table working - Count:', count);
    return prisma.team.count();
  })
  .then(count => {
    console.log('✅ Teams table working - Count:', count);
    return prisma.$disconnect();
  })
  .then(() => {
    console.log('🎉 All tables verified successfully!');
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
echo 🎉 Database is ready!
echo 🔑 Admin login: admin@hackathon.gov.sa / admin123
echo.
echo 🚀 Starting Next.js development server...
echo 🌐 Server will be available at: http://localhost:3000
echo.

npm run dev
