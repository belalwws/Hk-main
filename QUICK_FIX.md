# 🚨 الحل السريع لمشكلة الجداول المفقودة

## ✅ تم إصلاح المشكلة!

### المشكلة:
```
The table `main.hackathons` does not exist in the current database.
```

### الحل:
تم إنشاء جميع الجداول المطلوبة في قاعدة البيانات المحلية.

## 🚀 كيفية تشغيل النظام:

### الطريقة 1: استخدام Batch File (الأسهل)
```bash
# في Windows Command Prompt أو PowerShell
start-local.bat
```

### الطريقة 2: يدوياً
```bash
# 1. إنشاء الجداول (إذا لم تكن موجودة)
node scripts/create-database-tables.js

# 2. تشغيل الخادم
npm run dev
```

### الطريقة 3: استخدام Script مخصص
```bash
npm run dev:local
```

## 🔑 بيانات تسجيل الدخول:

**Admin:**
- Email: `admin@hackathon.gov.sa`
- Password: `admin123`

## 📊 ما تم إنشاؤه:

### الجداول:
- ✅ `users` - المستخدمين
- ✅ `admins` - المدراء
- ✅ `hackathons` - الهاكاثونات
- ✅ `participants` - المشاركين
- ✅ `teams` - الفرق
- ✅ `judges` - المحكمين
- ✅ `scores` - النقاط
- ✅ `evaluation_criteria` - معايير التقييم
- ✅ `email_templates` - قوالب الإيميل
- ✅ `global_settings` - الإعدادات العامة
- ✅ `hackathon_forms` - النماذج الديناميكية
- ✅ `hackathon_landing_pages` - صفحات الهبوط المخصصة

### المستخدم الافتراضي:
- ✅ Admin user مع جميع الصلاحيات

## 🎯 الخطوات التالية:

1. **تشغيل النظام**: استخدم `start-local.bat`
2. **تسجيل الدخول**: كـ admin
3. **إنشاء هاكاثون**: اختبار النظام
4. **إنشاء Landing Page**: اختبار النظام الجديد

## 🔧 إذا استمرت المشاكل:

### تحقق من:
1. **قاعدة البيانات**: هل ملف `dev.db` موجود؟
2. **الجداول**: شغل `node scripts/create-database-tables.js` مرة أخرى
3. **الخادم**: تأكد من تشغيل `npm run dev` بنجاح

### رسائل الخطأ الشائعة:
- `Table does not exist` → شغل `create-database-tables.js`
- `Environment variable not found` → استخدم `start-local.bat`
- `Connection refused` → تأكد من تشغيل الخادم

## 🎉 النتيجة:

**تم حل مشكلة الجداول المفقودة نهائياً!**

النظام الآن يعمل مع:
- ✅ قاعدة بيانات SQLite محلية
- ✅ جميع الجداول المطلوبة
- ✅ مستخدم admin افتراضي
- ✅ نظام Landing Pages كامل
- ✅ جميع المميزات تعمل بشكل صحيح

**🚀 جاهز للاستخدام!**
