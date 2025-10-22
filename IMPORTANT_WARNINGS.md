# ⚠️ تحذيرات وملاحظات مهمة جداً

**تاريخ:** 2025-10-21  
**الأولوية:** 🔴 حرجة

---

## 🔴 قاعدة البيانات - CRITICAL

### ⚠️ قاعدة البيانات Production على Neon

```
DATABASE_URL="postgresql://neondb_owner:npg_E3IRPasX9qFw@ep-icy-cloud-agh12oz7-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

### 🚨 تحذيرات حرجة:

1. **لا تحذف البيانات أبداً بدون نسخ احتياطي**
   ```bash
   # قبل أي عملية خطرة، قم بعمل backup
   node scripts/backup-database.js
   ```

2. **لا تقم بتشغيل migrations مباشرة على Production**
   ```bash
   # ❌ خطر - لا تفعل هذا
   npx prisma migrate dev
   
   # ✅ آمن - استخدم هذا
   npx prisma migrate deploy
   ```

3. **لا تستخدم `prisma db push` على Production**
   ```bash
   # ❌ خطر جداً - قد يحذف البيانات
   npx prisma db push --force-reset
   
   # ✅ آمن - استخدم migrations
   npx prisma migrate deploy
   ```

4. **تحقق من الـ migrations قبل التطبيق**
   ```bash
   # اختبر على قاعدة بيانات محلية أولاً
   # ثم راجع ملفات SQL في /migrations
   # ثم طبق على production
   ```

---

## 🔴 البيانات الحالية

### البيانات الموجودة (لا تحذف):

#### المستخدمون
- ✅ Admins: متعدد
- ✅ Supervisors: متعدد  
- ✅ Judges: 1+
- ✅ Participants: متعدد

#### الهاكاثونات
- ✅ 3 هاكاثونات نشطة
- ✅ فرق مسجلة
- ✅ مشاركين

#### الدعوات والطلبات
- ✅ Expert Invitations: 5
- ✅ Expert Applications: 3
- ✅ Judge Invitations: 5
- ✅ Judge Applications: 5

### 🚨 أي حذف لهذه البيانات سيؤثر على المستخدمين الحقيقيين!

---

## 🔴 Cloudinary - التخزين السحابي

### ⚠️ الإعدادات الحالية:

```env
CLOUDINARY_CLOUD_NAME="djva3nfy5"
CLOUDINARY_API_KEY="394131696964267"
CLOUDINARY_API_SECRET="ml5Z8tWrCNr1tDVjXIEw_Dp2GZE"
```

### 🚨 تحذيرات:

1. **لا تحذف الملفات من Cloudinary مباشرة**
   - الملفات مرتبطة بقاعدة البيانات
   - حذفها سيكسر الروابط في الإيميلات والشهادات

2. **راقب حدود التخزين**
   - Free tier: 25 GB storage
   - تحقق من الاستخدام بانتظام

3. **الملفات القديمة (قبل التحديث الأخير)**
   - قد تكون private
   - تحتاج إعادة رفع لتصبح public

---

## 🔴 Gmail - البريد الإلكتروني

### ⚠️ الإعدادات الحالية:

```env
GMAIL_USER="racein668@gmail.com"
GMAIL_PASS="xquiynevjqfbyoxp"  # App Password
```

### 🚨 تحذيرات:

1. **حدود Gmail**
   - 500 إيميل/يوم (Gmail free)
   - 2000 إيميل/يوم (Google Workspace)
   - Rate limiting: 1 إيميل كل 2 ثانية

2. **App Password**
   - لا تشارك هذا الـ password
   - إذا تم تسريبه، قم بإلغائه فوراً من Google Account

3. **Spam Prevention**
   - لا ترسل إيميلات جماعية كبيرة دفعة واحدة
   - استخدم delays بين الإيميلات

---

## 🔴 Digital Ocean - الاستضافة

### ⚠️ الإعدادات الحالية:

```
URL: https://clownfish-app-px9sc.ondigitalocean.app
Region: NYC
Plan: Basic
```

### 🚨 تحذيرات:

1. **Auto-Deploy**
   - كل push على GitHub يؤدي لـ deploy تلقائي
   - تأكد من اختبار الكود محلياً قبل push

2. **Environment Variables**
   - لا تحذف المتغيرات البيئية من Dashboard
   - أي تغيير يتطلب rebuild

3. **Logs**
   - راجع الـ logs بانتظام
   - ابحث عن errors و warnings

---

## 🔴 Authentication & Security

### ⚠️ JWT Secret:

```env
JWT_SECRET="3e17fd7f18567cc7b5c98a57e8cf4cf441df8fa2564bb4fa27b2b4a741a55144ad8801936b0a35a603929743eb4879d08fcaf78bed6440c75431756b4255c00f4"
```

### 🚨 تحذيرات:

1. **لا تغير JWT_SECRET في production**
   - سيؤدي لتسجيل خروج جميع المستخدمين
   - جميع الـ tokens ستصبح غير صالحة

2. **لا تشارك الـ secrets**
   - JWT_SECRET
   - NEXTAUTH_SECRET
   - Database credentials
   - API keys

3. **Passwords**
   - جميع كلمات المرور مشفرة (bcrypt)
   - لا يمكن استرجاعها - فقط reset

---

## 🔴 Code Changes - تعديلات الكود

### ⚠️ ملفات حساسة - لا تعدل بدون فهم:

1. **middleware.ts**
   - يتحكم في الصلاحيات
   - أي خطأ قد يمنع الوصول للنظام

2. **lib/prisma.ts**
   - اتصال قاعدة البيانات
   - أي خطأ قد يعطل النظام بالكامل

3. **lib/auth.ts**
   - نظام المصادقة
   - أي خطأ قد يسمح بوصول غير مصرح

4. **schema.prisma**
   - بنية قاعدة البيانات
   - أي تعديل يتطلب migration

---

## 🔴 Scripts - السكريبتات

### ⚠️ سكريبتات خطرة:

```bash
# ❌ خطر - قد يحذف البيانات
scripts/fix-database-url.js
scripts/rollback-form-scheduling.js

# ⚠️ حذر - يعدل البيانات
scripts/fix-duplicate-user.js
scripts/fix-supervisor-roles.js

# ✅ آمن - للقراءة فقط
scripts/check-supervisor-data.ts
scripts/test-db-connection.js
scripts/backup-database.js
```

### 🚨 قبل تشغيل أي script:

1. اقرأ الكود أولاً
2. افهم ماذا يفعل
3. اعمل backup
4. اختبر على بيانات تجريبية
5. ثم شغله على production

---

## 🔴 Deployment - النشر

### ⚠️ خطوات آمنة للنشر:

```bash
# 1. اختبر محلياً
npm run dev
# تأكد أن كل شيء يعمل

# 2. اعمل build محلي
npm run build
# تأكد من عدم وجود errors

# 3. commit & push
git add .
git commit -m "description"
git push origin اخير

# 4. راقب الـ deployment على Digital Ocean
# تحقق من logs
# اختبر الموقع بعد الـ deploy
```

### 🚨 إذا فشل الـ deployment:

1. لا تعمل force push
2. راجع الـ logs
3. اصلح المشكلة
4. اعمل commit جديد
5. push مرة أخرى

---

## 🔴 Files & Uploads

### ⚠️ حدود الملفات:

```javascript
// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Allowed formats
const ALLOWED_FORMATS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]
```

### 🚨 تحذيرات:

1. **لا ترفع ملفات كبيرة جداً**
   - قد تفشل
   - قد تستهلك bandwidth

2. **تحقق من نوع الملف**
   - لا تسمح بملفات executable
   - فقط الأنواع المسموحة

---

## 🔴 Email Templates

### ⚠️ المتغيرات الديناميكية:

```
{{name}}
{{email}}
{{hackathonTitle}}
{{teamName}}
{{invitationLink}}
```

### 🚨 تحذيرات:

1. **لا تحذف المتغيرات من القوالب**
   - قد تكسر الإيميلات

2. **اختبر القوالب قبل الإرسال الجماعي**
   - أرسل لنفسك أولاً
   - تحقق من المرفقات

---

## 🔴 Monitoring - المراقبة

### ⚠️ ما يجب مراقبته:

1. **Digital Ocean Logs**
   - Errors
   - Warnings
   - Performance issues

2. **Database**
   - Connection count
   - Query performance
   - Storage usage

3. **Cloudinary**
   - Storage usage
   - Bandwidth
   - Transformations

4. **Gmail**
   - Daily quota
   - Bounce rate
   - Spam reports

---

## 🔴 Backup Strategy

### ⚠️ استراتيجية النسخ الاحتياطي:

```bash
# يومياً (موصى به)
node scripts/backup-database.js

# قبل أي تعديل كبير
node scripts/backup-database.js

# قبل migrations
node scripts/backup-database.js
```

### 🚨 مكان حفظ الـ backups:

```
/data/backups/
├── backup-2025-01-01T00-00-00.json
├── backup-2025-01-02T00-00-00.json
└── ...
```

### احتفظ بـ backups لمدة 30 يوم على الأقل

---

## 🔴 Emergency Contacts

### في حالة الطوارئ:

1. **Database Issues**
   - تحقق من Neon Dashboard
   - راجع connection string
   - تحقق من الـ logs

2. **Deployment Issues**
   - راجع Digital Ocean logs
   - تحقق من build errors
   - rollback إذا لزم الأمر

3. **Email Issues**
   - تحقق من Gmail quota
   - راجع SMTP settings
   - تحقق من الـ logs

---

## ✅ Checklist قبل أي عملية خطرة:

- [ ] قرأت الكود وفهمته
- [ ] عملت backup لقاعدة البيانات
- [ ] اختبرت محلياً
- [ ] راجعت الـ logs
- [ ] أعلمت الفريق
- [ ] جهزت خطة rollback
- [ ] تأكدت من وقت التنفيذ (خارج ساعات الذروة)

---

**تذكر: الحذر واجب، البيانات ثمينة، والمستخدمون يعتمدون على النظام!**

🔴 **في حالة الشك، لا تفعل! اسأل أولاً!** 🔴

