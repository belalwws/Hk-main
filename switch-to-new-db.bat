@echo off
echo 🔄 Switching to new database with all columns...

REM Stop any running processes first
echo ⏹️ Please stop the development server (Ctrl+C) if it's running...
timeout /t 3 /nobreak >nul

REM Backup old database
if exist dev.db (
    echo 💾 Backing up old database...
    copy dev.db dev_backup.db >nul
    echo ✅ Old database backed up as dev_backup.db
)

REM Replace old database with new one
if exist dev_new.db (
    echo 🔄 Switching to new database...
    if exist dev.db (
        del dev.db
    )
    ren dev_new.db dev.db
    echo ✅ Database switched successfully!
) else (
    echo ❌ New database not found! Run: node scripts/recreate-database.js
    pause
    exit /b 1
)

REM Set environment variables for local development
set DATABASE_URL=file:./dev.db
set JWT_SECRET=dev-jwt-secret-key-not-for-production
set NODE_ENV=development
set NEXTAUTH_URL=http://localhost:3000
set NEXTAUTH_SECRET=dev-nextauth-secret

echo 📊 Environment variables set:
echo    DATABASE_URL=%DATABASE_URL%
echo    NODE_ENV=%NODE_ENV%
echo.

echo 🎉 Database switch completed!
echo 🔑 Admin login: admin@hackathon.gov.sa / admin123
echo.
echo 🚀 Starting Next.js development server...
echo 🌐 Server will be available at: http://localhost:3000
echo.

npm run dev
