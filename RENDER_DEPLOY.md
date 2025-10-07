# Render Deployment Guide

## تم حل المشاكل التالية:

### 1. مشكلة قاعدة البيانات ✅
- تم تغيير schema.prisma من SQLite إلى PostgreSQL
- تم إنشاء schema.dev.prisma منفصل للتطوير المحلي
- تم إضافة scripts آمنة لإعداد قاعدة البيانات

### 2. مشاكل الـ Exports المفقودة ✅
- تم إضافة `getAllParticipants()` في lib/participants-storage.ts
- تم إضافة `saveParticipant()` في lib/participants-storage.ts  
- تم إضافة `updateParticipantStatus()` في lib/participants-storage.ts

### 3. مشكلة useSearchParams ✅
- تم إضافة Suspense boundary في app/judge/register/page.tsx
- تم تقسيم المكون إلى JudgeRegisterContent مع Suspense wrapper

## متغيرات البيئة المطلوبة في Render:

```bash
# Database (يتم توفيرها تلقائياً من Render)
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
NEXTAUTH_URL=https://hackathon-platform-601l.onrender.com
NEXTAUTH_SECRET=your-nextauth-secret-here

# Email
GMAIL_USER=racein668@gmail.com
GMAIL_PASS=gpbyxbbvrzfyluqt
MAIL_FROM=racein668@gmail.com

# API
EXTERNAL_API_KEY=hk_4824b9a0dc9f16dad38c376134c7abe54b3e75cde5778af252c82583812e5f36

# Environment
NODE_ENV=production
RENDER=true
NEXT_PUBLIC_BASE_URL=https://hackathon-platform-601l.onrender.com
NEXT_PUBLIC_APP_URL=https://hackathon-platform-601l.onrender.com
```

## أمر البناء في Render:

```bash
rm -rf node_modules package-lock.json && npm install --force --no-package-lock && npx prisma generate --schema ./schema.prisma && node scripts/safe-db-setup.js && npm run build
```

## الملفات المهمة:

- `schema.prisma` - للإنتاج (PostgreSQL)
- `schema.dev.prisma` - للتطوير (SQLite)
- `scripts/render-safe-deploy.js` - فحص البيئة
- `scripts/safe-db-setup.js` - إعداد قاعدة البيانات الآمن
- `.env.production` - متغيرات الإنتاج

## حماية البيانات:

✅ جميع scripts مصممة لعدم حذف البيانات الموجودة
✅ يتم فقط إنشاء الجداول المفقودة
✅ لا يتم تعديل البيانات الموجودة

## الخطوات التالية:

1. تأكد من إعداد متغيرات البيئة في Render Dashboard
2. ادفع التغييرات إلى GitHub
3. سيتم النشر تلقائياً على Render

## API الخارجي:

سيكون متاحاً على:
https://hackathon-platform-601l.onrender.com/api/external/v1
