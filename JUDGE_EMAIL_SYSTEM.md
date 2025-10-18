# نظام الإيميلات الآلية للمحكمين 📧

## التحديثات المنفذة ✅

### 1. إيميل دعوة المحكمين (Judge Invitation Email)

**الملف:** `app/api/admin/judge-invitations/route.ts`

**المميزات:**
- ✅ قالب HTML احترافي بتصميم متدرج اللون (Purple Gradient)
- ✅ نص عربي رسمي ومهني
- ✅ زر "إكمال التسجيل والقبول" مباشر
- ✅ رابط الدعوة قابل للنسخ
- ✅ تاريخ انتهاء الصلاحية
- ✅ قائمة بمهام المحكم
- ✅ نسخة نصية (text) للإيميلات البسيطة

**محتوى الإيميل:**
```
سعادة / [اسم المحكم]
الموضوع / دعوة للمشاركة كعضو لجنة تحكيم

السلام عليكم ورحمة الله وبركاته،،

يسرنا دعوتكم للمشاركة كعضو في لجنة تحكيم [اسم الهاكاثون].

نثمن عالياً خبرتكم ومعرفتكم في المجال، ونؤمن بأن مشاركتكم ستساهم 
بشكل كبير في تقييم المشاريع المبتكرة واختيار الأفضل منها.

[زر: إكمال التسجيل والقبول]

ما يتضمنه دور المحكم:
- مراجعة وتقييم المشاريع المشاركة وفقاً لمعايير محددة
- تقديم ملاحظات بناءة للفرق المشاركة
- المساهمة في اختيار الفائزين
- المشاركة في جلسات التقييم النهائية

⏰ ملاحظة هامة: هذه الدعوة صالحة حتى [التاريخ]

مع خالص التقدير والاحترام،
فريق إدارة الهاكاثون
```

---

### 2. إيميل قبول طلب التحكيم (Judge Approval Email)

**الملف:** `app/api/admin/judge-applications/[id]/route.ts`

**المميزات:**
- ✅ إيميل ترحيبي بعد قبول الطلب
- ✅ بيانات تسجيل الدخول (البريد + كلمة المرور)
- ✅ زر مباشر لتسجيل الدخول
- ✅ تعليمات الخطوات التالية
- ✅ تنبيه بتغيير كلمة المرور
- ✅ تصميم احترافي مع صناديق ملونة

**محتوى الإيميل:**
```
🎉 مبروك! تم قبولك
كعضو في لجنة التحكيم

سعادة / [اسم المحكم]
الموضوع / دعوة للمشاركة كعضو لجنة تحكيم

السلام عليكم ورحمة الله وبركاته،،

يسرنا إبلاغكم بأنه تم قبول طلبكم للمشاركة كعضو في لجنة تحكيم [اسم الهاكاثون].

🔑 بيانات تسجيل الدخول:
   البريد الإلكتروني: [البريد]
   كلمة المرور: [كلمة المرور]

[زر: الدخول إلى لوحة التحكم]

📋 الخطوات التالية:
1. قم بتسجيل الدخول باستخدام البيانات أعلاه
2. يُنصح بتغيير كلمة المرور عند أول تسجيل دخول
3. راجع المشاريع المعينة لك للتقييم
4. قم بتقييم المشاريع وفقاً للمعايير المحددة
5. في حال وجود أي استفسار، يمكنكم التواصل مع إدارة الهاكاثون

نشكر لكم تعاونكم ونتمنى لكم تجربة تحكيم ممتعة ومثمرة.

مع أطيب التحيات،
فريق إدارة الهاكاثون
```

---

### 3. إيميل قبول المشاركين مع واتساب (Participant Approval + WhatsApp)

**الملف:** `app/api/admin/hackathons/[id]/participants/bulk-update/route.ts`

**المميزات:**
- ✅ إيميل قبول المشارك
- ✅ قسم واتساب اختياري (يظهر فقط إذا كان هناك رابط)
- ✅ زر أخضر بتدرج لوني (#25D366)
- ✅ نص "انضم الآن للمجموعة"
- ✅ استخراج رابط الواتساب من `hackathon.socialMedia`

**الكود:**
```javascript
// استخراج رابط الواتساب
let whatsappLink = null
if (hackathon.socialMedia) {
  try {
    const socialMedia = typeof hackathon.socialMedia === 'string' 
      ? JSON.parse(hackathon.socialMedia) 
      : hackathon.socialMedia
    whatsappLink = socialMedia?.whatsapp || null
  } catch (e) {
    console.error('Error parsing socialMedia:', e)
  }
}

// في قالب الإيميل
${whatsappLink ? `
  <div style="background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); ...">
    <h3 style="color: white;">💬 انضم إلى مجموعة الواتساب</h3>
    <a href="${whatsappLink}" class="whatsapp-button">
      انضم الآن للمجموعة
    </a>
  </div>
` : ''}
```

---

## كيفية الاستخدام 📖

### 1. إرسال دعوة محكم جديد

من صفحة `/admin/judges`:
1. اضغط "إرسال دعوة"
2. املأ البيانات:
   - البريد الإلكتروني *
   - الاسم (اختياري)
   - الهاكاثون *
   - مدة الصلاحية (افتراضي: 7 أيام)
3. اضغط "إرسال الدعوة"
4. سيتم إرسال إيميل تلقائي للمحكم

**API Endpoint:**
```typescript
POST /api/admin/judge-invitations
{
  "email": "judge@example.com",
  "name": "أحمد محمد",
  "hackathonId": "hackathon-id",
  "expiresInDays": 7
}
```

---

### 2. قبول طلب تحكيم

من صفحة `/admin/judges`:
1. اضغط "طلبات المحكمين"
2. اختر طلب واضغط "عرض التفاصيل"
3. في قسم "قبول الطلب":
   - أدخل كلمة مرور للحساب الجديد
   - أضف ملاحظات (اختياري)
4. اضغط "قبول وإنشاء الحساب"
5. سيتم:
   - إنشاء حساب المحكم
   - إرسال إيميل بالبيانات تلقائياً

**API Endpoint:**
```typescript
PATCH /api/admin/judge-applications/[id]
{
  "action": "approve",
  "password": "SecurePassword123",
  "reviewNotes": "محكم ممتاز"
}
```

---

### 3. إضافة رابط واتساب للهاكاثون

1. في صفحة تعديل الهاكاثون
2. في حقل `socialMedia`، أدخل JSON:
```json
{
  "whatsapp": "https://chat.whatsapp.com/xxxxx",
  "twitter": "https://twitter.com/xxxxx",
  "facebook": "https://facebook.com/xxxxx"
}
```
3. عند قبول المشاركين، سيظهر زر الواتساب في الإيميل تلقائياً

---

## متطلبات البيئة 🔧

تأكد من وجود هذه المتغيرات في `.env`:

```bash
# Email Configuration
GMAIL_USER="your-email@gmail.com"
GMAIL_PASS="your-app-password-here"

# Application URL
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### كيفية الحصول على App Password من Gmail:

1. اذهب إلى [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (فعّله إذا لم يكن مفعلاً)
3. App Passwords
4. اختر "Mail" و "Other (Custom name)"
5. أدخل اسم التطبيق (مثلاً: "Hackathon Platform")
6. انسخ كلمة المرور المكونة من 16 رقم
7. ضعها في `GMAIL_PASS`

---

## التصميم والألوان 🎨

### قالب دعوة المحكم:
- **الألوان الأساسية:** Purple Gradient (#667eea → #764ba2)
- **الأزرار:** Purple gradient مع ظل
- **التنبيهات:** Orange (#f6ad55)
- **الخطر:** Red (#f56565)

### قالب قبول المحكم:
- **الألوان الأساسية:** Purple Gradient
- **صندوق البيانات:** Blue-Gray (#f7fafc → #edf2f7)
- **التعليمات:** Orange background (#fffaf0)

### قالب قبول المشارك + واتساب:
- **القبول:** Green Gradient
- **الواتساب:** WhatsApp Green (#25D366 → #128C7E)
- **الزر:** Green gradient مع hover effect

---

## الأمان 🔒

### ✅ تم تنفيذها:
- التحقق من صلاحيات الأدمن قبل الإرسال
- تشفير كلمات المرور بـ bcrypt
- Token عشوائي طويل للدعوات (64 حرف hex)
- تاريخ انتهاء للدعوات
- عدم فشل الطلب إذا فشل الإيميل (fallback)

### ⚠️ ملاحظات مهمة:
- لا ترسل كلمات المرور في الـ logs
- استخدم HTTPS فقط في Production
- غيّر `JWT_SECRET` و `NEXTAUTH_SECRET` في Production

---

## الاختبار 🧪

### اختبار دعوة محكم:
```bash
curl -X POST http://localhost:3000/api/admin/judge-invitations \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "test@example.com",
    "name": "Test Judge",
    "hackathonId": "hackathon-id",
    "expiresInDays": 7
  }'
```

### اختبار قبول طلب:
```bash
curl -X PATCH http://localhost:3000/api/admin/judge-applications/app-id \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_ADMIN_TOKEN" \
  -d '{
    "action": "approve",
    "password": "SecurePass123",
    "reviewNotes": "Excellent candidate"
  }'
```

---

## الأخطاء الشائعة وحلولها 🔧

### 1. الإيميل لا يُرسل
**المشكلة:** `Error sending email: Invalid login`
**الحل:**
- تأكد من تفعيل 2-Step Verification في Google
- استخدم App Password وليس كلمة المرور العادية
- تحقق من `GMAIL_USER` و `GMAIL_PASS` في `.env`

### 2. الواتساب لا يظهر
**المشكلة:** قسم الواتساب لا يظهر في إيميل القبول
**الحل:**
- تأكد من وجود `socialMedia` في جدول `hackathon`
- تحقق من صحة JSON: `{"whatsapp": "https://..."}`
- راجع console logs للتأكد من عدم وجود خطأ في parsing

### 3. رابط الدعوة لا يعمل
**المشكلة:** `Token expired` أو `Invalid token`
**الحل:**
- تحقق من تاريخ انتهاء الدعوة
- تأكد من أن `NEXT_PUBLIC_APP_URL` صحيح
- تحقق من أن الـ token موجود في قاعدة البيانات

---

## التحسينات المستقبلية 🚀

- [ ] إضافة preview للإيميل قبل الإرسال
- [ ] قوالب إيميل قابلة للتخصيص من الأدمن
- [ ] إحصائيات فتح الإيميلات (email tracking)
- [ ] إرسال تذكير قبل انتهاء الدعوة
- [ ] دعم لغات متعددة (EN/AR)
- [ ] قوالب WhatsApp Business API للرسائل
- [ ] إشعارات SMS للمحكمين

---

## الملفات المعدلة 📝

1. ✅ `app/api/admin/judge-invitations/route.ts` - إيميل دعوة المحكمين
2. ✅ `app/api/admin/judge-applications/[id]/route.ts` - إيميل قبول الطلب
3. ✅ `app/api/admin/hackathons/[id]/participants/bulk-update/route.ts` - واتساب في قبول المشاركين

---

## الدعم 📞

للمشاكل أو الاستفسارات:
- راجع console logs في Terminal و Browser
- تحقق من `.env` variables
- راجع Prisma schema للتأكد من الحقول
- اختبر إرسال إيميل يدوي من Gmail للتأكد من الإعدادات

---

**آخر تحديث:** ${new Date().toLocaleDateString('ar-SA')}
**الإصدار:** 1.0.0
**الحالة:** ✅ Production Ready
