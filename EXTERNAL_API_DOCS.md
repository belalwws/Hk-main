# External API Documentation

هذا التوثيق يشرح كيفية استخدام الـ External API للتسجيل في الهاكاثونات من مواقع خارجية.

## Base URL
```
https://hackathon-platform-601l.onrender.com/api/external/v1
```

## Authentication
جميع الطلبات تتطلب API Key في الـ headers:
```
X-API-Key: YOUR_API_KEY
```

## Endpoints

### 1. Get All Hackathons
```
GET /hackathons
```

**Query Parameters:**
- `status` (optional): `open`, `closed`, `completed`
- `limit` (optional): عدد النتائج (افتراضي: 10، أقصى: 50)
- `offset` (optional): بداية النتائج (افتراضي: 0)
- `includeStats` (optional): `true` لإدراج إحصائيات المشاركين

**Response:**
```json
{
  "hackathons": [
    {
      "id": "hackathon_id",
      "title": "عنوان الهاكاثون",
      "description": "وصف الهاكاثون",
      "status": "open",
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-03T00:00:00Z",
      "registrationDeadline": "2023-12-25T00:00:00Z",
      "maxParticipants": 100,
      "requirements": ["متطلب 1", "متطلب 2"],
      "categories": ["فئة 1", "فئة 2"],
      "prizes": {
        "first": "الجائزة الأولى",
        "second": "الجائزة الثانية",
        "third": "الجائزة الثالثة"
      },
      "registrationOpen": true,
      "stats": {
        "participants": 45,
        "teams": 12,
        "judges": 5
      }
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### 2. Get Specific Hackathon
```
GET /hackathons/{id}
```

**Query Parameters:**
- `includeForm` (optional): `true` لإدراج نموذج التسجيل
- `includeStats` (optional): `true` لإدراج الإحصائيات

**Response:**
```json
{
  "id": "hackathon_id",
  "title": "عنوان الهاكاثون",
  "description": "وصف الهاكاثون",
  "status": "open",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-03T00:00:00Z",
  "registrationDeadline": "2023-12-25T00:00:00Z",
  "maxParticipants": 100,
  "requirements": ["متطلب 1", "متطلب 2"],
  "categories": ["فئة 1", "فئة 2"],
  "prizes": {
    "first": "الجائزة الأولى",
    "second": "الجائزة الثانية", 
    "third": "الجائزة الثالثة"
  },
  "registrationOpen": true,
  "registrationForm": {
    "id": "form_id",
    "title": "نموذج التسجيل",
    "description": "وصف النموذج",
    "fields": [
      {
        "id": "name",
        "type": "text",
        "label": "الاسم الكامل",
        "required": true
      }
    ]
  },
  "stats": {
    "participants": 45,
    "teams": 12,
    "judges": 5
  }
}
```

### 3. Get Registration Info
```
GET /hackathons/{id}/register
```

**Response:**
```json
{
  "hackathon": {
    "id": "hackathon_id",
    "title": "عنوان الهاكاثون",
    "registrationOpen": true,
    "currentParticipants": 45,
    "maxParticipants": 100
  },
  "registrationForm": {
    "id": "form_id",
    "title": "نموذج التسجيل",
    "fields": [...]
  }
}
```

### 4. Register for Hackathon
```
POST /hackathons/{id}/register
```

**Request Body:**
```json
{
  // Required fields
  "name": "اسم المشارك",
  "email": "email@example.com",
  "phone": "+966501234567",
  
  // Optional fields
  "password": "password123",
  "city": "الرياض",
  "nationality": "سعودي",
  "university": "جامعة الملك سعود",
  "major": "علوم الحاسب",
  "graduationYear": "2024",
  "preferredRole": "مطور",
  "experience": "متوسط",
  "skills": "JavaScript, Python, React",
  "portfolioUrl": "https://portfolio.com",
  "linkedinUrl": "https://linkedin.com/in/username",
  "githubUrl": "https://github.com/username",
  "motivation": "سبب المشاركة",
  "teamRole": "مطور",
  "source": "من أين سمع عن الهاكاثون",
  
  // Custom form data
  "customData": {
    "field1": "value1",
    "field2": "value2"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "participant": {
    "id": "participant_id",
    "status": "pending",
    "registeredAt": "2023-12-20T10:00:00Z"
  },
  "hackathon": {
    "id": "hackathon_id",
    "title": "عنوان الهاكاثون"
  }
}
```

## Error Responses

جميع الأخطاء ترجع بالتنسيق التالي:
```json
{
  "error": "رسالة الخطأ",
  "details": [] // تفاصيل إضافية في حالة أخطاء التحقق
}
```

**Status Codes:**
- `200`: نجح الطلب
- `400`: خطأ في البيانات المرسلة
- `401`: API Key غير صحيح
- `404`: المورد غير موجود
- `500`: خطأ في الخادم

## Examples

### JavaScript/Fetch Example
```javascript
const API_KEY = 'your-api-key';
const BASE_URL = 'https://hackathon-platform-601l.onrender.com/api/external/v1';

// Get all hackathons
async function getHackathons() {
  const response = await fetch(`${BASE_URL}/hackathons?status=open`, {
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.hackathons;
}

// Register for hackathon
async function registerForHackathon(hackathonId, userData) {
  const response = await fetch(`${BASE_URL}/hackathons/${hackathonId}/register`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  const result = await response.json();
  
  if (response.ok) {
    console.log('Registration successful:', result);
  } else {
    console.error('Registration failed:', result.error);
  }
  
  return result;
}
```

### cURL Example
```bash
# Get hackathons
curl -X GET "https://hackathon-platform-601l.onrender.com/api/external/v1/hackathons?status=open" \
  -H "X-API-Key: your-api-key"

# Register for hackathon
curl -X POST "https://hackathon-platform-601l.onrender.com/api/external/v1/hackathons/HACKATHON_ID/register" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "phone": "+966501234567",
    "preferredRole": "مطور"
  }'
```

## Rate Limiting
- 100 طلب في الدقيقة لكل API Key
- 1000 طلب في اليوم لكل API Key

## CORS Support
الـ API يدعم CORS للاستخدام من المتصفحات مباشرة.

## Support
للحصول على API Key أو الدعم التقني، تواصل معنا على:
- Email: support@hackathon.gov.sa
