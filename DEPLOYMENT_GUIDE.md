# 🚀 دليل النشر الشامل على Render

## 📋 المتطلبات الأساسية:
- حساب GitHub مع المشروع
- حساب Render مجاني أو مدفوع
- حساب Gmail لإرسال الإيميلات

## 1️⃣ إعداد المشروع محلياً:

### تحديث قاعدة البيانات:
```bash
# تأكد من أن schema.prisma يستخدم PostgreSQL
# تم تحديثه تلقائياً في المشروع
```

### اختبار البناء محلياً:
```bash
npm install
npm run type-check
npm run lint
npm run build
```

## 2️⃣ إعداد قاعدة البيانات على Render:

1. **اذهب إلى [Render Dashboard](https://dashboard.render.com)**
2. **أنشئ PostgreSQL Database:**
   - اضغط "New +"
   - اختر "PostgreSQL"
   - اسم قاعدة البيانات: `hackathon-db`
   - اسم المستخدم: `hackathon_user`
   - اختر المنطقة: `Oregon (US West)`
   - اختر الخطة: `Free` أو `Starter`
3. **انسخ DATABASE_URL** من صفحة قاعدة البيانات

## 3️⃣ إعداد Web Service:

1. **أنشئ Web Service جديد:**
   - اضغط "New +"
   - اختر "Web Service"
   - اربطه بـ GitHub repository

2. **إعدادات الخدمة:**
   - **Name:** `hackathon-platform`
   - **Region:** `Oregon (US West)`
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm ci && npx prisma generate --schema ./schema.prisma && npm run build`
   - **Start Command:** `npm start`

## 4️⃣ متغيرات البيئة (Environment Variables):

أضف المتغيرات التالية في إعدادات Web Service:

### متغيرات أساسية:
```
NODE_ENV=production
DATABASE_URL=[انسخ من قاعدة البيانات]
JWT_SECRET=[مفتاح عشوائي قوي - 32 حرف على الأقل]
NEXTAUTH_SECRET=[مفتاح عشوائي آخر]
```

### متغيرات الإيميل:
```
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=[App Password من Gmail]
MAIL_FROM=your-email@gmail.com
```

### متغيرات التطبيق:
```
NEXTAUTH_URL=https://your-app-name.onrender.com
NEXT_PUBLIC_APP_URL=https://your-app-name.onrender.com
```

## 5️⃣ إعداد Gmail App Password:

1. اذهب إلى [Google Account Settings](https://myaccount.google.com)
2. فعل 2-Factor Authentication
3. اذهب إلى "App passwords"
4. أنشئ App Password جديد للتطبيق
5. استخدم هذا Password في `GMAIL_PASS`

## 6️⃣ النشر:

1. **اضغط "Create Web Service"**
2. **انتظر اكتمال البناء** (5-10 دقائق)
3. **تحقق من اللوجز** للتأكد من عدم وجود أخطاء

## 7️⃣ إعداد قاعدة البيانات بعد النشر:

### تشغيل Migrations:
```bash
# في Render Console أو عبر Manual Deploy
npm run db:migrate:deploy
```

### إنشاء Admin Account:
```bash
npm run db:seed-admin
```

## 8️⃣ اختبار النظام:

### اختبارات أساسية:
- ✅ فتح الموقع بنجاح
- ✅ تسجيل دخول Admin
- ✅ إنشاء هاكاثون جديد
- ✅ إنشاء حسابات محكمين
- ✅ اختبار إرسال الإيميلات
- ✅ تسجيل مشاركين جدد

### في حالة وجود مشاكل:
1. **تحقق من اللوجز** في Render Dashboard
2. **تأكد من متغيرات البيئة** صحيحة
3. **تحقق من اتصال قاعدة البيانات**
4. **تأكد من إعدادات Gmail**

## 9️⃣ إعدادات إضافية:

### تحديث الدومين (اختياري):
- يمكنك ربط دومين مخصص من إعدادات Web Service

### مراقبة الأداء:
- استخدم Render Metrics لمراقبة الأداء
- فعل Health Checks

### النسخ الاحتياطية:
- Render يأخذ نسخ احتياطية تلقائية لقاعدة البيانات
- يمكنك تحميل نسخة احتياطية يدوياً

## 🎉 تهانينا! المشروع جاهز للإنتاج!

### روابط مفيدة:
- [Render Documentation](https://render.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma Production Guide](https://www.prisma.io/docs/guides/deployment)

### معلومات الدعم:
- في حالة وجود مشاكل، تحقق من اللوجز أولاً
- تأكد من أن جميع متغيرات البيئة مضبوطة صحيحاً
- تحقق من حالة قاعدة البيانات والاتصال
