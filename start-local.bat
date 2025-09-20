@echo off
echo 🚀 Starting local development server with SQLite database...

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

echo 🔍 Checking if database exists...
if exist dev.db (
    echo ✅ Database exists
) else (
    echo 📝 Creating database tables...
    node scripts/create-database-tables.js
)

echo.
echo 🚀 Starting Next.js development server...
echo 🌐 Server will be available at: http://localhost:3000
echo 🔑 Admin login: admin@hackathon.gov.sa / admin123
echo.

npm run dev
