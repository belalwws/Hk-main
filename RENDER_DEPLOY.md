# دليل النشر على Render

## 📋 الخطوات المطلوبة

### 1. إعداد متغيرات البيئة في Render Dashboard

```bash
# Database
DATABASE_URL=postgresql://username:password@hostname:port/database

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app.onrender.com

# Email (اختياري)
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. إعداد Build Command في Render

```bash
npm install && npm run build && node scripts/production-migrate.js && node scripts/production-admin-migrate.js
```

### 3. إعداد Start Command

```bash
npm start
```

## 🔧 الملفات المحدثة للنشر

- ✅ `schema.prisma` - تم تحويله لـ PostgreSQL
- ✅ `lib/participants-storage.ts` - تم إضافة الدوال المفقودة  
- ✅ `app/judge/register/page.tsx` - تم إضافة Suspense wrapper
- ✅ `scripts/production-migrate.js` - migration آمن للإنتاج
- ✅ `scripts/production-admin-migrate.js` - migration نظام المشرفين

## 🆕 المميزات الجديدة المضافة

### نظام طلبات المشرفين
- ✅ فورم طلب انضمام مخصص للمشرفين
- ✅ رفع الصور الشخصية وصور الغلاف
- ✅ لوحة إدارة طلبات المشرفين
- ✅ تصميم فورم قابل للتخصيص بالكامل
- ✅ نظام مراجعة وقبول/رفض الطلبات

### الروابط الجديدة
- `/admin/apply/[hackathonId]` - فورم طلب الانضمام كمشرف
- `/admin/admin-applications` - إدارة طلبات المشرفين
- `/admin/admin-form-design/[hackathonId]` - تصميم فورم المشرفين

## 🛡️ ضمانات الأمان

- جميع scripts مصممة لعدم حذف البيانات الموجودة
- يتم إنشاء الجداول المفقودة فقط
- لا يتم تعديل البيانات الحالية
- التحقق من نوع وحجم الملفات المرفوعة
- حماية من الطلبات المكررة

## 🚀 بعد النشر

1. تأكد من عمل الموقع بشكل صحيح
2. اختبر تسجيل الدخول والتسجيل
3. تأكد من عمل قاعدة البيانات
4. اختبر رفع الملفات
5. اختبر نظام طلبات المشرفين الجديد

## 📁 مجلدات الرفع الجديدة

تأكد من وجود المجلدات التالية في `/public/uploads/`:
- `admin-profiles/` - للصور الشخصية للمشرفين
- `admin-form-covers/` - لصور أغلفة فورم المشرفين

## 🔗 روابط مهمة بعد النشر

### للمديرين:
- `https://your-app.onrender.com/admin/admin-applications` - إدارة طلبات المشرفين
- `https://your-app.onrender.com/admin/admin-form-design/[hackathonId]` - تصميم فورم المشرفين

### للمشرفين المحتملين:
- `https://your-app.onrender.com/admin/apply/[hackathonId]` - فورم طلب الانضمام

## 📊 اختبار النظام

### 1. اختبار فورم المشرفين:
1. اذهب إلى `/admin/apply/[hackathonId]`
2. املأ النموذج مع رفع صورة شخصية
3. تأكد من إرسال الطلب بنجاح

### 2. اختبار لوحة الإدارة:
1. اذهب إلى `/admin/admin-applications`
2. تأكد من ظهور الطلبات
3. اختبر قبول/رفض الطلبات

### 3. اختبار تصميم الفورم:
1. اذهب إلى `/admin/admin-form-design/[hackathonId]`
2. اختبر رفع صورة الغلاف
3. اختبر تغيير الألوان والنصوص
4. تأكد من حفظ التغييرات

---

✅ **المشروع جاهز للنشر على Render مع نظام المشرفين الجديد!**
