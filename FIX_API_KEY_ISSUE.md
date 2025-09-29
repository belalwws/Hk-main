# 🔧 حل مشكلة API Key - خطأ 401

## 🚨 المشكلة الحالية

عند الوصول إلى:
```
https://hackathon-platform-601l.onrender.com/api/external/v1
```

تحصل على:
```json
{
  "error": "HTTP 401: Invalid API key"
}
```

## 🔍 السبب

المتغير `EXTERNAL_API_KEY` غير مضبوط في Render Dashboard.

## ✅ الحل السريع

### 1. اذهب إلى Render Dashboard
```
https://dashboard.render.com
```

### 2. اختر الخدمة
- اختر `hackathon-platform-601l`

### 3. اذهب إلى Environment Variables
- اضغط على تبويب "Environment"

### 4. أضف المتغير المفقود
```
Key: EXTERNAL_API_KEY
Value: hk_4824b9a0dc9f16dad38c376134c7abe54b3e75cde5778af252c82583812e5f36
```

### 5. احفظ وأعد النشر
- اضغط "Save Changes"
- اضغط "Manual Deploy"

## 🧪 اختبار الإصلاح

### 1. فحص حالة API (بدون مفتاح)
```bash
curl "https://hackathon-platform-601l.onrender.com/api/external/v1/status"
```

**النتيجة المتوقعة:**
```json
{
  "configuration": {
    "apiKeyConfigured": true
  }
}
```

### 2. اختبار مع API Key
```bash
curl -H "X-API-Key: hk_4824b9a0dc9f16dad38c376134c7abe54b3e75cde5778af252c82583812e5f36" \
  "https://hackathon-platform-601l.onrender.com/api/external/v1/hackathons"
```

**النتيجة المتوقعة:**
```json
{
  "hackathons": [...],
  "pagination": {...}
}
```

## 🔍 تشخيص متقدم

تم إضافة endpoint جديد للتشخيص:
```
GET /api/external/v1/status
```

### بدون API Key:
```bash
curl "https://hackathon-platform-601l.onrender.com/api/external/v1/status"
```

### مع API Key:
```bash
curl -H "X-API-Key: hk_4824b9a0dc9f16dad38c376134c7abe54b3e75cde5778af252c82583812e5f36" \
  "https://hackathon-platform-601l.onrender.com/api/external/v1/status"
```

## 📋 قائمة التحقق

- [ ] إضافة `EXTERNAL_API_KEY` في Render
- [ ] إضافة `NEXTAUTH_SECRET` في Render (إذا لم يكن موجود)
- [ ] إعادة النشر
- [ ] اختبار `/status` endpoint
- [ ] اختبار `/hackathons` endpoint

## 🎯 النتيجة المتوقعة

بعد إضافة المتغير:

### ✅ يعمل:
```bash
curl -H "X-API-Key: hk_4824b9a0dc9f16dad38c376134c7abe54b3e75cde5778af252c82583812e5f36" \
  "https://hackathon-platform-601l.onrender.com/api/external/v1/hackathons"
```

### ❌ لا يعمل (كما هو مطلوب):
```bash
curl "https://hackathon-platform-601l.onrender.com/api/external/v1/hackathons"
# يجب أن يرجع 401: Invalid API key
```

## 🔗 Endpoints المتاحة

بعد الإصلاح:

### 1. فحص الحالة
```
GET /api/external/v1/status
```

### 2. جلب الهاكاثونات
```
GET /api/external/v1/hackathons
GET /api/external/v1/hackathons?status=open
```

### 3. جلب هاكاثون محدد
```
GET /api/external/v1/hackathons/{id}
```

### 4. التسجيل
```
POST /api/external/v1/hackathons/{id}/register
```

## 🚀 مثال على الاستخدام بعد الإصلاح

```javascript
const API_KEY = 'hk_4824b9a0dc9f16dad38c376134c7abe54b3e75cde5778af252c82583812e5f36';
const BASE_URL = 'https://hackathon-platform-601l.onrender.com/api/external/v1';

// فحص حالة API
const status = await fetch(`${BASE_URL}/status`, {
  headers: { 'X-API-Key': API_KEY }
});

// جلب الهاكاثونات
const hackathons = await fetch(`${BASE_URL}/hackathons`, {
  headers: { 'X-API-Key': API_KEY }
});

// التسجيل
const registration = await fetch(`${BASE_URL}/hackathons/{id}/register`, {
  method: 'POST',
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '+966501234567'
  })
});
```

---

**🔧 أضف `EXTERNAL_API_KEY` في Render وسيعمل كل شيء!**
