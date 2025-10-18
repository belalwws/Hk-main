# 🛡️ دليل Migration الآمن - Form Scheduling Feature

## ⚠️ **تحذير مهم جداً**

**لا تستخدم أبداً `prisma db push` على Production Database!**

- ❌ `prisma db push` قد يحذف البيانات
- ❌ `prisma migrate dev` قد يسبب مشاكل في Production
- ✅ **استخدم فقط SQL Migration اليدوي الآمن**

---

## 📋 خطوات التطبيق الآمن

### 1️⃣ **قبل التطبيق - Backup**

```bash
# على Production Server
# احفظ نسخة احتياطية من Database
pg_dump $DATABASE_URL > backup_before_form_scheduling_$(date +%Y%m%d).sql

# أو استخدم Neon Dashboard لأخذ Snapshot
```

### 2️⃣ **التطبيق على Local أولاً (اختبار)**

```bash
# على جهازك المحلي
node scripts/safe-migrate-form-scheduling.js
```

**النتيجة المتوقعة:**
```
🚀 بدء Migration الآمن لإضافة Form Scheduling...

📡 التحقق من الاتصال بقاعدة البيانات...
✅ تم الاتصال بنجاح

📄 قراءة ملف Migration من: migrations/20251018_add_form_scheduling.sql
✅ تم قراءة ملف Migration

🔍 فحص البيانات الموجودة...
📊 عدد Hackathon Forms: 5
📊 عدد General Forms: 2
✅ البيانات آمنة - لن يتم حذف أي شيء

⚡ تطبيق Migration...
  📝 تنفيذ: ALTER TABLE "hackathon_forms" ADD COLUMN IF NOT...
✅ تم تطبيق Migration بنجاح

🔍 التحقق من إضافة الأعمدة...
📋 الأعمدة المضافة:
┌─────────┬─────────────┬──────────────┬──────────────┐
│ (index) │ column_name │  data_type   │ is_nullable  │
├─────────┼─────────────┼──────────────┼──────────────┤
│    0    │  'openAt'   │  'timestamp' │    'YES'     │
│    1    │  'closeAt'  │  'timestamp' │    'YES'     │
└─────────┴─────────────┴──────────────┴──────────────┘

🔍 التحقق من سلامة البيانات...
✅ جميع البيانات سليمة - لم يتم فقدان أي شيء!

✨ Migration اكتمل بنجاح!
```

### 3️⃣ **اختبار على Local**

```bash
# شغل المشروع واختبر الفيتشر
npm run dev

# اختبر:
# 1. إنشاء فورم جديد
# 2. ضبط Schedule للفورم
# 3. فتح الفورم كمستخدم عادي
# 4. تأكد من ظهور Countdown
# 5. تأكد من ظهور "الفورم مغلق"
```

### 4️⃣ **التطبيق على Production**

#### **الطريقة الأولى: عبر Node Script (موصى بها)**

```bash
# على Production Server
cd /path/to/project

# تأكد من وجود .env الصحيح
cat .env | grep DATABASE_URL

# شغل Migration الآمن
node scripts/safe-migrate-form-scheduling.js
```

#### **الطريقة الثانية: SQL مباشر (للمحترفين)**

```bash
# اتصل بـ Database
psql $DATABASE_URL

# نفذ SQL بنفسك
\i migrations/20251018_add_form_scheduling.sql

# تحقق من النتيجة
\d hackathon_forms
```

### 5️⃣ **بعد التطبيق - التحقق**

```bash
# شغل النظام
npm run build
npm start

# اختبر:
# ✅ لوحة Admin تعمل
# ✅ الفورمات موجودة
# ✅ يمكن ضبط Schedule
# ✅ Countdown يعمل
# ✅ رسالة "مغلق" تظهر
```

---

## 🔄 **Rollback في حالة المشاكل**

إذا حدثت أي مشكلة، يمكنك الرجوع بأمان:

```bash
# تطبيق Rollback
node scripts/rollback-form-scheduling.js

# أو يدوياً
psql $DATABASE_URL < migrations/20251018_rollback_form_scheduling.sql
```

---

## 📊 **ما الذي يضيفه Migration؟**

### في جدول `hackathon_forms`:
- ✅ `openAt` (TIMESTAMP nullable) - موعد فتح الفورم
- ✅ `closeAt` (TIMESTAMP nullable) - موعد إغلاق الفورم

### في جدول `forms`:
- ✅ `openAt` (TIMESTAMP nullable) - موعد فتح الفورم
- ✅ `closeAt` (TIMESTAMP nullable) - موعد إغلاق الفورم

**ملاحظة مهمة:**
- القيم `null` تعني أن الفورم مفتوح دائماً (السلوك الافتراضي)
- لن يتم تغيير أي فورمات موجودة

---

## 🎯 **الميزات الجديدة**

### 1. **Admin Panel**
- ضبط موعد فتح الفورم
- ضبط موعد إغلاق الفورم
- رؤية حالة الفورم (قادم / مفتوح / مغلق)

### 2. **User Experience**
- **قبل الموعد:** Countdown جميل مع الوقت المتبقي
- **أثناء الفترة:** الفورم يعمل عادي
- **بعد الانتهاء:** رسالة "الفورم مغلق" مع تاريخ الإغلاق

---

## 🚨 **تحذيرات الأمان**

### ❌ **لا تفعل أبداً:**
```bash
# على Production
prisma db push           # ❌ خطر!
prisma migrate dev       # ❌ خطر!
prisma migrate reset     # ❌ كارثة!
```

### ✅ **افعل دائماً:**
```bash
# استخدم Migration اليدوي
node scripts/safe-migrate-form-scheduling.js

# أو SQL مباشر
psql $DATABASE_URL < migrations/20251018_add_form_scheduling.sql
```

---

## 📞 **في حالة المشاكل**

1. **لا تحذف أي شيء!**
2. **راجع Logs:**
   ```bash
   tail -f /var/log/application.log
   ```
3. **تحقق من Database:**
   ```sql
   SELECT * FROM hackathon_forms LIMIT 1;
   SELECT * FROM forms LIMIT 1;
   ```
4. **Rollback إذا لزم الأمر**

---

## ✅ **Checklist قبل Production**

- [ ] أخذ Backup كامل من Database
- [ ] اختبار Migration على Local
- [ ] مراجعة SQL Script
- [ ] التأكد من عدم وجود users نشطين
- [ ] إخطار الفريق بالـ Downtime (إن وجد)
- [ ] تطبيق Migration
- [ ] التحقق من نجاح التطبيق
- [ ] اختبار الفورمات
- [ ] مراقبة الـ Logs لمدة ساعة

---

## 📚 **ملفات مهمة**

- `migrations/20251018_add_form_scheduling.sql` - Migration الأساسي
- `migrations/20251018_rollback_form_scheduling.sql` - Rollback
- `scripts/safe-migrate-form-scheduling.js` - سكريبت التطبيق الآمن
- `schema.prisma` - Schema محدّث

---

**تم التحديث:** 2025-10-18  
**الإصدار:** 1.0.0  
**الحالة:** جاهز للتطبيق ✅
