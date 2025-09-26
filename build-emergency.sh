#!/bin/bash

# Emergency build script for Render deployment
# This bypasses all package-lock.json issues

echo "🚨 Emergency build starting..."

# Step 1: Clean everything
echo "🧹 Cleaning node_modules and package-lock.json..."
rm -rf node_modules
rm -f package-lock.json
rm -f npm-shrinkwrap.json

# Step 2: Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force || echo "Cache clean failed, continuing..."

# Step 3: Force install with legacy peer deps
echo "📦 Installing packages with --legacy-peer-deps..."
npm install --legacy-peer-deps --no-package-lock --no-audit --no-fund || {
  echo "⚠️ Legacy peer deps failed, trying with --force..."
  npm install --force --no-package-lock --no-audit --no-fund
}

# Step 4: Generate Prisma
echo "🔧 Generating Prisma client..."
npx prisma generate --schema ./schema.prisma

# Step 5: Setup database
echo "🗄️ Setting up database..."
node scripts/safe-db-setup.js

# Step 6: Build application
echo "🏗️ Building application..."
npm run build

echo "✅ Emergency build completed!"
