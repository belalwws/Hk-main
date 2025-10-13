# 🏆 منصة إدارة الهاكاثونات

منصة شاملة لإدارة وتنظيم الهاكاثونات التقنية مبنية بـ Next.js و Prisma و PostgreSQL.

## 🎯 المميزات الرئيسية

- ✅ **نظام مصادقة متقدم** - JWT + NextAuth
- ✅ **لوحة تحكم شاملة** - إدارة الهاكاثونات والمشاركين
- ✅ **نماذج تسجيل مخصصة** - تصميم وتخصيص كامل
- ✅ **صفحات هبوط ديناميكية** - قوالب متعددة وتخصيص متقدم
- ✅ **محرر كود متقدم** - بيئة تطوير شبيهة بـ VSCode
- ✅ **مكتبة أكواد مساعدة** - snippets جاهزة للاستخدام
- ✅ **معرض قوالب** - تصاميم جاهزة ومتنوعة
- ✅ **نظام فرق متطور** - تكوين وإدارة الفرق
- ✅ **تقارير وإحصائيات** - تحليلات مفصلة
- ✅ **واجهة عربية كاملة** - RTL support
- ✅ **تصميم متجاوب** - يعمل على جميع الأجهزة
- 🆕 **External API** - واجهة برمجية للمواقع الخارجية
- 🆕 **تكامل خارجي** - السماح للمواقع الأخرى بالتسجيل
- 🆕 **مصادقة API Key** - حماية متقدمة للواجهة البرمجية
- 🆕 **دعم CORS** - طلبات من المتصفحات مباشرة

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

# النشر
npm run safe-deploy          # نشر آمن مع حماية كاملة للبيانات
npm run production-deploy    # نشر عادي محسّن
npm run render-deploy        # نشر على Render
npm run update-production-db # تحديث قاعدة البيانات في الإنتاج

# الاختبار
npm run lint             # فحص الكود
npm run type-check       # فحص TypeScript
npm run test:build       # اختبار البناء

# حماية البيانات
npm run data:snapshot    # أخذ نسخة احتياطية
npm run data:verify      # التحقق من سلامة البيانات
npm run data:restore     # استعادة البيانات
```

## 🌟 المميزات

- ✅ **إدارة متعددة الهاكاثونات** - إنشاء وإدارة هاكاثونات متعددة
- ✅ **نظام تسجيل ديناميكي** - نماذج قابلة للتخصيص
- ✅ **نظام تقييم متقدم** - تقييم بالنجوم مع معايير مخصصة
- ✅ **صفحات هبوط مخصصة** - محرر HTML/CSS/JS متقدم
- ✅ **إدارة المستخدمين** - أدوار متعددة (مدير، محكم، مشارك، مشرف)
- ✅ **نظام طلبات المشرفين** - فورم مخصص لطلبات الانضمام كمشرف مع رفع الصور
- ✅ **نظام دعوات المحكمين** - إرسال دعوات مخصصة للمحكمين
- ✅ **نظام النتائج** - ترتيب تلقائي وتصدير البيانات
- ✅ **نظام الشهادات** - إنشاء شهادات مخصصة
- ✅ **نظام الإيميلات** - قوالب وإرسال جماعي
- ✅ **نظام التقييم والملاحظات** - تقييم الهاكاثون من المشاركين
- ✅ **تأثيرات ثلاثية الأبعاد** - واجهة تفاعلية متقدمة
- ✅ **دعم كامل للعربية** - RTL وتصميم محلي
- ✅ **External API** - واجهة برمجية للتكامل مع المواقع الخارجية

## 🚀 النشر على Render

### 1. إعداد المشروع

```bash
# تنظيف المشروع
npm run cleanup

# إعداد النشر
npm run prepare-render

# اختبار البناء
npm run build
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
3. **أوامر البناء والتشغيل**:
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
4. النشر التلقائي

### 4. تسجيل الدخول بعد النشر

- **البريد**: `admin@hackathon.com`
- **كلمة المرور**: `admin123`

### 5. 💾 حماية البيانات

المشروع الآن يحافظ على البيانات عند كل deploy:

- ✅ **لا يتم مسح البيانات** عند التحديث
- ✅ **migrations آمنة** تحافظ على البيانات الموجودة
- ✅ **admin user تلقائي** ينشأ إذا لم يكن موجود
- ✅ **تحديث ذكي** للجداول الجديدة

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

## 🛡️ حماية البيانات

### مشكلة مسح البيانات - محلولة!

- ✅ **حماية كاملة** - البيانات لن تُمسح أبداً عند الـ deployment
- ✅ **تحقق تلقائي** - فحص سلامة البيانات قبل وبعد التحديث
- ✅ **إيقاف آمن** - توقف العملية إذا تم اكتشاف خطر على البيانات

### الأوامر الآمنة

```bash
npm run safe-deploy          # نشر مع حماية كاملة
npm run update-production-db # تحديث آمن لقاعدة البيانات
```

### التحقق من سلامة البيانات

```bash
# سيعرض تقرير مفصل عن حالة البيانات
npm run safe-deploy
```

## 🔗 External API (جديد!)

### الرابط الأساسي
```
https://clownfish-app-px9sc.ondigitalocean.app/api/external/v1
```

### المصادقة
جميع طلبات API تتطلب API key في الـ headers:
```
X-API-Key: your-api-key-here
```

### نقاط النهاية المتاحة

#### 1. جلب قائمة الهاكاثونات
```
GET /hackathons
GET /hackathons?status=open
```

#### 2. جلب هاكاثون محدد
```
GET /hackathons/{id}
GET /hackathons/{id}?includeForm=true
```

#### 3. التسجيل في هاكاثون
```
POST /hackathons/{id}/register
```

### مثال على الاستخدام

```javascript
const API_KEY = 'your-api-key';
const BASE_URL = 'https://clownfish-app-px9sc.ondigitalocean.app/api/external/v1';

// جلب الهاكاثونات المفتوحة
const response = await fetch(`${BASE_URL}/hackathons?status=open`, {
  headers: {
    'X-API-Key': API_KEY
  }
});

// التسجيل في هاكاثون
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

### التوثيق الكامل
- `EXTERNAL_API_DOCS.md` - توثيق شامل للـ API
- `EXTERNAL_API_README.md` - دليل الإعداد والاستخدام
- `RENDER_DEPLOYMENT.md` - تعليمات النشر

## 📞 الدعم

للمساعدة أو الاستفسارات، يرجى فتح issue في المستودع.

---

**🎉 مبروك! المشروع جاهز للاستخدام والنشر مع External API!**
