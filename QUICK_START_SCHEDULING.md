# 🚀 Quick Start - Form Scheduling

## ✅ تم بنجاح على Local!

Migration تم تطبيقه بأمان على قاعدة البيانات المحلية:
- ✅ 3 Hackathon Forms موجودة وسليمة
- ✅ تم إضافة حقول `openAt` و `closeAt`
- ✅ لم يتم فقدان أي بيانات

---

## 📋 كيفية الاستخدام

### 1️⃣ **في Admin Panel**

#### أ. للفورم العام:
```
1. اذهب إلى: /admin/forms
2. اختر الفورم المطلوب
3. اضغط "⏰ ضبط المواعيد"
4. حدد:
   - تاريخ الفتح (اختياري)
   - تاريخ الإغلاق (اختياري)
5. احفظ
```

#### ب. لفورم تسجيل الهاكاثون:
```
1. اذهب إلى: /admin/hackathons/[id]/registration-form
2. اضغط "⏰ ضبط المواعيد" من أعلى الصفحة
3. حدد التواريخ
4. احفظ
```

### 2️⃣ **تجربة المستخدم**

#### حالة 1: قبل موعد الفتح
```
الفورم يعرض:
┌─────────────────────────────────┐
│  ⏰ الفورم سيفتح قريباً         │
│                                 │
│  📅 يفتح في: 2025-10-20         │
│                                 │
│  ⏱️  العد التنازلي:             │
│     2 يوم، 5 ساعات، 30 دقيقة   │
│                                 │
│  [تحديث تلقائي كل ثانية]        │
└─────────────────────────────────┘
```

#### حالة 2: الفورم مفتوح
```
الفورم يعمل عادي مع ملاحظة:
"⏰ الفورم مفتوح حتى: 2025-10-25 11:59 م"
```

#### حالة 3: بعد موعد الإغلاق
```
الفورم يعرض:
┌─────────────────────────────────┐
│  🔒 عذراً، الفورم مغلق          │
│                                 │
│  انتهى استقبال الطلبات في:     │
│  2025-10-25 11:59 م            │
│                                 │
│  شكراً لاهتمامك                │
└─────────────────────────────────┘
```

---

## 🧪 الاختبار

### اختبار سريع:
```bash
# 1. شغل المشروع
npm run dev

# 2. افتح Admin Panel
http://localhost:3000/admin/forms

# 3. اختر فورم واضبط موعده
- الفتح: الآن + 5 دقائق
- الإغلاق: الآن + 10 دقائق

# 4. افتح الفورم كمستخدم عادي
http://localhost:3000/forms/[id]

# 5. ستشاهد Countdown!
```

### اختبار ملف HTML:
```bash
# افتح الملف في المتصفح
open test-form-scheduling.html
```

---

## 🚀 التطبيق على Production

### الخطوات:
```bash
# 1. اتصل بـ Production Server
ssh your-server

# 2. اذهب للمشروع
cd /path/to/project

# 3. سحب التحديثات
git pull origin اخير

# 4. نفذ Migration الآمن
node scripts/safe-migrate-form-scheduling.js

# 5. أعد بناء المشروع
npm run build

# 6. أعد تشغيل
pm2 restart all
# أو
systemctl restart your-app
```

### التحقق:
```bash
# تأكد من نجاح Migration
psql $DATABASE_URL -c "
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'hackathon_forms' 
    AND column_name IN ('openAt', 'closeAt');
"
```

---

## ⚙️ إعدادات متقدمة

### مثال: فتح الفورم لمدة أسبوع
```javascript
{
  openAt: new Date('2025-10-20T00:00:00'),
  closeAt: new Date('2025-10-27T23:59:59')
}
```

### مثال: فتح فوري مع موعد إغلاق
```javascript
{
  openAt: null,  // مفتوح الآن
  closeAt: new Date('2025-10-30T23:59:59')
}
```

### مثال: جدولة مستقبلية بدون إغلاق
```javascript
{
  openAt: new Date('2025-11-01T00:00:00'),
  closeAt: null  // لا يغلق
}
```

---

## 🔧 API Endpoints

### جلب حالة الفورم
```javascript
GET /api/forms/[id]
GET /api/hackathons/[id]/register-form

Response:
{
  form: { ... },
  openAt: "2025-10-20T00:00:00Z",
  closeAt: "2025-10-27T23:59:59Z",
  status: "scheduled" | "open" | "closed"
}
```

### ضبط Schedule (Admin فقط)
```javascript
POST /api/admin/forms/[id]/schedule

Body:
{
  openAt: "2025-10-20T00:00:00Z",
  closeAt: "2025-10-27T23:59:59Z"
}
```

---

## 🎨 تخصيص UI

### تغيير ألوان Countdown:
```typescript
// components/FormCountdown.tsx
<div className="bg-gradient-to-br from-blue-500 to-purple-600">
  // غير الألوان هنا
</div>
```

### تغيير رسالة "مغلق":
```typescript
// components/FormClosed.tsx
<h2>رسالتك المخصصة</h2>
```

---

## 📊 مراقبة الأداء

### عدد الفورمات المجدولة:
```sql
SELECT COUNT(*) 
FROM hackathon_forms 
WHERE "openAt" IS NOT NULL OR "closeAt" IS NOT NULL;
```

### الفورمات المفتوحة حالياً:
```sql
SELECT title, "openAt", "closeAt"
FROM hackathon_forms
WHERE (
  "openAt" IS NULL OR "openAt" <= NOW()
) AND (
  "closeAt" IS NULL OR "closeAt" > NOW()
);
```

---

## ❓ أسئلة شائعة

### س: ماذا لو تركت الحقول فارغة؟
**ج:** الفورم يكون مفتوح دائماً (السلوك الافتراضي)

### س: هل يمكن تغيير المواعيد بعد الجدولة؟
**ج:** نعم، يمكنك تعديلها في أي وقت من Admin Panel

### س: ماذا لو كان الفورم مفتوح ومستخدم في منتصف التعبئة؟
**ج:** سيظهر له تنبيه وقت الإرسال أن الفورم أغلق

### س: هل يؤثر على الفورمات الموجودة؟
**ج:** لا، كل الفورمات القديمة تبقى مفتوحة (null = مفتوح)

---

## 🆘 المساعدة

### في حال المشاكل:
1. راجع Logs: `tail -f logs/app.log`
2. تحقق من Database: `\d hackathon_forms`
3. Rollback إذا لزم: `node scripts/rollback-form-scheduling.js`

### للدعم:
- 📖 راجع: `SAFE_MIGRATION_GUIDE.md`
- 📖 راجع: `FORM_SCHEDULING_FEATURE.md`

---

**آخر تحديث:** 2025-10-18  
**الحالة:** ✅ جاهز للاستخدام
