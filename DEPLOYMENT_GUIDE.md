# 🚀 دليل النشر على Render

## 1️⃣ إعداد قاعدة البيانات:
1. اذهب إلى Render Dashboard
2. أنشئ PostgreSQL database جديد
3. انسخ DATABASE_URL

## 2️⃣ إعداد Web Service:
1. أنشئ Web Service جديد
2. اربطه بـ GitHub repository
3. استخدم الإعدادات التالية:

### Build Command:
```
npm install && npx prisma generate && npm run build
```

### Start Command:
```
npm start
```

## 3️⃣ Environment Variables:
انسخ المتغيرات من .env.production وأضفها في Render:

- DATABASE_URL (من PostgreSQL database)
- JWT_SECRET (مفتاح قوي عشوائي)
- GMAIL_USER
- GMAIL_PASS
- MAIL_FROM
- NODE_ENV=production

## 4️⃣ بعد النشر:
1. شغل Migration:
```
npx prisma migrate deploy
```

2. أنشئ Admin account:
```
npm run db:seed-admin
```

## 5️⃣ اختبار النظام:
- تسجيل دخول Admin
- إنشاء هاكاثون
- إنشاء محكمين
- اختبار إرسال الإيميلات

✅ المشروع جاهز للإنتاج!
