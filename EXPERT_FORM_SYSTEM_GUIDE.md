# نظام فورم الخبراء (Experts Form System)

## نظرة عامة
تم إضافة تبويب جديد في صفحة إدارة الفورمات لاستقبال طلبات الخبراء، مشابه تماماً لنظام المحكمين.

## ما تم إضافته

### 1. **تبويب الخبراء في صفحة الفورمات**
📍 **المسار**: `/admin/forms`

#### المكونات:
1. **بطاقة فورم طلب الانضمام كخبير**
   - زر "بناء الفورم" → `/admin/expert-form-builder/[hackathonId]`
   - زر "معاينة الفورم" → `/expert/apply/[hackathonId]`
   - زر "نسخ الرابط" - لمشاركة الفورم
   - زر "إدارة الطلبات" → `/admin/experts`

2. **بطاقة نظام دعوات الخبراء**
   - زر "إدارة الدعوات" → `/admin/experts`
   - معلومات عن نظام الدعوات

### 2. **التصميم**
- **الألوان**: Cyan/Blue (للتمييز عن المحكمين Orange)
- **الأيقونات**: Users icon
- **التدرجات**: من cyan-50 إلى blue-50
- **Badge**: خلفية cyan-600

### 3. **المميزات المذكورة**
✨ **رفع صورة الخبير على Cloudinary**
- تحميل صورة احترافية للخبير
- تخزين على Cloudinary (مثل المحكمين)
- عرض الصورة في صفحة الخبراء

✨ **حقول ديناميكية قابلة للتخصيص**
- إضافة/حذف الحقول من Form Builder
- أنواع مختلفة (نص، رقم، تاريخ، اختيار، إلخ)

✨ **دعم المرفقات والملفات**
- رفع CV/السيرة الذاتية
- رفع شهادات الخبرة
- رفع أي مستندات داعمة

✨ **معلومات احترافية للخبير**
- الاسم والمنصب
- الخبرات والمهارات
- البريد الإلكتروني والهاتف
- الصورة الشخصية

## الملفات المطلوبة (لم يتم إنشاؤها بعد)

### 📁 صفحات Frontend

#### 1. Form Builder للخبراء
```
app/admin/expert-form-builder/[id]/page.tsx
```
**الوظيفة**: بناء وتخصيص فورم الخبراء
**مشابه لـ**: `app/admin/judge-form-builder/[id]/page.tsx`
**المميزات**:
- إضافة/حذف حقول
- تخصيص التصميم
- إضافة حقل رفع الصورة
- حفظ التكوين في قاعدة البيانات

#### 2. صفحة التقديم للخبراء
```
app/expert/apply/[id]/page.tsx
```
**الوظيفة**: صفحة عامة لتقديم طلبات الخبراء
**مشابه لـ**: `app/judge/apply/[id]/page.tsx`
**المميزات**:
- عرض الفورم الديناميكي
- رفع الصورة عبر Cloudinary
- إرسال الطلب للـ API
- رسالة تأكيد بعد الإرسال

#### 3. إدارة طلبات الخبراء
```
app/admin/experts/page.tsx
```
**الوظيفة**: إدارة جميع طلبات الخبراء
**مشابه لـ**: `app/admin/judges/page.tsx`
**المميزات**:
- عرض جميع الطلبات
- قبول/رفض الطلبات
- إرسال دعوات للخبراء
- عرض الصور والمعلومات
- فلترة وبحث

### 📁 API Routes

#### 1. Get Expert Form Config
```
app/api/admin/hackathons/[id]/expert-form/route.ts
```
**Methods**: GET, PUT
**الوظيفة**: جلب وحفظ تكوين فورم الخبراء

#### 2. Submit Expert Application
```
app/api/expert/apply/route.ts
```
**Method**: POST
**الوظيفة**: استقبال طلب الخبير وحفظه

#### 3. Get Expert Submissions
```
app/api/admin/experts/route.ts
```
**Methods**: GET
**الوظيفة**: جلب جميع طلبات الخبراء

#### 4. Update Expert Status
```
app/api/admin/experts/[id]/route.ts
```
**Methods**: PATCH, DELETE
**الوظيفة**: تحديث حالة الخبير (قبول/رفض)

### 📁 Database Schema

#### إضافة جدول Experts في Prisma
```prisma
model Expert {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  phone         String?
  photo         String?  // URL from Cloudinary
  bio           String?
  expertise     String[] // Array of expertise areas
  yearsOfExperience Int?
  currentPosition String?
  company       String?
  linkedIn      String?
  portfolio     String?
  cv            String?  // URL to CV file
  status        ExpertStatus @default(PENDING)
  hackathonId   String
  hackathon     Hackathon @relation(fields: [hackathonId], references: [id])
  formData      Json?    // Dynamic form data
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("experts")
}

enum ExpertStatus {
  PENDING
  APPROVED
  REJECTED
}

// إضافة العلاقة في Hackathon model
model Hackathon {
  // ... existing fields
  experts       Expert[]
}
```

#### إضافة جدول ExpertFormConfig
```prisma
model ExpertFormConfig {
  id            String   @id @default(cuid())
  hackathonId   String   @unique
  hackathon     Hackathon @relation(fields: [hackathonId], references: [id])
  fields        Json     // Dynamic form fields configuration
  designConfig  Json?    // Design customization
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("expert_form_configs")
}
```

## خطوات التنفيذ

### المرحلة 1: إعداد قاعدة البيانات ✅ (يجب عملها)
1. إضافة models للـ Prisma schema
2. تشغيل `npx prisma migrate dev --name add_expert_system`
3. تحديث Prisma client

### المرحلة 2: إنشاء Form Builder
1. نسخ `app/admin/judge-form-builder/[id]/page.tsx`
2. تعديله ليصبح للخبراء
3. تغيير الألوان والنصوص
4. إضافة حقل رفع الصورة

### المرحلة 3: إنشاء صفحة التقديم
1. نسخ `app/judge/apply/[id]/page.tsx`
2. تعديله للخبراء
3. إضافة Cloudinary image upload
4. ربطه بـ API الخبراء

### المرحلة 4: إنشاء صفحة الإدارة
1. نسخ `app/admin/judges/page.tsx`
2. تعديله للخبراء
3. عرض الصور والمعلومات
4. إضافة فلاتر ووظائف القبول/الرفض

### المرحلة 5: إنشاء API Routes
1. إنشاء routes للفورم config
2. إنشاء route للتقديم
3. إنشاء routes للإدارة
4. ربطها بـ Prisma

### المرحلة 6: Cloudinary Integration
1. استخدام نفس setup الموجود
2. رفع الصور للخبراء
3. حفظ URLs في قاعدة البيانات

## أمثلة على حقول الفورم المقترحة

### الحقول الأساسية:
- **الاسم الكامل** (text, required)
- **البريد الإلكتروني** (email, required)
- **رقم الهاتف** (tel, required)
- **الصورة الشخصية** (image upload)
- **السيرة الذاتية** (file upload - PDF)

### المعلومات المهنية:
- **المنصب الحالي** (text)
- **الشركة/المؤسسة** (text)
- **سنوات الخبرة** (number)
- **مجالات الخبرة** (multi-select: تطوير, تصميم, أمن سيبراني, إلخ)

### الروابط الاجتماعية:
- **LinkedIn** (url)
- **Portfolio/Website** (url)
- **GitHub** (url - إذا كان مطور)

### معلومات إضافية:
- **نبذة عن الخبير** (textarea)
- **لماذا تريد الانضمام؟** (textarea)
- **الخبرات السابقة في الهاكاثونات** (textarea)

## مثال على Flow كامل

### 1. المسؤول يبني الفورم
```
Admin → /admin/forms → Experts Tab → "بناء الفورم"
→ /admin/expert-form-builder/[id]
→ يضيف الحقول المطلوبة
→ يفعّل حقل الصورة
→ يحفظ التكوين
```

### 2. مشاركة رابط الفورم
```
Admin → "نسخ الرابط"
→ https://site.com/expert/apply/[hackathonId]
→ مشاركته مع الخبراء المحتملين
```

### 3. الخبير يملأ الفورم
```
Expert → يفتح الرابط
→ /expert/apply/[id]
→ يملأ المعلومات
→ يرفع صورته
→ يرفع CV
→ يضغط "تقديم"
→ يحصل على رسالة تأكيد
```

### 4. المسؤول يراجع الطلبات
```
Admin → /admin/experts
→ يرى جميع الطلبات
→ يراجع معلومات كل خبير
→ يشاهد الصورة والCV
→ يقبل أو يرفض
→ يتم إرسال إيميل للخبير
```

## الفرق بين الخبراء والمحكمين

### الخبراء (Experts):
- **الدور**: تقديم استشارات وتوجيه للمشاركين
- **المشاركة**: قد يكونون متاحين للأسئلة والمساعدة
- **التقييم**: قد يساعدون في التقييم ولكن ليس دورهم الأساسي
- **الوقت**: قد يكونون متاحين طوال الهاكاثون

### المحكمين (Judges):
- **الدور**: تقييم المشاريع النهائية فقط
- **المشاركة**: في نهاية الهاكاثون فقط
- **التقييم**: دورهم الأساسي والوحيد
- **الوقت**: يوم العروض النهائية فقط

## الخطوات التالية المباشرة

### أولاً: Database Setup
```bash
# 1. أضف models للـ schema.prisma
# 2. اعمل migration
npx prisma migrate dev --name add_expert_system

# 3. حدث Prisma client
npx prisma generate
```

### ثانياً: Form Builder
```bash
# انسخ judge-form-builder وعدّله
cp -r app/admin/judge-form-builder app/admin/expert-form-builder
# ثم عدل الملفات للخبراء
```

### ثالثاً: Application Page
```bash
# انسخ judge apply page وعدّله
mkdir -p app/expert/apply/[id]
cp app/judge/apply/[id]/page.tsx app/expert/apply/[id]/page.tsx
# ثم عدل الملف للخبراء
```

### رابعاً: Management Page
```bash
# انسخ judges management وعدّله
cp app/admin/judges/page.tsx app/admin/experts/page.tsx
# ثم عدل الملف للخبراء
```

### خامساً: API Routes
```bash
# أنشئ API routes جديدة للخبراء
mkdir -p app/api/expert
mkdir -p app/api/admin/experts
# ثم أضف الملفات المطلوبة
```

## ملاحظات مهمة

⚠️ **Cloudinary Setup**:
- استخدم نفس configuration الموجود
- تأكد من وجود CLOUDINARY_URL في .env
- استخدم folder خاص للخبراء: `experts/`

⚠️ **Email Notifications**:
- إضافة قوالب إيميل للخبراء
- إيميل قبول الطلب
- إيميل رفض الطلب
- إيميل دعوة للانضمام

⚠️ **Security**:
- التحقق من صحة البيانات
- فحص أنواع الملفات المرفوعة
- حد أقصى لحجم الصور
- منع SQL injection و XSS

## الخلاصة
تم إضافة البنية التحتية الأساسية (UI) لنظام الخبراء. الخطوات التالية هي إنشاء الصفحات الفعلية، API routes، و database models لإتمام النظام.

تمت الإضافة بنجاح! ✅
