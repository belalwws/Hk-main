# 📋 نظرة عامة على المشروع - منصة إدارة الهاكاثونات

**اسم المشروع:** منصة هاكاثون الابتكار التقني  
**التقنية:** Next.js 15 + TypeScript + Prisma + PostgreSQL (Neon)  
**الاستضافة:** Digital Ocean  
**قاعدة البيانات:** Neon PostgreSQL (Production)  
**التخزين السحابي:** Cloudinary  
**البريد الإلكتروني:** Gmail SMTP  

---

## 🎯 وصف المشروع

منصة متكاملة لإدارة وتنظيم الهاكاثونات التقنية، تدعم:
- إدارة متعددة للهاكاثونات
- نظام تسجيل المشاركين والفرق
- نظام تقييم المحكمين
- نظام إشراف ومتابعة
- نظام الخبراء والاستشاريين
- إدارة القوالب والإيميلات
- توليد الشهادات تلقائياً
- تقارير وإحصائيات شاملة

---

## 🏗️ البنية التقنية

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS + shadcn/ui
- **Forms:** React Hook Form + Zod
- **State Management:** React Context API
- **3D Graphics:** Three.js + React Three Fiber

### Backend
- **API:** Next.js API Routes
- **ORM:** Prisma
- **Database:** PostgreSQL (Neon)
- **Authentication:** JWT (jose)
- **Email:** Nodemailer (Gmail)
- **File Upload:** Cloudinary

### Security
- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting
- Password hashing (bcryptjs)
- Secure cookies (httpOnly, sameSite)

---

## 👥 الأدوار (Roles)

### 1. Admin (المدير)
- إدارة الهاكاثونات (إنشاء، تعديل، حذف)
- إدارة المستخدمين
- إدارة المحكمين والخبراء
- إدارة القوالب والإيميلات
- عرض التقارير والإحصائيات
- إرسال الشهادات

### 2. Supervisor (المشرف)
- متابعة الهاكاثونات
- إدارة الفرق والمشاركين
- إدارة المحكمين والخبراء
- إرسال الإيميلات والدعوات
- عرض التقارير

### 3. Judge (المحكم)
- تقييم الفرق
- عرض معايير التقييم
- إدخال الدرجات

### 4. Expert (الخبير)
- تقديم الاستشارات للفرق
- متابعة تقدم الفرق

### 5. Participant (المشارك)
- التسجيل في الهاكاثونات
- إنشاء/الانضمام للفرق
- رفع العروض التقديمية
- عرض النتائج

---

## 📁 هيكل المشروع

```
Hk-main/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # Authentication APIs
│   │   ├── admin/           # Admin APIs
│   │   ├── supervisor/      # Supervisor APIs
│   │   ├── judge/           # Judge APIs
│   │   ├── participant/     # Participant APIs
│   │   └── expert/          # Expert APIs
│   ├── admin/               # Admin Dashboard
│   ├── supervisor/          # Supervisor Dashboard
│   ├── judge/               # Judge Dashboard
│   ├── participant/         # Participant Dashboard
│   ├── expert/              # Expert Dashboard
│   └── layout.tsx           # Root Layout
├── components/              # React Components
│   ├── ui/                  # shadcn/ui Components
│   ├── admin/               # Admin Components
│   └── ...
├── lib/                     # Utility Libraries
│   ├── prisma.ts           # Prisma Client
│   ├── auth.ts             # Authentication
│   ├── cloudinary.ts       # File Upload
│   ├── mailer.ts           # Email Service
│   └── ...
├── prisma/                  # Prisma Schema & Migrations
├── scripts/                 # Utility Scripts
├── public/                  # Static Files
└── schema.prisma           # Database Schema
```

---

## 🗄️ قاعدة البيانات

### الجداول الرئيسية

#### Users
- المستخدمون (مشاركين، محكمين، خبراء، مشرفين، مدراء)
- المعلومات الشخصية والمهنية
- الصلاحيات والأدوار

#### Hackathons
- معلومات الهاكاثونات
- التواريخ والمواعيد
- الإعدادات والقوالب
- الحالة (draft, open, closed, completed)

#### Teams
- الفرق المشاركة
- أعضاء الفريق
- العروض التقديمية
- الدرجات والترتيب

#### Participants
- ربط المستخدمين بالهاكاثونات
- حالة المشاركة (pending, approved, rejected)

#### Judges
- ربط المحكمين بالهاكاثونات
- الصلاحيات والإعدادات

#### Experts
- ربط الخبراء بالهاكاثونات
- التخصصات والمجالات

#### Supervisors
- ربط المشرفين بالهاكاثونات
- الصلاحيات

#### Scores
- درجات التقييم
- ربط المحكم بالفريق والمعيار

#### EvaluationCriteria
- معايير التقييم
- الدرجة القصوى لكل معيار

#### EmailTemplates
- قوالب الإيميلات
- المرفقات
- المتغيرات الديناميكية

---

## 🔐 المتغيرات البيئية (.env)

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
JWT_SECRET="..."
NEXTAUTH_URL="https://clownfish-app-px9sc.ondigitalocean.app"
NEXTAUTH_SECRET="..."

# Email
GMAIL_USER="racein668@gmail.com"
GMAIL_PASS="..."
MAIL_FROM="هاكاثون الابتكار التقني <racein668@gmail.com>"

# Cloudinary
CLOUDINARY_CLOUD_NAME="djva3nfy5"
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://clownfish-app-px9sc.ondigitalocean.app"
```

---

## 🚀 التشغيل والنشر

### التطوير المحلي
```bash
# تثبيت المكتبات
npm install

# تشغيل السيرفر
npm run dev

# فتح المتصفح
http://localhost:3000
```

### البناء والنشر
```bash
# بناء المشروع
npm run build

# تشغيل الإنتاج
npm start
```

### النشر على Digital Ocean
1. Push الكود على GitHub
2. Digital Ocean يقوم بـ Auto-Deploy تلقائياً
3. أو استخدام Force Rebuild من Dashboard

---

## ⚠️ ملاحظات مهمة

### قاعدة البيانات
- ⚠️ **قاعدة البيانات Production على Neon**
- ⚠️ **تحتوي على بيانات حقيقية - لا تحذف أو تعدل بدون حذر**
- ✅ استخدم scripts/backup-database.js للنسخ الاحتياطي
- ✅ استخدم scripts/restore-database.js للاستعادة

### الملفات والمرفقات
- ✅ جميع الملفات تُرفع على Cloudinary
- ✅ الملفات الجديدة عامة (public) تلقائياً
- ⚠️ الملفات القديمة قد تحتاج إعادة رفع

### الإيميلات
- ✅ يتم الإرسال عبر Gmail SMTP
- ✅ Rate limiting: 1 إيميل كل 2 ثانية
- ⚠️ تحقق من Gmail quota limits

---

## 📊 الإحصائيات الحالية

### المستخدمون
- Admins: متعدد
- Supervisors: متعدد
- Judges: 1+
- Experts: 0 (طلبات معلقة: 3)
- Participants: متعدد

### الهاكاثونات
- Total: 3
- Status: Open

### الدعوات والطلبات
- Expert Invitations: 5
- Expert Applications: 3
- Judge Invitations: 5
- Judge Applications: 5

---

## 🛠️ Scripts المساعدة

```bash
# إنشاء مدير جديد
npm run create-admin

# اختبار الاتصال بقاعدة البيانات
npm run db:test

# تطبيق migrations
npm run db:migrate

# نسخ احتياطي لقاعدة البيانات
node scripts/backup-database.js

# استعادة قاعدة البيانات
node scripts/restore-database.js

# فحص بيانات المشرف
npx tsx scripts/check-supervisor-data.ts
```

---

## 🔗 روابط مهمة

- **Production URL:** https://clownfish-app-px9sc.ondigitalocean.app
- **Database:** Neon PostgreSQL (EU Central)
- **Cloudinary:** djva3nfy5
- **Email:** racein668@gmail.com

---

**آخر تحديث:** 2025-10-21  
**الحالة:** ✅ Production Ready

