# 🏆 منصة الهاكاثون - Hackathon Platform

منصة شاملة لإدارة الهاكاثونات مع نظام تقييم متقدم وإدارة المشاركين.

## ✨ المميزات الرئيسية

- 🎯 **إدارة الهاكاثونات**: إنشاء وإدارة هاكاثونات متعددة
- 👥 **نظام المشاركين**: تسجيل وإدارة المشاركين والفرق
- ⚖️ **نظام التقييم**: تقييم المشاريع من قبل المحكمين
- 📊 **لوحة التحكم**: إحصائيات وتقارير شاملة
- 📧 **نظام الإشعارات**: إرسال إيميلات للمشاركين
- 🏅 **الشهادات**: إنشاء وإرسال شهادات المشاركة
- 📱 **تصميم متجاوب**: يعمل على جميع الأجهزة

## 🚀 التقنيات المستخدمة

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Authentication**: JWT
- **Email**: Nodemailer
- **Deployment**: Render

## 📦 التثبيت والتشغيل

### المتطلبات
- Node.js 18+
- npm أو yarn أو pnpm

### التثبيت المحلي

```bash
# استنساخ المشروع
git clone <repository-url>
cd hackathon-platform

# تثبيت التبعيات
npm install

# إعداد قاعدة البيانات
npm run db:push
npm run db:seed

# تشغيل المشروع
npm run dev
```

### متغيرات البيئة

انسخ `.env.example` إلى `.env.local` وأضف القيم المطلوبة:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
GMAIL_USER="your-email@gmail.com"
GMAIL_PASS="your-app-password"
MAIL_FROM="your-email@gmail.com"
```

## 🌐 النشر على Render

### الخطوات السريعة:

1. **إنشاء قاعدة بيانات PostgreSQL** على Render
2. **إنشاء Web Service** وربطه بـ GitHub
3. **إضافة متغيرات البيئة** المطلوبة
4. **النشر التلقائي** سيبدأ

### التفاصيل الكاملة:
راجع [دليل النشر الشامل](./DEPLOYMENT_GUIDE.md) للحصول على تعليمات مفصلة.

## 📚 الاستخدام

### للمديرين:
- إنشاء وإدارة الهاكاثونات
- إدارة المشاركين والمحكمين
- مراجعة النتائج والتقارير
- إرسال الإشعارات والشهادات

### للمحكمين:
- تقييم المشاريع المشاركة
- إضافة تعليقات وملاحظات
- مراجعة معايير التقييم

### للمشاركين:
- التسجيل في الهاكاثونات
- رفع المشاريع والأفكار
- تتبع حالة المشاركة
- تحميل الشهادات

## 🔧 Scripts المتاحة

```bash
# التطوير
npm run dev

# البناء
npm run build

# التشغيل في الإنتاج
npm start

# قاعدة البيانات
npm run db:push          # تطبيق التغييرات
npm run db:generate      # إنشاء Prisma Client
npm run db:seed          # إضافة بيانات تجريبية
npm run db:seed-admin    # إنشاء حساب مدير

# النشر
npm run deploy:render    # نشر على Render
```

## 📁 هيكل المشروع

```
├── app/                 # صفحات Next.js
├── components/          # مكونات React
├── lib/                 # مكتبات مساعدة
├── prisma/             # إعدادات قاعدة البيانات
├── public/             # الملفات العامة
├── scripts/            # سكريبتات مساعدة
└── styles/             # ملفات التنسيق
```

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:

1. Fork المشروع
2. إنشاء branch جديد للميزة
3. Commit التغييرات
4. Push إلى Branch
5. إنشاء Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT.

## 📞 الدعم

للحصول على الدعم أو الإبلاغ عن مشاكل، يرجى إنشاء Issue في GitHub.

---

**تم تطويره بـ ❤️ للمجتمع التقني**
