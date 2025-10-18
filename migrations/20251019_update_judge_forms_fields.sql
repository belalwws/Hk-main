-- تحديث كل فورمات المحكمين القديمة بالحقول الجديدة
-- هذا الـ script يضيف الحقول الافتراضية الجديدة لأي فورم قديم

UPDATE "judge_form_designs"
SET settings = jsonb_set(
  COALESCE(settings::jsonb, '{}'::jsonb),
  '{fields}',
  '[
    {"id": "name", "type": "text", "label": "الاسم الكامل", "placeholder": "أدخل اسمك الكامل", "required": true},
    {"id": "email", "type": "email", "label": "البريد الإلكتروني", "placeholder": "example@email.com", "required": true},
    {"id": "phone", "type": "phone", "label": "رقم الهاتف", "placeholder": "05xxxxxxxx", "required": false},
    {"id": "nationalId", "type": "text", "label": "رقم الهوية", "placeholder": "أدخل رقم الهوية", "required": false},
    {"id": "workplace", "type": "text", "label": "جهة العمل", "placeholder": "أدخل جهة العمل", "required": false},
    {"id": "education", "type": "text", "label": "المؤهل العلمي", "placeholder": "مثال: بكالوريوس علوم حاسب", "required": false},
    {"id": "previousHackathons", "type": "select", "label": "هل شاركت في هاكاثونات افتراضية من قبل؟", "required": false, "options": ["نعم", "لا"]},
    {"id": "bio", "type": "textarea", "label": "نبذة عن المحكم المشارك", "placeholder": "اكتب نبذة مختصرة عنك...", "required": false},
    {"id": "profileImage", "type": "file", "label": "صورة شخصية", "required": false, "description": "الرجاء رفع صورة شخصية واضحة"}
  ]'::jsonb
)
WHERE settings IS NULL OR settings::jsonb->'fields' IS NULL;

-- عرض النتيجة للتحقق
SELECT 
  "hackathonId",
  title,
  settings::jsonb->'fields' as fields
FROM "judge_form_designs";
