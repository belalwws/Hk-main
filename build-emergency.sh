#!/bin/bash

# Emergency build script for Render deployment
# This bypasses all package-lock.json issues

echo "🚨 Emergency build starting..."

# Step 1: Clean everything
echo "🧹 Cleaning node_modules and package-lock.json..."
rm -rf node_modules
rm -f package-lock.json
rm -f npm-shrinkwrap.json

# Step 2: Force install
echo "📦 Force installing packages..."
npm install --force --no-audit --no-fund

# Step 3: Generate Prisma
echo "🔧 Generating Prisma client..."
npx prisma generate --schema ./schema.prisma

# Step 4: Setup database
echo "🗄️ Setting up database..."
node scripts/safe-db-setup.js

# Step 5: Build application
echo "🏗️ Building application..."
npm run build

echo "✅ Emergency build completed!"
