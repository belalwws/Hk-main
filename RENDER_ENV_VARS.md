# 🔧 متغيرات البيئة المطلوبة في Render

## ⚠️ متغيرات مفقودة في النشر الحالي

حسب logs النشر، هذه المتغيرات مفقودة:

### 1. EXTERNAL_API_KEY (مطلوب)
```
EXTERNAL_API_KEY=hk_4824b9a0dc9f16dad38c376134c7abe54b3e75cde5778af252c82583812e5f36
```

### 2. NEXTAUTH_SECRET (مطلوب)
```
NEXTAUTH_SECRET=your-nextauth-secret-here-make-it-long-and-random
```

## ✅ متغيرات موجودة

هذه المتغيرات موجودة بالفعل:
- ✅ DATABASE_URL (تم إنشاؤها تلقائياً بواسطة Render)
- ✅ JWT_SECRET
- ✅ NEXTAUTH_URL

## 🚀 خطوات إضافة المتغيرات

### 1. اذهب إلى Render Dashboard
```
https://dashboard.render.com
```

### 2. اختر الخدمة
- اختر `hackathon-platform-601l`

### 3. اذهب إلى Environment
- اضغط على تبويب "Environment"

### 4. أضف المتغيرات المفقودة

#### EXTERNAL_API_KEY:
```
Key: EXTERNAL_API_KEY
Value: hk_4824b9a0dc9f16dad38c376134c7abe54b3e75cde5778af252c82583812e5f36
```

#### NEXTAUTH_SECRET:
```
Key: NEXTAUTH_SECRET
Value: your-super-secret-nextauth-key-make-it-long-and-random-at-least-32-chars
```

### 5. احفظ التغييرات
- اضغط "Save Changes"

### 6. أعد النشر
- اضغط "Manual Deploy" أو انتظر النشر التلقائي

## 🔑 توليد NEXTAUTH_SECRET

يمكنك توليد مفتاح آمن باستخدام:

### في Terminal:
```bash
openssl rand -base64 32
```

### أو في Node.js:
```javascript
require('crypto').randomBytes(32).toString('base64')
```

### أو استخدم هذا المفتاح الجاهز:
```
nextauth_secret_2024_hackathon_platform_secure_key_random_string_32_chars_min
```

## 📋 قائمة كاملة بجميع المتغيرات

### مطلوبة (Essential):
```
DATABASE_URL=(تلقائي من Render)
JWT_SECRET=(موجود)
EXTERNAL_API_KEY=hk_4824b9a0dc9f16dad38c376134c7abe54b3e75cde5778af252c82583812e5f36
NEXTAUTH_URL=https://hackathon-platform-601l.onrender.com
NEXTAUTH_SECRET=nextauth_secret_2024_hackathon_platform_secure_key_random_string_32_chars_min
```

### اختيارية (Optional):
```
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
MAIL_FROM=your-email@gmail.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production
```

## ✅ بعد إضافة المتغيرات

### 1. تحقق من النشر
- راقب logs النشر في Render
- تأكد من عدم وجود أخطاء

### 2. اختبر External API
```bash
curl -H "X-API-Key: hk_4824b9a0dc9f16dad38c376134c7abe54b3e75cde5778af252c82583812e5f36" \
  "https://hackathon-platform-601l.onrender.com/api/external/v1/hackathons"
```

### 3. تحقق من الموقع الرئيسي
```
https://hackathon-platform-601l.onrender.com
```

## 🎯 النتيجة المتوقعة

بعد إضافة المتغيرات المفقودة:
- ✅ النشر سينجح بدون أخطاء
- ✅ External API سيعمل بشكل كامل
- ✅ المواقع الخارجية ستتمكن من التكامل
- ✅ التسجيل من المواقع الخارجية سيعمل

---

**🚀 أضف المتغيرين المفقودين وسيعمل كل شيء بشكل مثالي!**
