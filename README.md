# 🏆 منصة إدارة الهاكاثونات

منصة شاملة لإدارة وتنظيم الهاكاثونات التقنية مبنية بـ Next.js و Prisma و PostgreSQL.

## 🚀 البدء السريع

### 1. تثبيت المتطلبات

```bash
# تثبيت المكتبات
npm install

# نسخ متغيرات البيئة
cp .env.example .env
```

### 2. إعداد قاعدة البيانات (التطوير)

```bash
# إعداد SQLite للتطوير المحلي
npm run dev:setup

# إنشاء حساب أدمن
npm run create-admin
```

### 3. تشغيل المشروع

```bash
# تشغيل الخادم المحلي
npm run dev
```

## 🔐 تسجيل الدخول

### حساب الأدمن الافتراضي:

- **البريد الإلكتروني**: `admin@hackathon.com`
- **كلمة المرور**: `admin123`
- **الرابط**: `http://localhost:3000/login`

## 🗄️ قواعد البيانات

### التطوير (SQLite)

- **الملف**: `schema.dev.prisma`
- **قاعدة البيانات**: `dev.db`
- **الأوامر**: `npm run dev:*`

### الإنتاج (PostgreSQL)

- **الملف**: `schema.prisma`
- **قاعدة البيانات**: يوفرها Render تلقائياً
- **النشر**: تلقائي عبر GitHub

## 📦 الأوامر المتاحة

```bash
# التطوير
npm run dev              # تشغيل الخادم المحلي
npm run dev:setup        # إعداد قاعدة البيانات المحلية
npm run dev:db:studio    # فتح Prisma Studio

# الإنتاج
npm run build            # بناء المشروع
npm run start            # تشغيل المشروع المبني

# الإدارة
npm run create-admin     # إنشاء حساب أدمن جديد
npm run cleanup          # تنظيف الملفات غير الضرورية
npm run prepare-render   # إعداد المشروع للنشر

# الاختبار
npm run lint             # فحص الكود
npm run type-check       # فحص TypeScript
npm run test:build       # اختبار البناء
```

## 🌟 المميزات

- ✅ **إدارة متعددة الهاكاثونات** - إنشاء وإدارة هاكاثونات متعددة
- ✅ **نظام تسجيل ديناميكي** - نماذج قابلة للتخصيص
- ✅ **نظام تقييم متقدم** - تقييم بالنجوم مع معايير مخصصة
- ✅ **صفحات هبوط مخصصة** - محرر HTML/CSS/JS متقدم
- ✅ **إدارة المستخدمين** - أدوار متعددة (مدير، محكم، مشارك)
- ✅ **نظام النتائج** - ترتيب تلقائي وتصدير البيانات
- ✅ **نظام الشهادات** - إنشاء شهادات مخصصة
- ✅ **نظام الإيميلات** - قوالب وإرسال جماعي
- ✅ **تأثيرات ثلاثية الأبعاد** - واجهة تفاعلية متقدمة
- ✅ **دعم كامل للعربية** - RTL وتصميم محلي

## 🚀 النشر على Render

### 1. إعداد المشروع

```bash
# تنظيف المشروع
npm run cleanup

# إعداد النشر
npm run prepare-render
```

### 2. رفع على GitHub

```bash
git add .
git commit -m "Ready for production"
git push origin main
```

### 3. إعداد Render

1. ربط المستودع بـ Render
2. تعيين متغيرات البيئة:
   - `JWT_SECRET` - مفتاح سري طويل
   - `NEXTAUTH_SECRET` - مفتاح NextAuth
   - `NEXTAUTH_URL` - رابط التطبيق على Render
3. النشر التلقائي

### 4. تسجيل الدخول بعد النشر

- **البريد**: `admin@hackathon.com`
- **كلمة المرور**: `admin123`

## 🛠️ التقنيات المستخدمة

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: PostgreSQL (إنتاج), SQLite (تطوير)
- **ORM**: Prisma
- **Authentication**: JWT, bcrypt
- **3D Graphics**: Three.js, React Three Fiber
- **UI Components**: Radix UI, shadcn/ui
- **Email**: Nodemailer
- **PDF Generation**: PDF-lib, Puppeteer

## 📁 هيكل المشروع

```
📁 app/                 # صفحات Next.js
├── 📁 admin/          # لوحة تحكم المدير
├── 📁 api/            # API endpoints
├── 📁 judge/          # واجهة المحكمين
├── 📁 participant/    # واجهة المشاركين
└── 📁 landing/        # صفحات الهبوط

📁 components/          # مكونات React
├── 📁 3d/             # مكونات ثلاثية الأبعاد
├── 📁 ui/             # مكونات واجهة المستخدم
└── 📁 admin/          # مكونات الإدارة

📁 lib/                # مكتبات مساعدة
📁 scripts/            # سكريبتات الإدارة
```

## 🔧 استكشاف الأخطاء

### مشكلة تسجيل الدخول

```bash
# إعادة إنشاء حساب الأدمن
npm run create-admin
```

### مشكلة قاعدة البيانات

```bash
# إعادة إعداد قاعدة البيانات
npm run dev:setup
```

### مشكلة النشر

```bash
# فحص الإعداد
npm run prepare-render
```

## 📞 الدعم

للمساعدة أو الاستفسارات، يرجى فتح issue في المستودع.

---

**🎉 مبروك! المشروع جاهز للاستخدام والنشر!**
