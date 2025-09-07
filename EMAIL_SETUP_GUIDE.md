# دليل إعداد نظام الإيميلات 📧

## الطريقة الأولى: استخدام Gmail (الأسهل) ⭐

### الخطوات:

#### 1. تفعيل المصادقة الثنائية (2FA)
- اذهب إلى [myaccount.google.com](https://myaccount.google.com)
- اختر "الأمان" (Security)
- فعّل "التحقق بخطوتين" (2-Step Verification)

#### 2. إنشاء كلمة مرور التطبيق (App Password)
- في نفس صفحة الأمان، اختر "كلمات مرور التطبيقات" (App passwords)
- اختر "التطبيق" → "بريد" (Mail)
- اختر "الجهاز" → "كمبيوتر Windows"
- انقر "إنشاء" (Generate)
- **احفظ كلمة المرور المكونة من 16 حرف**

#### 3. تحديث ملف .env.local
```env
GMAIL_USER=your-actual-email@gmail.com
GMAIL_PASS=abcd efgh ijkl mnop
MAIL_FROM=هاكاثون الابتكار التقني <your-actual-email@gmail.com>
```

**مهم:** استبدل:
- `your-actual-email@gmail.com` بإيميلك الحقيقي
- `abcd efgh ijkl mnop` بكلمة مرور التطبيق (16 حرف)

---

## الطريقة الثانية: استخدام SMTP مخصص

إذا كنت تفضل استخدام مزود إيميل آخر:

### للـ Outlook/Hotmail:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### للـ Yahoo:
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### لمزودي الاستضافة:
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=no-reply@yourdomain.com
SMTP_PASS=your-email-password
```

---

## اختبار النظام 🧪

1. **احفظ ملف .env.local** مع البيانات الصحيحة
2. **أعد تشغيل الخادم:**
   ```bash
   npm run dev
   ```
3. **اذهب إلى لوحة تحكم الأدمن** → إدارة الرسائل
4. **أرسل رسالة تجريبية**
5. **تحقق من البريد الوارد** (وصندوق الرسائل المزعجة)

---

## استكشاف الأخطاء 🔧

### إذا لم تصل الرسائل:
1. **تحقق من صندوق الرسائل المزعجة (Spam)**
2. **تأكد من صحة كلمة مرور التطبيق**
3. **تأكد من تفعيل المصادقة الثنائية**
4. **تحقق من console logs في المتصفح**

### رسائل الخطأ الشائعة:
- `Invalid login` → كلمة مرور التطبيق خاطئة
- `Username and Password not accepted` → لم يتم تفعيل المصادقة الثنائية
- `Connection timeout` → مشكلة في الشبكة

---

## الأمان 🔒

- **لا تشارك كلمة مرور التطبيق** مع أحد
- **استخدم إيميل مخصص للمشروع** إذا أمكن
- **يمكنك إلغاء كلمة مرور التطبيق** في أي وقت من إعدادات Google

---

## ملاحظات مهمة ⚠️

1. **Gmail لديه حد يومي** لإرسال الرسائل (500 رسالة/يوم للحسابات العادية)
2. **تجنب إرسال رسائل مزعجة** لتجنب حظر الحساب
3. **اختبر النظام أولاً** برسالة واحدة قبل الإرسال الجماعي
4. **احتفظ بنسخة احتياطية** من إعدادات الإيميل
