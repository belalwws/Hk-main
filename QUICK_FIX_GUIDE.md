# 🚀 إصلاح سريع لنظام المشرفين على الإنتاج

## المشكلة
```
Error [PrismaClientKnownRequestError]: 
The table `public.supervisor_invitations` does not exist in the current database.
```

## الحل السريع (5 دقائق)

### الخطوة 1: احصل على رابط قاعدة البيانات
من **Neon Console**:
1. اذهب لمشروعك
2. انسخ **Connection String**
3. يجب أن يكون مثل: `postgresql://username:password@hostname:5432/database_name`

### الخطوة 2: اختبر الاتصال
```bash
# ضع رابط قاعدة البيانات هنا
DATABASE_URL="postgresql://your-connection-string" npm run db:test
```

### الخطوة 3: تطبيق Migration
```bash
# تطبيق التحديثات على قاعدة البيانات
DATABASE_URL="postgresql://your-connection-string" npm run db:migrate-production
```

### الخطوة 4: تحديث Render
في **Render Dashboard**:
1. اذهب لـ **Environment Variables**
2. تأكد من `DATABASE_URL` صحيح
3. أعد نشر التطبيق

## البديل: تشغيل SQL مباشرة

إذا لم تعمل الطريقة أعلاه، افتح **Neon SQL Editor** وشغل:

```sql
-- إضافة supervisor لـ UserRole enum
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

-- إنشاء جدول supervisors
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

-- إنشاء جدول supervisor_invitations
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

-- إنشاء الفهارس
CREATE UNIQUE INDEX IF NOT EXISTS "supervisors_userId_hackathonId_key" ON "supervisors"("userId", "hackathonId");
CREATE UNIQUE INDEX IF NOT EXISTS "supervisor_invitations_token_key" ON "supervisor_invitations"("token");

-- إضافة Foreign Keys
ALTER TABLE "supervisors" ADD CONSTRAINT "supervisors_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "supervisor_invitations" ADD CONSTRAINT "supervisor_invitations_invitedBy_fkey" 
FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## التحقق من النجاح

بعد تطبيق التحديثات:
1. ادخل على موقعك الإنتاجي
2. اذهب لـ `/admin/supervisors`
3. جرب إرسال دعوة مشرف
4. يجب أن يعمل بدون أخطاء

## إذا واجهت مشاكل

### خطأ في الاتصال
- تأكد من صحة `DATABASE_URL`
- تحقق من أن قاعدة البيانات تعمل في Neon

### خطأ في الصلاحيات
- تأكد من أن المستخدم له صلاحيات CREATE TABLE
- جرب من Neon SQL Editor مباشرة

### خطأ في Foreign Keys
- تأكد من وجود جداول `users` و `hackathons`
- قد تحتاج لحذف Foreign Keys إذا كانت تسبب مشاكل

## الدعم

إذا احتجت مساعدة:
1. شارك رسالة الخطأ كاملة
2. تأكد من تطبيق الخطوات بالترتيب
3. تحقق من logs في Render

---

**النتيجة المتوقعة**: نظام المشرفين يعمل بالكامل على الإنتاج! 🎉
