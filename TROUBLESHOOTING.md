# 🔧 حل مشاكل النشر على Render

## 🚨 المشاكل الشائعة وحلولها

### 1️⃣ خطأ 500 في التسجيل `/api/auth/register`

#### الأسباب المحتملة:
- قاعدة البيانات غير مربوطة بشكل صحيح
- لم يتم تشغيل المايجريشن
- مشكلة في متغيرات البيئة

#### الحل:

**أ. التحقق من قاعدة البيانات:**
1. اذهب إلى Render Dashboard
2. اضغط على `hackathon-db`
3. انسخ `External Database URL`
4. في Web Service → Environment:
   - `DATABASE_URL` = External Database URL

**ب. تشغيل المايجريشن:**
```bash
# في Render Console أو Manual Deploy
npm run deploy:db
```

**ج. التحقق من متغيرات البيئة:**
```env
NODE_ENV=production
DATABASE_URL=[External Database URL من قاعدة البيانات]
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NEXTAUTH_SECRET=another-super-secret-key-minimum-32-characters
NEXTAUTH_URL=https://hackathon-platform-601l.onrender.com
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-gmail-app-password
MAIL_FROM=your-email@gmail.com
```

### 2️⃣ مشكلة اتصال قاعدة البيانات

#### الأعراض:
- خطأ "تعذر تهيئة قاعدة البيانات"
- Connection timeout

#### الحل:
1. **تأكد من استخدام External Database URL** (ليس Internal)
2. **تحقق من صحة URL**:
   ```
   postgresql://username:password@hostname:port/database
   ```
3. **إعادة تشغيل Web Service**

### 3️⃣ مشكلة الإيميلات

#### الأعراض:
- التسجيل يعمل لكن لا تصل إيميلات
- خطأ في إرسال الإيميل

#### الحل:
1. **إعداد Gmail App Password**:
   - اذهب إلى [Google Account](https://myaccount.google.com)
   - فعل 2-Factor Authentication
   - اذهب إلى "App passwords"
   - أنشئ App Password جديد
   - استخدمه في `GMAIL_PASS`

2. **التحقق من متغيرات الإيميل**:
   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASS=your-16-character-app-password
   MAIL_FROM=your-email@gmail.com
   ```

### 4️⃣ مشكلة البناء (Build Errors)

#### الأعراض:
- فشل في البناء
- TypeScript errors

#### الحل:
```bash
# تنظيف وإعادة البناء
rm -rf .next
npm run build
```

### 5️⃣ مشكلة تسجيل الدخول للأدمن

#### الحل:
```bash
# إنشاء حساب أدمن جديد
npm run db:seed-admin
```

**بيانات الأدمن الافتراضية:**
- Email: `admin@hackathon.com`
- Password: `admin123456`

## 🔍 فحص الأخطاء

### 1. فحص اللوجز:
- اذهب إلى Render Dashboard
- Web Service → Logs
- ابحث عن رسائل الخطأ

### 2. اختبار قاعدة البيانات:
```bash
# اختبار الاتصال
npx prisma db pull --schema ./schema.prisma
```

### 3. اختبار API:
```bash
# اختبار endpoint
curl -X POST https://hackathon-platform-601l.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'
```

## 📞 الحصول على المساعدة

### خطوات التشخيص:
1. **تحقق من اللوجز** في Render
2. **تأكد من متغيرات البيئة**
3. **اختبر قاعدة البيانات**
4. **تحقق من الإيميلات**

### معلومات مفيدة للدعم:
- رابط التطبيق: `https://hackathon-platform-601l.onrender.com`
- اسم قاعدة البيانات: `hackathon-db`
- رسائل الخطأ من اللوجز
- متغيرات البيئة المستخدمة (بدون كلمات المرور)

## ✅ قائمة التحقق النهائية

- [ ] قاعدة البيانات مربوطة ومتاحة
- [ ] تم تشغيل المايجريشن
- [ ] متغيرات البيئة صحيحة
- [ ] تم إنشاء حساب الأدمن
- [ ] الإيميلات تعمل
- [ ] التسجيل يعمل
- [ ] تسجيل الدخول يعمل

---

**💡 نصيحة**: احتفظ بنسخة احتياطية من متغيرات البيئة في مكان آمن!
