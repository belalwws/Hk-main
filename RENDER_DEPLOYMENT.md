# نشر External API على Render

## 🚀 خطوات النشر

### 1. رفع الكود إلى GitHub

```bash
git add .
git commit -m "feat: Add External API for hackathon registration

- Add External API endpoints for hackathon management
- Implement API key authentication
- Add CORS support for external websites
- Create comprehensive documentation
- Clean up project files
- Add registration endpoints for external integration"

git push origin main
```

### 2. إعداد متغيرات البيئة في Render

اذهب إلى Render Dashboard وأضف المتغيرات التالية:

#### متغيرات إجبارية:
```
DATABASE_URL=postgresql://... (يتم إنشاؤها تلقائياً بواسطة Render)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
EXTERNAL_API_KEY=hk_4824b9a0dc9f16dad38c376134c7abe54b3e75cde5778af252c82583812e5f36
NEXTAUTH_URL=https://hackathon-platform-601l.onrender.com
NEXTAUTH_SECRET=your-nextauth-secret-here
```

#### متغيرات اختيارية:
```
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
MAIL_FROM=your-email@gmail.com
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://hackathon-platform-601l.onrender.com
```

### 3. النشر على Render

1. اذهب إلى [Render Dashboard](https://dashboard.render.com)
2. اختر الخدمة الموجودة: `hackathon-platform-601l`
3. اضغط على "Manual Deploy" أو انتظر النشر التلقائي
4. راقب logs النشر

### 4. التحقق من النشر

بعد اكتمال النشر، تحقق من:

#### أ. الموقع الرئيسي:
```
https://hackathon-platform-601l.onrender.com
```

#### ب. External API:
```
https://hackathon-platform-601l.onrender.com/api/external/v1/hackathons
```

#### ج. اختبار API Key:
```bash
curl -H "X-API-Key: hk_4824b9a0dc9f16dad38c376134c7abe54b3e75cde5778af252c82583812e5f36" \
  "https://hackathon-platform-601l.onrender.com/api/external/v1/hackathons"
```

## 🔗 External API Endpoints

بعد النشر، ستكون الـ endpoints التالية متاحة:

### 1. جلب قائمة الهاكاثونات
```
GET https://hackathon-platform-601l.onrender.com/api/external/v1/hackathons
```

### 2. جلب هاكاثون محدد
```
GET https://hackathon-platform-601l.onrender.com/api/external/v1/hackathons/{id}
```

### 3. جلب معلومات التسجيل
```
GET https://hackathon-platform-601l.onrender.com/api/external/v1/hackathons/{id}/register
```

### 4. التسجيل في هاكاثون
```
POST https://hackathon-platform-601l.onrender.com/api/external/v1/hackathons/{id}/register
```

## 🔑 API Key للإنتاج

**API Key الجديد للإنتاج:**
```
hk_4824b9a0dc9f16dad38c376134c7abe54b3e75cde5778af252c82583812e5f36
```

⚠️ **مهم:** احتفظ بهذا المفتاح آمناً ولا تشاركه علناً!

## 📝 مثال على الاستخدام

### JavaScript/Fetch:
```javascript
const API_KEY = 'hk_0bed91ea29cbbb96de975ecb0ac7e128db682d0809309e11620594171253c75f';
const BASE_URL = 'https://hackathon-platform-601l.onrender.com/api/external/v1';

// جلب الهاكاثونات
async function getHackathons() {
  const response = await fetch(`${BASE_URL}/hackathons`, {
    headers: {
      'X-API-Key': API_KEY
    }
  });
  return await response.json();
}

// التسجيل في هاكاثون
async function registerForHackathon(hackathonId, userData) {
  const response = await fetch(`${BASE_URL}/hackathons/${hackathonId}/register`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  return await response.json();
}
```

### cURL:
```bash
# جلب الهاكاثونات
curl -H "X-API-Key: hk_0bed91ea29cbbb96de975ecb0ac7e128db682d0809309e11620594171253c75f" \
  "https://hackathon-platform-601l.onrender.com/api/external/v1/hackathons"

# التسجيل
curl -X POST \
  -H "X-API-Key: hk_0bed91ea29cbbb96de975ecb0ac7e128db682d0809309e11620594171253c75f" \
  -H "Content-Type: application/json" \
  -d '{"name":"أحمد محمد","email":"ahmed@example.com","phone":"+966501234567"}' \
  "https://hackathon-platform-601l.onrender.com/api/external/v1/hackathons/HACKATHON_ID/register"
```

## 🔧 استكشاف الأخطاء

### إذا فشل النشر:
1. تحقق من logs في Render Dashboard
2. تأكد من صحة متغيرات البيئة
3. تحقق من أن DATABASE_URL موجود

### إذا لم يعمل External API:
1. تحقق من أن EXTERNAL_API_KEY مضبوط صحيحاً
2. تأكد من استخدام HTTPS وليس HTTP
3. تحقق من headers الطلب

### إذا كانت هناك مشاكل CORS:
1. تأكد من أن middleware.ts تم نشره
2. تحقق من أن الطلبات تتضمن headers صحيحة

## 📊 مراقبة الأداء

بعد النشر، راقب:
- استخدام API من خلال logs
- أداء قاعدة البيانات
- معدل الأخطاء
- استجابة الخادم

## 🎉 النشر مكتمل!

بعد اتباع هذه الخطوات، ستكون External API متاحة على:
```
https://hackathon-platform-601l.onrender.com/api/external/v1
```

يمكن الآن للمواقع الخارجية التكامل مع منصة الهاكاثونات!
