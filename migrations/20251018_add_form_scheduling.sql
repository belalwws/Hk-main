-- Migration: Add Form Scheduling Fields
-- Date: 2025-10-18
-- Description: إضافة حقول openAt و closeAt للجدولة الآمنة للفورمات
-- SAFE: يضيف أعمدة اختيارية فقط بدون حذف أي بيانات

-- Step 1: إضافة حقول التوقيت إلى HackathonForm
ALTER TABLE "hackathon_forms" 
ADD COLUMN IF NOT EXISTS "openAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "closeAt" TIMESTAMP(3);

-- Step 2: إضافة حقول التوقيت إلى Form
ALTER TABLE "forms" 
ADD COLUMN IF NOT EXISTS "openAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "closeAt" TIMESTAMP(3);

-- Step 3: إضافة تعليق للتوضيح
COMMENT ON COLUMN "hackathon_forms"."openAt" IS 'تاريخ ووقت فتح الفورم (nullable - إذا كان null فالفورم مفتوح دائماً)';
COMMENT ON COLUMN "hackathon_forms"."closeAt" IS 'تاريخ ووقت إغلاق الفورم (nullable - إذا كان null فالفورم مفتوح دائماً)';
COMMENT ON COLUMN "forms"."openAt" IS 'تاريخ ووقت فتح الفورم (nullable)';
COMMENT ON COLUMN "forms"."closeAt" IS 'تاريخ ووقت إغلاق الفورم (nullable)';

-- التحقق من نجاح الإضافة
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'hackathon_forms' 
  AND column_name IN ('openAt', 'closeAt');
