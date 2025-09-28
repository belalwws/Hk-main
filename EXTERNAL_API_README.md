# External API للتسجيل في الهاكاثونات

## نظرة عامة

تم إنشاء External API يسمح للمواقع الخارجية بالتكامل مع منصة الهاكاثونات للتسجيل المباشر. هذا يتيح للجامعات والمؤسسات إنشاء مواقعهم الخاصة للتسجيل في الهاكاثونات.

## الميزات الجديدة

### 🔗 API Endpoints
- `GET /api/external/v1/hackathons` - جلب قائمة الهاكاثونات
- `GET /api/external/v1/hackathons/{id}` - جلب تفاصيل هاكاثون محدد
- `GET /api/external/v1/hackathons/{id}/register` - جلب معلومات التسجيل
- `POST /api/external/v1/hackathons/{id}/register` - التسجيل في هاكاثون

### 🔐 الأمان
- مصادقة عبر API Key في الـ headers
- دعم CORS للاستخدام من المتصفحات
- تشفير كلمات المرور
- التحقق من صحة البيانات باستخدام Zod

### 📊 الميزات المتقدمة
- دعم البيانات المخصصة (Custom Data)
- إحصائيات المشاركين والفرق
- التحقق من حالة التسجيل
- دعم النماذج المخصصة

## إعداد API Key

### 1. إنشاء API Key
```bash
node scripts/generate-api-key.js
```

### 2. إضافة API Key للبيئة
```bash
# في ملف .env
EXTERNAL_API_KEY="hk_your_generated_api_key_here"
```

### 3. إعادة تشغيل الخادم
```bash
npm run dev
```

## استخدام API

### JavaScript Example
```javascript
const API_KEY = 'hk_your_api_key';
const BASE_URL = 'https://hackathon-platform-601l.onrender.com/api/external/v1';

// جلب الهاكاثونات المفتوحة
async function getOpenHackathons() {
  const response = await fetch(`${BASE_URL}/hackathons?status=open`, {
    headers: {
      'X-API-Key': API_KEY
    }
  });
  return await response.json();
}

// التسجيل في هاكاثون
async function registerParticipant(hackathonId, userData) {
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

### React Example
```jsx
import { useState, useEffect } from 'react';

function HackathonList() {
  const [hackathons, setHackathons] = useState([]);
  
  useEffect(() => {
    fetch('/api/external/v1/hackathons?status=open', {
      headers: {
        'X-API-Key': process.env.REACT_APP_API_KEY
      }
    })
    .then(res => res.json())
    .then(data => setHackathons(data.hackathons));
  }, []);

  return (
    <div>
      {hackathons.map(hackathon => (
        <div key={hackathon.id}>
          <h3>{hackathon.title}</h3>
          <p>{hackathon.description}</p>
          <button onClick={() => register(hackathon.id)}>
            سجل الآن
          </button>
        </div>
      ))}
    </div>
  );
}
```

## مثال موقع خارجي

تم إنشاء مثال كامل في ملف `external-site-example.html` يوضح:
- جلب قائمة الهاكاثونات
- عرض تفاصيل كل هاكاثون
- نموذج تسجيل تفاعلي
- معالجة الأخطاء والنجاح
- تصميم متجاوب

## البيانات المطلوبة للتسجيل

### الحقول الإجبارية
- `name`: الاسم الكامل
- `email`: البريد الإلكتروني
- `phone`: رقم الهاتف

### الحقول الاختيارية
- `password`: كلمة المرور (للمستخدمين الجدد)
- `city`: المدينة
- `nationality`: الجنسية
- `university`: الجامعة
- `major`: التخصص
- `graduationYear`: سنة التخرج
- `preferredRole`: الدور المفضل
- `experience`: مستوى الخبرة
- `skills`: المهارات
- `portfolioUrl`: رابط المعرض
- `linkedinUrl`: رابط LinkedIn
- `githubUrl`: رابط GitHub
- `motivation`: سبب المشاركة
- `source`: مصدر معرفة الهاكاثون
- `customData`: بيانات مخصصة إضافية

## معالجة الأخطاء

### أكواد الحالة
- `200`: نجح الطلب
- `400`: خطأ في البيانات
- `401`: API Key غير صحيح
- `404`: المورد غير موجود
- `500`: خطأ في الخادم

### أمثلة على الأخطاء
```json
{
  "error": "Invalid API key"
}

{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "البريد الإلكتروني غير صحيح"
    }
  ]
}
```

## الأمان والحدود

### Rate Limiting
- 100 طلب في الدقيقة لكل API Key
- 1000 طلب في اليوم لكل API Key

### أفضل الممارسات
- احتفظ بـ API Key آمن
- لا تضعه في الكود المكشوف
- استخدم HTTPS دائماً
- راقب استخدام API
- قم بتدوير المفاتيح بانتظام

## اختبار API

### باستخدام cURL
```bash
# جلب الهاكاثونات
curl -H "X-API-Key: your-api-key" \
  "https://hackathon-platform-601l.onrender.com/api/external/v1/hackathons"

# التسجيل
curl -X POST \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"أحمد محمد","email":"ahmed@example.com","phone":"+966501234567"}' \
  "https://hackathon-platform-601l.onrender.com/api/external/v1/hackathons/HACKATHON_ID/register"
```

### باستخدام Postman
1. إنشاء Collection جديد
2. إضافة Header: `X-API-Key: your-api-key`
3. إضافة الـ endpoints المطلوبة
4. اختبار الطلبات

## الدعم والمساعدة

للحصول على:
- API Key جديد
- دعم تقني
- تقارير الأخطاء
- طلبات الميزات

تواصل معنا على: support@hackathon.gov.sa

## التحديثات المستقبلية

### قيد التطوير
- [ ] Webhooks للإشعارات
- [ ] API للفرق والمشاريع
- [ ] تصدير البيانات
- [ ] إحصائيات متقدمة
- [ ] دعم المرفقات

### تم الإنجاز
- [x] API أساسي للتسجيل
- [x] مصادقة API Key
- [x] دعم CORS
- [x] التحقق من البيانات
- [x] معالجة الأخطاء
- [x] مثال موقع خارجي
