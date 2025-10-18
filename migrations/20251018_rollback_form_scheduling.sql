-- Rollback Migration: Remove Form Scheduling Fields
-- Date: 2025-10-18
-- Description: إزالة حقول openAt و closeAt بأمان في حالة الحاجة للرجوع
-- SAFE: يحذف الأعمدة فقط بدون حذف الجداول أو البيانات الأخرى

-- Step 1: إزالة حقول التوقيت من HackathonForm
ALTER TABLE "hackathon_forms" 
DROP COLUMN IF EXISTS "openAt",
DROP COLUMN IF EXISTS "closeAt";

-- Step 2: إزالة حقول التوقيت من Form
ALTER TABLE "forms" 
DROP COLUMN IF EXISTS "openAt",
DROP COLUMN IF EXISTS "closeAt";

-- التحقق من الإزالة
SELECT 
  COUNT(*) as remaining_columns
FROM information_schema.columns
WHERE table_name IN ('hackathon_forms', 'forms')
  AND column_name IN ('openAt', 'closeAt');
