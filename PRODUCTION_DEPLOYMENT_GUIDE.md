# دليل نشر نظام المشرفين على الإنتاج

## المشكلة الحالية
الموقع مرفوع على **Render** وقاعدة البيانات على **Neon PostgreSQL**، لكن الجداول الجديدة للمشرفين لم يتم إنشاؤها في قاعدة البيانات الإنتاجية.

## الحلول المتاحة

### الحل الأول: تشغيل Migration Script (الأسرع)

#### 1. الحصول على رابط قاعدة البيانات
من لوحة تحكم **Neon**:
- اذهب لمشروعك
- انسخ **Connection String** 
- يجب أن يكون بالشكل: `postgresql://username:password@hostname:5432/database_name`

#### 2. تحديث متغيرات البيئة في Render
في لوحة تحكم **Render**:
- اذهب لـ **Environment Variables**
- تأكد من وجود `DATABASE_URL` مع رابط Neon الصحيح

#### 3. تشغيل Migration من الكمبيوتر المحلي
```bash
# 1. تحديث .env.production برابط قاعدة البيانات الصحيح
DATABASE_URL="postgresql://your-neon-connection-string"

# 2. تشغيل migration script
NODE_ENV=production DATABASE_URL="your-neon-connection-string" node scripts/migrate-production.js
```

### الحل الثاني: استخدام Prisma Migrate (الأكثر أماناً)

#### 1. إنشاء Migration جديد
```bash
# تحديث DATABASE_URL في .env مؤقتاً
DATABASE_URL="postgresql://your-neon-connection-string"

# إنشاء migration
npx prisma migrate dev --name add_supervisor_system

# إعادة DATABASE_URL للتطوير
DATABASE_URL="file:./dev.db"
```

#### 2. تطبيق Migration على الإنتاج
```bash
# تطبيق migrations على قاعدة البيانات الإنتاجية
DATABASE_URL="postgresql://your-neon-connection-string" npx prisma migrate deploy
```

### الحل الثالث: تشغيل SQL مباشرة في Neon

#### 1. فتح Neon SQL Editor
- اذهب لـ **Neon Console**
- افتح **SQL Editor**

#### 2. تشغيل SQL Script
انسخ والصق المحتوى من `migrations/add_supervisor_system.sql`:

```sql
-- 1. تحديث UserRole enum
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'supervisor' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
    ) THEN
        ALTER TYPE "UserRole" ADD VALUE 'supervisor';
    END IF;
END $$;

-- 2. إنشاء جدول supervisors
CREATE TABLE IF NOT EXISTS "supervisors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hackathonId" TEXT,
    "permissions" JSONB,
    "department" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "supervisors_pkey" PRIMARY KEY ("id")
);

-- 3. إنشاء جدول supervisor_invitations
CREATE TABLE IF NOT EXISTS "supervisor_invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "hackathonId" TEXT,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invitedBy" TEXT NOT NULL,
    "permissions" JSONB,
    "department" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "supervisor_invitations_pkey" PRIMARY KEY ("id")
);

-- 4. إنشاء الفهارس
CREATE UNIQUE INDEX IF NOT EXISTS "supervisors_userId_hackathonId_key" ON "supervisors"("userId", "hackathonId");
CREATE UNIQUE INDEX IF NOT EXISTS "supervisor_invitations_token_key" ON "supervisor_invitations"("token");

-- 5. إضافة Foreign Keys
ALTER TABLE "supervisors" ADD CONSTRAINT "supervisors_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "supervisors" ADD CONSTRAINT "supervisors_hackathonId_fkey" 
FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "supervisor_invitations" ADD CONSTRAINT "supervisor_invitations_invitedBy_fkey" 
FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "supervisor_invitations" ADD CONSTRAINT "supervisor_invitations_hackathonId_fkey" 
FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## التحقق من نجاح Migration

### 1. فحص الجداول
```sql
-- التحقق من وجود الجداول
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('supervisors', 'supervisor_invitations');

-- التحقق من UserRole enum
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole');
```

### 2. اختبار من التطبيق
بعد تطبيق Migration:
- ادخل على الموقع الإنتاجي
- اذهب لـ `/admin/supervisors`
- جرب إرسال دعوة مشرف
- يجب أن يعمل بدون أخطاء

## إعادة نشر التطبيق على Render

### 1. رفع التحديثات
```bash
git add .
git commit -m "Add supervisor system with database migrations"
git push origin main
```

### 2. إعادة النشر التلقائي
- Render سيعيد النشر تلقائياً
- تأكد من أن Build يكتمل بنجاح

### 3. التحقق من متغيرات البيئة
في Render، تأكد من وجود:
```
DATABASE_URL=postgresql://your-neon-connection-string
JWT_SECRET=your-production-jwt-secret
NEXTAUTH_URL=https://your-app.onrender.com
NODE_ENV=production
```

## استكشاف الأخطاء

### خطأ "table does not exist"
- تأكد من تطبيق Migration بنجاح
- تحقق من اتصال قاعدة البيانات
- راجع logs في Render

### خطأ "enum value does not exist"
- تأكد من تحديث UserRole enum
- أعد تشغيل SQL لتحديث enum

### خطأ في Foreign Keys
- تأكد من وجود الجداول المرجعية (users, hackathons)
- تحقق من أن الـ IDs متطابقة

## الخطوات النهائية

1. ✅ **تطبيق Migration** (اختر أحد الحلول أعلاه)
2. ✅ **رفع الكود المحدث** لـ GitHub
3. ✅ **إعادة النشر** على Render
4. ✅ **اختبار النظام** على الإنتاج
5. ✅ **إنشاء أول مشرف** للتأكد من عمل النظام

## ملاحظات مهمة

- **احتفظ بنسخة احتياطية** من قاعدة البيانات قبل Migration
- **اختبر على staging** إذا كان متاحاً
- **راقب logs** أثناء وبعد النشر
- **تأكد من عمل البريد الإلكتروني** لنظام الدعوات

بعد تطبيق هذه الخطوات، سيعمل نظام المشرفين بالكامل على الإنتاج! 🚀
