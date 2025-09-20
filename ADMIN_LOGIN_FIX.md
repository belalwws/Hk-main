# 🔐 حل مشكلة تسجيل دخول الأدمن

## 🚨 المشكلة
- رسالة "بيانات الدخول غير صحيحة" عند محاولة تسجيل الدخول
- عدم وجود حساب أدمن صحيح في قاعدة البيانات

## ✅ الحل السريع

### 1. إنشاء حساب أدمن جديد
```bash
npm run create-admin
```

### 2. اختبار تسجيل الدخول
```bash
npm run test-login
```

### 3. تسجيل الدخول
- **الرابط**: http://localhost:3000/login
- **البريد**: admin@hackathon.com
- **كلمة المرور**: admin123

## 🔧 إذا لم يعمل الحل أعلاه

### إعادة إعداد قاعدة البيانات
```bash
# إعادة إعداد قاعدة البيانات
npm run dev:setup

# إنشاء أدمن جديد
npm run create-admin

# اختبار تسجيل الدخول
npm run test-login
```

## 🛠️ للتأكد من الإعداد

### فحص قاعدة البيانات
```bash
# فتح Prisma Studio
npm run dev:db:studio
```

### فحص المستخدمين
1. اذهب إلى جدول `User`
2. ابحث عن `admin@hackathon.com`
3. تأكد من وجود `password` مشفر
4. تأكد من `role = admin`

## 🚀 للنشر على Render

### 1. تنظيف المشروع
```bash
npm run cleanup
```

### 2. إعداد النشر
```bash
npm run prepare-render
```

### 3. رفع على GitHub
```bash
git add .
git commit -m "Fixed admin login and cleaned project"
git push origin main
```

## 📋 معلومات الأدمن النهائية

- **البريد الإلكتروني**: `admin@hackathon.com`
- **كلمة المرور**: `admin123`
- **الدور**: `admin`
- **الحالة**: `isActive: true`
- **التحقق**: `emailVerified: true`

## 🔍 استكشاف الأخطاء

### خطأ في قاعدة البيانات
```bash
# إعادة إنشاء قاعدة البيانات
rm dev.db
npm run dev:setup
npm run create-admin
```

### خطأ في كلمة المرور
```bash
# إعادة تعيين كلمة المرور
npm run test-login
```

### خطأ في الاتصال
```bash
# فحص الاتصال
npm run prepare-render
```

---

**🎉 بعد تطبيق هذه الخطوات، ستتمكن من تسجيل الدخول بنجاح!**
