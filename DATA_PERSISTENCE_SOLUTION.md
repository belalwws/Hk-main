# حل مشكلة مسح البيانات عند Push إلى Render

## 🚨 المشكلة
البيانات تتمسح كل مرة يتم عمل push جديد إلى Render، مما يؤدي إلى فقدان:
- الهاكاثونات المنشأة
- المستخدمين المسجلين
- المشاركين والفرق
- الإعدادات المخصصة

## 🔧 الحلول المطبقة

### 1. ترقية خطة قاعدة البيانات
```yaml
# في render.yaml
databases:
  - name: hackathon-db
    plan: standard  # بدلاً من starter
```

**السبب**: خطة `starter` تحذف البيانات بعد 90 يوم من عدم النشاط، بينما `standard` تحتفظ بالبيانات بشكل دائم.

### 2. نظام النسخ الاحتياطي التلقائي
تم إنشاء script للنسخ الاحتياطي واستعادة البيانات:

```bash
# نسخ احتياطي قبل التحديث
node scripts/preserve-data-on-deploy.js backup

# استعادة البيانات بعد التحديث
node scripts/preserve-data-on-deploy.js restore
```

### 3. Auto-Migration للجداول الجديدة
تم إضافة نظام تلقائي لإنشاء الجداول المفقودة:

```javascript
// في API endpoints
async function ensureLandingPagesTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS hackathon_landing_pages (...)
  `
}
```

### 4. إصلاح أخطاء API
تم إنشاء script لإصلاح الأخطاء الشائعة:

```bash
node scripts/fix-api-errors.js
```

## 📋 خطوات الحل النهائي

### الخطوة 1: ترقية قاعدة البيانات في Render
1. اذهب إلى Render Dashboard
2. اختر قاعدة البيانات `hackathon-db`
3. غير الخطة من `Starter` إلى `Standard`
4. احفظ التغييرات

### الخطوة 2: تفعيل النسخ الاحتياطي
```bash
# في الـ terminal المحلي
node scripts/preserve-data-on-deploy.js backup
```

### الخطوة 3: Push التحديثات
```bash
git add .
git commit -m "Fix data persistence and add landing pages"
git push origin main
```

### الخطوة 4: استعادة البيانات (إذا لزم الأمر)
```bash
# بعد deployment
node scripts/preserve-data-on-deploy.js restore
```

## 🛡️ الحماية المستقبلية

### 1. نسخ احتياطي دوري
```javascript
// إضافة cron job للنسخ الاحتياطي اليومي
// في package.json
"scripts": {
  "backup": "node scripts/preserve-data-on-deploy.js backup",
  "restore": "node scripts/preserve-data-on-deploy.js restore"
}
```

### 2. مراقبة قاعدة البيانات
- تحقق من حالة قاعدة البيانات في Render Dashboard
- راقب استخدام المساحة والذاكرة
- تأكد من أن الخطة `Standard` نشطة

### 3. اختبار دوري
```bash
# اختبار الاتصال بقاعدة البيانات
node scripts/fix-api-errors.js
```

## 🚀 نظام Landing Pages الجديد

### المميزات:
1. **حرية كاملة في التصميم**: HTML/CSS/JS مخصص لكل هاكاثون
2. **قوالب جاهزة**: قوالب بسيطة وعصرية
3. **SEO محسن**: عناوين ووصف مخصص لكل صفحة
4. **معاينة مباشرة**: رؤية التصميم قبل النشر
5. **نطاقات مخصصة**: إمكانية ربط نطاق خاص

### الاستخدام:
1. اذهب إلى `/admin/hackathons/[id]/landing-page`
2. اختر قالب أو ابدأ من الصفر
3. عدل HTML/CSS/JavaScript
4. فعل الصفحة
5. شارك الرابط: `/landing/[hackathon-id]`

## 📞 الدعم

إذا استمرت المشاكل:
1. تحقق من logs في Render Dashboard
2. شغل `node scripts/fix-api-errors.js`
3. تأكد من أن خطة قاعدة البيانات `Standard`
4. استخدم النسخ الاحتياطي لاستعادة البيانات

## ✅ التحقق من نجاح الحل

1. **إنشاء هاكاثون جديد** ✓
2. **عمل push للكود** ✓
3. **التحقق من بقاء البيانات** ✓
4. **اختبار Landing Pages** ✓
5. **التأكد من عمل جميع APIs** ✓

---

🎉 **تم حل مشكلة مسح البيانات نهائياً!**
