# Supervisor Management Scripts

هذه الـ scripts تساعدك في إدارة وإصلاح مشاكل المشرفين في النظام.

## Scripts المتاحة

### 1. check-supervisors.js
**الوظيفة:** فحص حالة المشرفين في قاعدة البيانات

**الاستخدام:**
```bash
node scripts/check-supervisors.js
```

**ماذا يفعل:**
- يعرض جميع المستخدمين بـ role "supervisor"
- يعرض جميع سجلات المشرفين (supervisor records)
- يكتشف أي تناقضات (users بـ role supervisor بدون supervisor record)
- يعرض الدعوات المعلقة والمقبولة

**متى تستخدمه:**
- للتحقق من حالة المشرفين
- لاكتشاف أي مشاكل في البيانات
- قبل وبعد تشغيل fix script

---

### 2. fix-supervisor-roles.js
**الوظيفة:** إصلاح roles المشرفين تلقائياً

**الاستخدام:**
```bash
node scripts/fix-supervisor-roles.js
```

**ماذا يفعل:**
- يجد جميع المستخدمين الذين لديهم supervisor record لكن role خطأ
- يحدث role-هم إلى "supervisor"
- يتحقق من الدعوات المقبولة ويتأكد من وجود supervisor records
- ينشئ supervisor records للمستخدمين الذين قبلوا دعوات لكن ليس لديهم records

**متى تستخدمه:**
- بعد اكتشاف مشاكل في roles المشرفين
- بعد migration أو تحديث كبير
- إذا كان المشرفون لا يستطيعون تسجيل الدخول بشكل صحيح

---

## سيناريوهات الاستخدام

### السيناريو 1: مشرف لا يستطيع تسجيل الدخول
```bash
# 1. تحقق من حالة المشرف
node scripts/check-supervisors.js

# 2. إذا وجدت مشكلة في role، قم بالإصلاح
node scripts/fix-supervisor-roles.js

# 3. تحقق مرة أخرى
node scripts/check-supervisors.js
```

### السيناريو 2: مشرف قبل الدعوة لكن لا يظهر في النظام
```bash
# 1. تحقق من الدعوات المقبولة
node scripts/check-supervisors.js

# 2. قم بالإصلاح (سينشئ supervisor record إذا لزم الأمر)
node scripts/fix-supervisor-roles.js
```

### السيناريو 3: فحص دوري للنظام
```bash
# قم بتشغيل check script بشكل دوري
node scripts/check-supervisors.js
```

---

## الإخراج المتوقع

### check-supervisors.js
```
🔍 Checking supervisors in database...

📊 Found 2 users with supervisor role:

1. أحمد محمد
   Email: ahmed@example.com
   ID: clxxx123
   Active: ✅
   Created: 2024-01-15T10:00:00.000Z

2. فاطمة علي
   Email: fatima@example.com
   ID: clxxx456
   Active: ✅
   Created: 2024-01-20T14:30:00.000Z


🔍 Checking supervisor records...

📊 Found 2 supervisor records:

1. أحمد محمد
   Email: ahmed@example.com
   User Role: supervisor
   Supervisor ID: clyyy123
   Department: التقنية
   Hackathon: هاكاثون الابتكار
   Active: ✅
   User Active: ✅
   Created: 2024-01-15T10:00:00.000Z

...

✅ All supervisor users have supervisor records
✅ All supervisor records have correct user roles

✅ Check complete!
```

### fix-supervisor-roles.js
```
🔧 Starting supervisor role fix...

📊 Found 3 supervisor records

⚠️  Found 1 supervisors with wrong role:

1. محمد خالد (mohamed@example.com)
   Current role: participant
   Should be: supervisor
   Supervisor ID: clzzz789
   Active: ✅

🔄 Fixing roles...

✅ Fixed: محمد خالد (mohamed@example.com)


📊 Summary:
   Total supervisors: 3
   Needed fixing: 1
   Successfully fixed: 1
   Errors: 0

✅ Fix complete!
```

---

## استكشاف الأخطاء

### خطأ: "Cannot find module '@prisma/client'"
```bash
# قم بتثبيت dependencies
npm install
```

### خطأ: "Database connection failed"
```bash
# تحقق من DATABASE_URL في .env
# تأكد من أن قاعدة البيانات تعمل
```

### خطأ: "Table 'supervisors' doesn't exist"
```bash
# قم بتشغيل migrations
npx prisma migrate deploy
```

---

## ملاحظات مهمة

1. **Backup**: دائماً قم بعمل backup لقاعدة البيانات قبل تشغيل fix scripts
2. **Production**: كن حذراً عند تشغيل scripts على production
3. **Testing**: اختبر scripts على development environment أولاً
4. **Logs**: احفظ output الـ scripts للرجوع إليها لاحقاً

---

## الأسئلة الشائعة

### س: هل يمكنني تشغيل fix script عدة مرات؟
ج: نعم، الـ script آمن للتشغيل عدة مرات. سيتحقق من الحالة الحالية ويصلح فقط ما يحتاج إصلاح.

### س: ماذا لو كان المشرف لديه role صحيح لكن لا يستطيع تسجيل الدخول؟
ج: تحقق من:
1. كلمة المرور صحيحة
2. الحساب نشط (isActive = true)
3. الـ auth token يتم حفظه بشكل صحيح
4. الـ middleware يسمح بالوصول

### س: كيف أضيف مشرف جديد يدوياً؟
ج: استخدم نظام الدعوات من `/admin/supervisors` - لا تضف يدوياً في قاعدة البيانات.

---

## الدعم

إذا واجهت أي مشاكل:
1. شغل `check-supervisors.js` واحفظ الـ output
2. تحقق من logs في console
3. تحقق من قاعدة البيانات مباشرة
4. راجع `SUPERVISOR_FIX_SUMMARY.md` للمزيد من التفاصيل

