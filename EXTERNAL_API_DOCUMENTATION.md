# 🌐 External API Documentation
## Hackathon Platform External API

هذا API يسمح للمواقع الخارجية بالتكامل مع منصة الهاكاثون للحصول على بيانات الهاكاثونات وتسجيل المشاركين.

## 🔐 Authentication

جميع طلبات API تتطلب API Key في الـ headers:

```
X-API-Key: YOUR_API_KEY
```

**للحصول على API Key:** تواصل مع مدير النظام

## 📡 Base URL

```
https://hackathon-platform-601l.onrender.com/api/external
```

## 🔗 Available Endpoints

### 1. Get All Active Hackathons

**GET** `/hackathons`

يحصل على قائمة بجميع الهاكاثونات النشطة المتاحة للتسجيل.

#### Headers
```
X-API-Key: YOUR_API_KEY
Content-Type: application/json
```

#### Response
```json
{
  "success": true,
  "hackathons": [
    {
      "id": "hackathon_id",
      "title": "اسم الهاكاثون",
      "description": "وصف الهاكاثون",
      "startDate": "2024-01-15T09:00:00.000Z",
      "endDate": "2024-01-17T18:00:00.000Z",
      "registrationDeadline": "2024-01-10T23:59:59.000Z",
      "maxParticipants": 100,
      "currentParticipants": 45,
      "isRegistrationOpen": true,
      "spotsAvailable": 55
    }
  ],
  "total": 1
}
```

### 2. Get Hackathon Details

**GET** `/hackathons/{id}`

يحصل على تفاصيل هاكاثون محدد.

#### Parameters
- `id` (string): معرف الهاكاثون

#### Headers
```
X-API-Key: YOUR_API_KEY
Content-Type: application/json
```

#### Response
```json
{
  "success": true,
  "hackathon": {
    "id": "hackathon_id",
    "title": "اسم الهاكاثون",
    "description": "وصف مفصل للهاكاثون",
    "startDate": "2024-01-15T09:00:00.000Z",
    "endDate": "2024-01-17T18:00:00.000Z",
    "registrationDeadline": "2024-01-10T23:59:59.000Z",
    "location": "الرياض، السعودية",
    "maxParticipants": 100,
    "currentParticipants": 45,
    "currentTeams": 12,
    "status": "active",
    "isRegistrationOpen": true,
    "spotsAvailable": 55,
    "registrationForm": {
      "id": "form_id",
      "fields": [...]
    },
    "requirements": "المتطلبات",
    "prizes": "الجوائز",
    "rules": "القواعد",
    "schedule": "الجدول الزمني",
    "contactEmail": "contact@hackathon.com",
    "websiteUrl": "https://hackathon.com",
    "socialLinks": {
      "twitter": "@hackathon",
      "linkedin": "hackathon"
    }
  }
}
```

### 3. Register for Hackathon

**POST** `/hackathons/{id}/register`

تسجيل مشارك جديد في هاكاثون محدد.

#### Parameters
- `id` (string): معرف الهاكاثون

#### Headers
```
X-API-Key: YOUR_API_KEY
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "اسم المشارك",
  "email": "email@example.com",
  "phone": "+966501234567",
  "university": "جامعة الملك سعود",
  "major": "علوم الحاسب",
  "graduationYear": "2025",
  "preferredRole": "مطور",
  "experience": "متوسط",
  "skills": ["JavaScript", "Python", "React"],
  "portfolioUrl": "https://portfolio.com",
  "linkedinUrl": "https://linkedin.com/in/username",
  "githubUrl": "https://github.com/username",
  "motivation": "سبب المشاركة",
  "source": "موقع الجامعة"
}
```

#### Required Fields
- `name` (string): اسم المشارك
- `email` (string): البريد الإلكتروني
- `phone` (string): رقم الهاتف

#### Optional Fields
- `university` (string): الجامعة
- `major` (string): التخصص
- `graduationYear` (string): سنة التخرج
- `preferredRole` (string): الدور المفضل
- `experience` (string): مستوى الخبرة
- `skills` (array): المهارات
- `portfolioUrl` (string): رابط المعرض
- `linkedinUrl` (string): رابط LinkedIn
- `githubUrl` (string): رابط GitHub
- `motivation` (string): سبب المشاركة
- `source` (string): مصدر معرفة الهاكاثون

#### Response - Success
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "participantId": "participant_id",
    "hackathonTitle": "اسم الهاكاثون",
    "registrationDate": "2024-01-01T10:00:00.000Z",
    "hackathonStartDate": "2024-01-15T09:00:00.000Z",
    "hackathonEndDate": "2024-01-17T18:00:00.000Z"
  }
}
```

#### Response - Error
```json
{
  "error": "Error message"
}
```

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - بيانات غير صحيحة |
| 401 | Unauthorized - API Key غير صحيح |
| 404 | Not Found - الهاكاثون غير موجود |
| 500 | Internal Server Error - خطأ في الخادم |

## 📝 Example Usage

### JavaScript/Fetch Example

```javascript
// Get all hackathons
const getHackathons = async () => {
  const response = await fetch('https://hackathon-platform-601l.onrender.com/api/external/hackathons', {
    method: 'GET',
    headers: {
      'X-API-Key': 'YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data;
};

// Register for hackathon
const registerForHackathon = async (hackathonId, userData) => {
  const response = await fetch(`https://hackathon-platform-601l.onrender.com/api/external/hackathons/${hackathonId}/register`, {
    method: 'POST',
    headers: {
      'X-API-Key': 'YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  const data = await response.json();
  return data;
};
```

### PHP/cURL Example

```php
<?php
// Get all hackathons
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://hackathon-platform-601l.onrender.com/api/external/hackathons');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'X-API-Key: YOUR_API_KEY',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$data = json_decode($response, true);
curl_close($ch);

// Register for hackathon
$userData = [
    'name' => 'اسم المشارك',
    'email' => 'email@example.com',
    'phone' => '+966501234567'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://hackathon-platform-601l.onrender.com/api/external/hackathons/HACKATHON_ID/register');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($userData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'X-API-Key: YOUR_API_KEY',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$data = json_decode($response, true);
curl_close($ch);
?>
```

### Python/Requests Example

```python
import requests

# Configuration
API_KEY = 'YOUR_API_KEY'
BASE_URL = 'https://hackathon-platform-601l.onrender.com/api/external'
headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
}

# Get all hackathons
def get_hackathons():
    response = requests.get(f'{BASE_URL}/hackathons', headers=headers)
    return response.json()

# Register for hackathon
def register_for_hackathon(hackathon_id, user_data):
    response = requests.post(
        f'{BASE_URL}/hackathons/{hackathon_id}/register',
        headers=headers,
        json=user_data
    )
    return response.json()

# Example usage
hackathons = get_hackathons()
print(hackathons)

user_data = {
    'name': 'اسم المشارك',
    'email': 'email@example.com',
    'phone': '+966501234567'
}

result = register_for_hackathon('HACKATHON_ID', user_data)
print(result)
```

## 🔒 Security Notes

1. **API Key Protection**: لا تشارك API Key الخاص بك أو تضعه في الكود المكشوف
2. **HTTPS Only**: استخدم HTTPS فقط للاتصال بـ API
3. **Rate Limiting**: قد يتم تطبيق حدود على عدد الطلبات
4. **Data Validation**: تأكد من التحقق من صحة البيانات قبل الإرسال

## 📞 Support

للحصول على المساعدة أو الإبلاغ عن مشاكل:
- Email: support@hackathon.gov.sa
- الموقع: https://hackathon-platform-601l.onrender.com

## 📋 Changelog

### v1.0.0 (2024-01-01)
- إطلاق النسخة الأولى من External API
- إضافة endpoints للهاكاثونات والتسجيل
- دعم CORS للمواقع الخارجية
- نظام المصادقة بـ API Key
