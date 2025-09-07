const fs = require('fs')
const path = require('path')

console.log('🚀 إعداد المشروع للإنتاج على Render...')

// 1. تحديث schema.prisma للإنتاج
function updatePrismaSchema() {
  console.log('📝 تحديث schema.prisma...')
  
  const schemaPath = path.join(__dirname, '..', 'schema.prisma')
  let schema = fs.readFileSync(schemaPath, 'utf8')
  
  // تغيير من SQLite إلى PostgreSQL
  schema = schema.replace(
    /datasource db \{[\s\S]*?\}/,
    `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
  )
  
  fs.writeFileSync(schemaPath, schema)
  console.log('✅ تم تحديث schema.prisma للإنتاج')
}

// 2. إنشاء ملف .env.production
function createProductionEnv() {
  console.log('📝 إنشاء ملف .env.production...')
  
  const envContent = `# Production Environment Variables for Render
# Copy these to Render Environment Variables

# Database (Get from Render PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Security (Generate a strong random key)
JWT_SECRET="CHANGE_THIS_TO_A_STRONG_RANDOM_64_CHAR_KEY_FOR_PRODUCTION"

# Email Configuration
GMAIL_USER="your-production-email@gmail.com"
GMAIL_PASS="your-gmail-app-password"
MAIL_FROM="هاكاثون الابتكار التقني <your-production-email@gmail.com>"

# App Configuration
NEXTAUTH_URL="https://your-app-name.onrender.com"
NODE_ENV="production"

# Optional: Render specific
RENDER="true"
`
  
  fs.writeFileSync('.env.production', envContent)
  console.log('✅ تم إنشاء .env.production')
}

// 3. تحديث next.config.mjs للإنتاج
function updateNextConfig() {
  console.log('📝 تحديث next.config.mjs...')
  
  const configContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint checks in production
  },
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript checks in production
  },
  images: {
    unoptimized: true,
  },
  // Canvas configuration for production
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('canvas')
    }
    return config
  },
  // Optimize for production
  experimental: {
    optimizeCss: true,
  },
}

export default nextConfig
`
  
  fs.writeFileSync('next.config.mjs', configContent)
  console.log('✅ تم تحديث next.config.mjs')
}

// 4. إنشاء package.json scripts للإنتاج
function updatePackageScripts() {
  console.log('📝 تحديث package.json scripts...')
  
  const packagePath = 'package.json'
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  
  // إضافة scripts للإنتاج
  packageJson.scripts = {
    ...packageJson.scripts,
    "build:production": "npx prisma generate && next build",
    "start:production": "next start",
    "deploy:render": "npx prisma migrate deploy && npm run db:seed-admin",
    "postinstall": "npx prisma generate"
  }
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
  console.log('✅ تم تحديث package.json scripts')
}

// 5. إنشاء ملف render.yaml
function createRenderConfig() {
  console.log('📝 إنشاء render.yaml...')
  
  const renderConfig = `# Render Configuration
services:
  - type: web
    name: hackathon-platform
    env: node
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: hackathon-db
          property: connectionString
    
databases:
  - name: hackathon-db
    databaseName: hackathon_production
    user: hackathon_user
`
  
  fs.writeFileSync('render.yaml', renderConfig)
  console.log('✅ تم إنشاء render.yaml')
}

// 6. إنشاء دليل النشر
function createDeploymentGuide() {
  console.log('📝 إنشاء دليل النشر...')
  
  const guideContent = `# 🚀 دليل النشر على Render

## 1️⃣ إعداد قاعدة البيانات:
1. اذهب إلى Render Dashboard
2. أنشئ PostgreSQL database جديد
3. انسخ DATABASE_URL

## 2️⃣ إعداد Web Service:
1. أنشئ Web Service جديد
2. اربطه بـ GitHub repository
3. استخدم الإعدادات التالية:

### Build Command:
\`\`\`
npm install && npx prisma generate && npm run build
\`\`\`

### Start Command:
\`\`\`
npm start
\`\`\`

## 3️⃣ Environment Variables:
انسخ المتغيرات من .env.production وأضفها في Render:

- DATABASE_URL (من PostgreSQL database)
- JWT_SECRET (مفتاح قوي عشوائي)
- GMAIL_USER
- GMAIL_PASS
- MAIL_FROM
- NODE_ENV=production

## 4️⃣ بعد النشر:
1. شغل Migration:
\`\`\`
npx prisma migrate deploy
\`\`\`

2. أنشئ Admin account:
\`\`\`
npm run db:seed-admin
\`\`\`

## 5️⃣ اختبار النظام:
- تسجيل دخول Admin
- إنشاء هاكاثون
- إنشاء محكمين
- اختبار إرسال الإيميلات

✅ المشروع جاهز للإنتاج!
`
  
  fs.writeFileSync('DEPLOYMENT_GUIDE.md', guideContent)
  console.log('✅ تم إنشاء DEPLOYMENT_GUIDE.md')
}

// تشغيل جميع الخطوات
async function main() {
  try {
    updatePrismaSchema()
    createProductionEnv()
    updateNextConfig()
    updatePackageScripts()
    createRenderConfig()
    createDeploymentGuide()
    
    console.log('\n🎉 تم إعداد المشروع للإنتاج بنجاح!')
    console.log('\n📋 الخطوات التالية:')
    console.log('1. راجع ملف .env.production وحدث البيانات')
    console.log('2. ادفع التغييرات إلى GitHub')
    console.log('3. أنشئ Web Service على Render')
    console.log('4. أضف Environment Variables')
    console.log('5. انشر المشروع!')
    console.log('\n📖 راجع DEPLOYMENT_GUIDE.md للتفاصيل الكاملة')
    
  } catch (error) {
    console.error('❌ خطأ في إعداد المشروع:', error)
  }
}

main()
