@echo off
echo 🔄 Force switching to new database...

REM Kill any processes that might be using the database
echo ⏹️ Stopping any processes using the database...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Try to delete old database multiple times
echo 🗑️ Removing old database...
for /l %%i in (1,1,5) do (
    if exist dev.db (
        del /f /q dev.db >nul 2>&1
        if not exist dev.db (
            echo ✅ Old database removed successfully
            goto :rename_new
        )
        echo ⏳ Attempt %%i failed, retrying...
        timeout /t 1 /nobreak >nul
    ) else (
        goto :rename_new
    )
)

:rename_new
REM Rename new database
if exist dev_new.db (
    echo 🔄 Renaming new database...
    ren dev_new.db dev.db
    if exist dev.db (
        echo ✅ Database switched successfully!
    ) else (
        echo ❌ Failed to rename database
        pause
        exit /b 1
    )
) else (
    echo ❌ New database not found!
    echo Please run: node scripts/recreate-database.js
    pause
    exit /b 1
)

REM Verify the new database
echo 🧪 Verifying new database...
node -e "
const { PrismaClient } = require('@prisma/client');
process.env.DATABASE_URL = 'file:./dev.db';
const prisma = new PrismaClient();
prisma.$connect()
  .then(() => prisma.user.count())
  .then(count => {
    console.log('✅ Database verification successful - Users:', count);
    return prisma.$disconnect();
  })
  .catch(error => {
    console.log('❌ Database verification failed:', error.message);
    process.exit(1);
  });
"

if %errorlevel% neq 0 (
    echo ❌ Database verification failed
    pause
    exit /b 1
)

echo 🎉 Database switch completed successfully!
echo 🔑 Admin login: admin@hackathon.gov.sa / admin123
echo.

REM Set environment variables and start server
set DATABASE_URL=file:./dev.db
set JWT_SECRET=dev-jwt-secret-key-not-for-production
set NODE_ENV=development
set NEXTAUTH_URL=http://localhost:3000
set NEXTAUTH_SECRET=dev-nextauth-secret

echo 🚀 Starting development server with new database...
echo 🌐 Server will be available at: http://localhost:3000
echo.

npm run dev
