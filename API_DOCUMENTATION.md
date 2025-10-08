# 🚀 External API Documentation

## نظرة عامة

توفر منصة الهاكاثون مجموعة من الـ APIs الخارجية التي تسمح لك بربط موقعك الخاص بالمنصة.

---

## 🔑 المصادقة (Authentication)

جميع الطلبات تتطلب API Key في الـ Header:

```
X-API-Key: your-api-key-here
```

**الحصول على API Key:**
1. سجل دخول كـ Admin
2. اذهب إلى `/admin/api-docs`
3. انسخ الـ API Key

---

## 📋 Endpoints المتاحة

### 1. تسجيل مشارك جديد

**Endpoint:** `POST /api/external/register`

**الوصف:** تسجيل مشارك في هاكاثون معين

**Headers:**
```
Content-Type: application/json
X-API-Key: your-api-key-here
```

**Request Body:**
```json
{
  "hackathonId": "cmgibgctw0001js1eg67m5gcq",
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "phone": "0501234567",
  "organization": "جامعة الملك سعود",
  "preferredRole": "مطور",
  "customField1": "قيمة مخصصة 1",
  "customField2": "قيمة مخصصة 2"
}
```

**الحقول المطلوبة:**
- `hackathonId` (string) - معرف الهاكاثون
- `name` (string) - اسم المشارك
- `email` (string) - البريد الإلكتروني

**الحقول الاختيارية:**
- `phone` (string) - رقم الهاتف
- `organization` (string) - المؤسسة/الجامعة
- `preferredRole` (string) - الدور المفضل
- أي حقول مخصصة أخرى حسب فورم التسجيل

**Response (Success):**
```json
{
  "success": true,
  "message": "Registration successful",
  "participant": {
    "id": "participant-id",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "phone": "0501234567",
    "organization": "جامعة الملك سعود",
    "preferredRole": "مطور",
    "status": "pending",
    "registeredAt": "2025-01-15T10:30:00.000Z",
    "customFields": {
      "customField1": "قيمة مخصصة 1",
      "customField2": "قيمة مخصصة 2"
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Missing required fields: name and email are required"
}
```

**cURL Example:**
```bash
curl -X POST "https://your-domain.com/api/external/register" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "hackathonId": "cmgibgctw0001js1eg67m5gcq",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "phone": "0501234567"
  }'
```

---

### 2. العد التنازلي للهاكاثون

**Endpoint:** `GET /api/external/countdown/:hackathonId`

**الوصف:** الحصول على معلومات العد التنازلي لهاكاثون معين

**Headers:**
```
X-API-Key: your-api-key-here
```

**Response:**
```json
{
  "success": true,
  "hackathon": {
    "id": "cmgibgctw0001js1eg67m5gcq",
    "title": "هاكاثون الباحة 2025",
    "description": "...",
    "startDate": "2025-02-15T09:00:00.000Z",
    "endDate": "2025-02-17T18:00:00.000Z",
    "location": "الباحة",
    "maxParticipants": 100,
    "currentParticipants": 45,
    "status": "upcoming",
    "registrationOpen": true,
    "countdown": {
      "label": "يبدأ خلال",
      "days": 15,
      "hours": 8,
      "minutes": 30,
      "seconds": 45,
      "totalSeconds": 1324245,
      "formatted": "15 يوم، 8 ساعة، 30 دقيقة، 45 ثانية"
    }
  }
}
```

**Status Values:**
- `upcoming` - لم يبدأ بعد
- `ongoing` - جاري الآن
- `ended` - انتهى

**cURL Example:**
```bash
curl -X GET "https://your-domain.com/api/external/countdown/cmgibgctw0001js1eg67m5gcq" \
  -H "X-API-Key: your-api-key-here"
```

---

### 3. معلومات الهاكاثون

**Endpoint:** `GET /api/external/hackathon/:hackathonId`

**الوصف:** الحصول على معلومات تفصيلية عن هاكاثون معين

**Headers:**
```
X-API-Key: your-api-key-here
```

**Response:**
```json
{
  "success": true,
  "hackathon": {
    "id": "cmgibgctw0001js1eg67m5gcq",
    "title": "هاكاثون الباحة 2025",
    "description": "...",
    "startDate": "2025-02-15T09:00:00.000Z",
    "endDate": "2025-02-17T18:00:00.000Z",
    "location": "الباحة",
    "maxParticipants": 100,
    "currentParticipants": 45,
    "status": "upcoming",
    "registrationOpen": true,
    "registrationForm": {
      "id": "form-id",
      "title": "نموذج التسجيل",
      "description": "...",
      "fields": [
        {
          "id": "name",
          "label": "الاسم الكامل",
          "type": "text",
          "required": true
        },
        {
          "id": "email",
          "label": "البريد الإلكتروني",
          "type": "email",
          "required": true
        }
      ]
    }
  }
}
```

**cURL Example:**
```bash
curl -X GET "https://your-domain.com/api/external/hackathon/cmgibgctw0001js1eg67m5gcq" \
  -H "X-API-Key: your-api-key-here"
```

---

## 🔧 استخدام الـ API في JavaScript

### مثال: تسجيل مشارك

```javascript
async function registerParticipant(formData) {
  const response = await fetch('https://your-domain.com/api/external/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key-here'
    },
    body: JSON.stringify({
      hackathonId: 'cmgibgctw0001js1eg67m5gcq',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      // أضف الحقول المخصصة هنا
      university: formData.university,
      major: formData.major
    })
  })

  const data = await response.json()
  
  if (data.success) {
    console.log('تم التسجيل بنجاح!', data.participant)
  } else {
    console.error('فشل التسجيل:', data.error)
  }
}
```

### مثال: عرض العد التنازلي

```javascript
async function showCountdown(hackathonId) {
  const response = await fetch(
    `https://your-domain.com/api/external/countdown/${hackathonId}`,
    {
      headers: {
        'X-API-Key': 'your-api-key-here'
      }
    }
  )

  const data = await response.json()
  
  if (data.success) {
    const countdown = data.hackathon.countdown
    console.log(`${countdown.days} يوم، ${countdown.hours} ساعة`)
    
    // تحديث العد التنازلي كل ثانية
    setInterval(() => {
      // اطلب البيانات مرة أخرى
    }, 1000)
  }
}
```

---

## ⚠️ ملاحظات مهمة

1. **الحقول المخصصة:** يمكنك إضافة أي حقول مخصصة في فورم التسجيل، وسيتم حفظها تلقائياً في `customFields`

2. **Auto-Approval:** المشاركون المسجلون عبر الـ API يتم وضعهم في حالة `pending` افتراضياً

3. **Rate Limiting:** لا يوجد حد للطلبات حالياً، لكن يُنصح بعدم إرسال أكثر من 100 طلب في الدقيقة

4. **CORS:** الـ API يدعم CORS من جميع المصادر

5. **HTTPS:** يُنصح باستخدام HTTPS في الإنتاج

---

## 🐛 معالجة الأخطاء

جميع الأخطاء تُرجع بصيغة:

```json
{
  "success": false,
  "error": "رسالة الخطأ هنا"
}
```

**أكواد الحالة (Status Codes):**
- `200` - نجح
- `400` - بيانات غير صحيحة
- `401` - API Key غير صحيح
- `404` - الهاكاثون غير موجود
- `409` - المستخدم مسجل مسبقاً
- `500` - خطأ في الخادم

---

## 📞 الدعم

للمساعدة أو الاستفسارات، تواصل مع فريق الدعم.

