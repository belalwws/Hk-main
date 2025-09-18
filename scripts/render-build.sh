#!/bin/bash

echo "🚀 Starting Render build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run safe database update instead of migration
echo "🗄️ Updating database schema safely..."
node scripts/safe-db-update.js

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build completed successfully!"
