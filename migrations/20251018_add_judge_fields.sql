-- ✅ Migration آمنة: إضافة حقول جديدة لجدول judge_applications
-- هذه الـ migration آمنة 100% لأن:
-- 1. كل الحقول nullable - لن تؤثر على البيانات الموجودة
-- 2. لا يوجد حذف لأي حقول
-- 3. لا يوجد تعديل على حقول موجودة

-- إضافة الحقول الجديدة
ALTER TABLE "judge_applications" 
ADD COLUMN IF NOT EXISTS "nationalId" TEXT,
ADD COLUMN IF NOT EXISTS "workplace" TEXT,
ADD COLUMN IF NOT EXISTS "education" TEXT,
ADD COLUMN IF NOT EXISTS "previousHackathons" TEXT;

-- تحديث التعليقات على الأعمدة
COMMENT ON COLUMN "judge_applications"."nationalId" IS 'رقم الهوية';
COMMENT ON COLUMN "judge_applications"."workplace" IS 'جهة العمل';
COMMENT ON COLUMN "judge_applications"."education" IS 'المؤهل العلمي';
COMMENT ON COLUMN "judge_applications"."previousHackathons" IS 'هل شارك في هاكاثونات سابقة';
COMMENT ON COLUMN "judge_applications"."profileImage" IS 'URL للصورة من Cloudinary';
