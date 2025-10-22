# 📡 API Documentation - منصة الهاكاثونات

**Base URL:** `https://clownfish-app-px9sc.ondigitalocean.app`  
**Authentication:** JWT Token (Cookie: `auth-token`)

---

## 🔐 Authentication APIs

### POST `/api/auth/login`
تسجيل الدخول

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "clxxx",
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin",
    "permissions": {},
    "activeHackathons": []
  }
}
```

---

### POST `/api/auth/register`
تسجيل مستخدم جديد

**Request Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "phone": "0501234567",
  "city": "Riyadh",
  "nationality": "Saudi",
  "skills": "JavaScript, React",
  "experience": "2 years",
  "preferredRole": "Developer"
}
```

---

### GET `/api/auth/verify`
التحقق من الجلسة الحالية

**Response:**
```json
{
  "user": {
    "id": "clxxx",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin"
  }
}
```

---

## 👨‍💼 Admin APIs

### GET `/api/admin/dashboard`
إحصائيات لوحة التحكم

**Required Role:** `admin`

**Response:**
```json
{
  "totalHackathons": 3,
  "activeHackathons": 2,
  "totalParticipants": 150,
  "totalUsers": 200,
  "totalTeams": 45,
  "totalJudges": 10,
  "recentHackathons": [...]
}
```

---

### GET `/api/admin/hackathons`
قائمة الهاكاثونات

**Required Role:** `admin`, `supervisor`

**Response:**
```json
[
  {
    "id": "clxxx",
    "title": "هاكاثون الصحة النفسية",
    "description": "...",
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-01-03T00:00:00.000Z",
    "status": "open",
    "registrationCount": 50,
    "maxParticipants": 100
  }
]
```

---

### POST `/api/admin/hackathons`
إنشاء هاكاثون جديد

**Required Role:** `admin`

**Request Body:**
```json
{
  "title": "هاكاثون جديد",
  "description": "وصف الهاكاثون",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-01-03T00:00:00.000Z",
  "registrationDeadline": "2024-12-25T00:00:00.000Z",
  "maxParticipants": 100,
  "status": "draft"
}
```

---

### GET `/api/admin/experts`
قائمة الخبراء

**Required Role:** `admin`, `supervisor`

**Response:**
```json
[
  {
    "id": "clxxx",
    "user": {
      "name": "Expert Name",
      "email": "expert@example.com"
    },
    "hackathon": {
      "title": "هاكاثون الصحة النفسية"
    },
    "specialization": "AI & ML",
    "status": "active"
  }
]
```

---

### GET `/api/admin/expert-invitations`
قائمة دعوات الخبراء

**Required Role:** `admin`, `supervisor`

**Query Parameters:**
- `hackathonId` (optional): تصفية حسب الهاكاثون

**Response:**
```json
[
  {
    "id": "clxxx",
    "email": "expert@example.com",
    "name": "Expert Name",
    "hackathon": {
      "title": "هاكاثون الصحة النفسية"
    },
    "status": "pending",
    "sentAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### POST `/api/admin/expert-invitations`
إرسال دعوة خبير

**Required Role:** `admin`, `supervisor`

**Request Body:**
```json
{
  "email": "expert@example.com",
  "name": "Expert Name",
  "hackathonId": "clxxx",
  "message": "رسالة مخصصة"
}
```

---

### GET `/api/admin/expert-applications`
قائمة طلبات الخبراء

**Required Role:** `admin`, `supervisor`

**Response:**
```json
[
  {
    "id": "clxxx",
    "name": "Applicant Name",
    "email": "applicant@example.com",
    "phone": "0501234567",
    "specialization": "AI & ML",
    "experience": "5 years",
    "status": "pending",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### PATCH `/api/admin/expert-applications/[id]`
قبول/رفض طلب خبير

**Required Role:** `admin`, `supervisor`

**Request Body:**
```json
{
  "status": "approved",  // or "rejected"
  "hackathonId": "clxxx"
}
```

---

### GET `/api/admin/judges`
قائمة المحكمين

**Required Role:** `admin`, `supervisor`

**Response:**
```json
[
  {
    "id": "clxxx",
    "user": {
      "name": "Judge Name",
      "email": "judge@example.com"
    },
    "hackathon": {
      "title": "هاكاثون الصحة النفسية"
    },
    "expertise": "Software Development",
    "isActive": true
  }
]
```

---

### GET `/api/admin/judge-invitations`
قائمة دعوات المحكمين

**Required Role:** `admin`, `supervisor`

**Response:**
```json
[
  {
    "id": "clxxx",
    "email": "judge@example.com",
    "name": "Judge Name",
    "hackathon": {
      "title": "هاكاثون الصحة النفسية"
    },
    "status": "pending",
    "sentAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### GET `/api/admin/judge-applications`
قائمة طلبات المحكمين

**Required Role:** `admin`, `supervisor`

**Response:**
```json
[
  {
    "id": "clxxx",
    "name": "Applicant Name",
    "email": "applicant@example.com",
    "phone": "0501234567",
    "expertise": "Software Development",
    "experience": "5 years",
    "status": "pending",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### GET `/api/admin/email-templates`
قائمة قوالب الإيميلات

**Required Role:** `admin`, `supervisor`

**Response:**
```json
[
  {
    "id": "clxxx",
    "name": "دعوة محكم",
    "subject": "دعوة للانضمام كمحكم",
    "body": "مرحباً {{name}}...",
    "attachments": [
      {
        "filename": "document.pdf",
        "url": "https://res.cloudinary.com/..."
      }
    ]
  }
]
```

---

## 👨‍🏫 Supervisor APIs

### GET `/api/supervisor/hackathons/[id]/teams`
قائمة الفرق في هاكاثون

**Required Role:** `supervisor`, `admin`

**Response:**
```json
[
  {
    "id": "clxxx",
    "name": "Team Name",
    "members": [
      {
        "user": {
          "name": "Member Name",
          "email": "member@example.com"
        }
      }
    ],
    "ideaTitle": "Project Title",
    "totalScore": 85.5,
    "rank": 1
  }
]
```

---

### POST `/api/supervisor/upload-attachment`
رفع مرفق للإيميل

**Required Role:** `supervisor`, `admin`

**Request:** `multipart/form-data`
- `file`: الملف (PDF, Image, etc.)

**Response:**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/...",
  "publicId": "email-attachments/...",
  "format": "pdf"
}
```

---

### POST `/api/supervisor/send-email`
إرسال إيميل

**Required Role:** `supervisor`, `admin`

**Request Body:**
```json
{
  "to": ["email1@example.com", "email2@example.com"],
  "subject": "Subject",
  "body": "Email body with {{variables}}",
  "attachments": [
    {
      "filename": "document.pdf",
      "url": "https://res.cloudinary.com/..."
    }
  ]
}
```

---

## 👨‍⚖️ Judge APIs

### GET `/api/judge/dashboard`
لوحة المحكم

**Required Role:** `judge`

**Response:**
```json
{
  "judge": {
    "id": "clxxx",
    "hackathon": {
      "title": "هاكاثون الصحة النفسية"
    }
  },
  "teams": [...],
  "criteria": [...],
  "myScores": [...]
}
```

---

### POST `/api/submit-score`
إدخال درجة تقييم

**Required Role:** `judge`

**Request Body:**
```json
{
  "teamId": "clxxx",
  "criterionId": "clxxx",
  "score": 8.5,
  "notes": "ملاحظات اختيارية"
}
```

---

## 👨‍🎓 Participant APIs

### GET `/api/participant/dashboard`
لوحة المشارك

**Required Role:** `participant`

**Response:**
```json
{
  "participant": {
    "id": "clxxx",
    "team": {
      "name": "Team Name",
      "members": [...]
    },
    "hackathon": {
      "title": "هاكاثون الصحة النفسية"
    }
  }
}
```

---

### POST `/api/participant/upload-idea`
رفع العرض التقديمي

**Required Role:** `participant`

**Request:** `multipart/form-data`
- `file`: ملف العرض (PDF, PPT, etc.)
- `title`: عنوان المشروع
- `description`: وصف المشروع

**Response:**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/...",
  "team": {
    "id": "clxxx",
    "ideaTitle": "Project Title",
    "ideaFile": "https://res.cloudinary.com/..."
  }
}
```

---

## 🎓 Expert APIs

### POST `/api/expert/apply`
تقديم طلب خبير

**Request:** `multipart/form-data`
- `name`: الاسم
- `email`: البريد الإلكتروني
- `phone`: رقم الهاتف
- `specialization`: التخصص
- `experience`: الخبرة
- `cv`: السيرة الذاتية (PDF)
- `profileImage`: صورة شخصية (optional)

**Response:**
```json
{
  "success": true,
  "application": {
    "id": "clxxx",
    "status": "pending"
  }
}
```

---

## 🔧 Utility APIs

### GET `/api/health`
فحص صحة السيرفر

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

### POST `/api/upload`
رفع ملف عام

**Request:** `multipart/form-data`
- `file`: الملف
- `folder`: المجلد (optional)

**Response:**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/...",
  "publicId": "...",
  "format": "jpg"
}
```

---

## 🔒 Error Responses

### 401 Unauthorized
```json
{
  "error": "غير مصرح"
}
```

### 403 Forbidden
```json
{
  "error": "ليس لديك صلاحية للوصول"
}
```

### 404 Not Found
```json
{
  "error": "المورد غير موجود"
}
```

### 429 Too Many Requests
```json
{
  "error": "تم تجاوز عدد المحاولات المسموحة"
}
```

### 500 Internal Server Error
```json
{
  "error": "حدث خطأ في الخادم"
}
```

---

## 📝 Notes

### Authentication
- جميع APIs المحمية تتطلب JWT token في cookie `auth-token`
- Token صالح لمدة 7 أيام
- يتم التحقق من الصلاحيات في middleware

### Rate Limiting
- Login: 5 محاولات كل 5 دقائق
- Email sending: 1 إيميل كل 2 ثانية
- Score submission: 20 محاولة كل دقيقة

### File Upload
- Maximum file size: 10MB
- Supported formats: PDF, JPG, PNG, PPTX, DOCX
- Files stored on Cloudinary

---

**للمزيد من التفاصيل، راجع الكود المصدري في `/app/api`**

