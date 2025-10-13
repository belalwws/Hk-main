# نظام إدارة الإيميلات - Email Management System

## 📧 نظرة عامة

تم إضافة نظام شامل لإدارة قوالب الإيميلات التلقائية وإرسال إيميلات مخصصة في المنصة.

## 🎯 المميزات الرئيسية

### 1. **إدارة قوالب الإيميلات**
- تحرير كامل لجميع قوالب الإيميلات التلقائية
- معاينة فورية للقوالب
- نظام متغيرات ديناميكي `{{variable}}`
- تصنيف القوالب حسب الفئة (مشاركين، محكمين، مشرفين، شهادات، عام)

### 2. **إرسال إيميلات مخصصة**
- إرسال لجميع المستخدمين
- إرسال لمشاركي هاكاثون محدد
- إرسال للمحكمين فقط
- إرسال للمشرفين فقط
- محرر نصي مع معاينة

### 3. **إيميلات تجريبية**
- إرسال إيميل تجريبي لأي قالب
- استبدال تلقائي للمتغيرات بقيم تجريبية

## 📁 الملفات المُضافة

### قاعدة البيانات
```prisma
model EmailTemplate {
  id            String   @id @default(cuid())
  templateKey   String   @unique
  nameAr        String
  nameEn        String
  subject       String
  bodyHtml      String   @db.Text
  bodyText      String?  @db.Text
  category      String
  variables     Json?
  isActive      Boolean  @default(true)
  isSystem      Boolean  @default(false)
  description   String?
  lastEditedBy  String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### واجهة المستخدم
- **`app/admin/email-management/page.tsx`**: صفحة إدارة الإيميلات الرئيسية
  - تبويبات حسب الفئة (مشاركين، محكمين، مشرفين، فرق، شهادات، عام)
  - محرر قوالب مع معاينة
  - إرسال إيميلات مخصصة
  - بحث في القوالب

### APIs
1. **`GET /api/admin/email-templates`**: جلب جميع القوالب
2. **`PUT /api/admin/email-templates`**: تحديث قالب
3. **`POST /api/admin/email-templates`**: إنشاء قالب جديد
4. **`DELETE /api/admin/email-templates`**: حذف قالب (غير أساسي)
5. **`POST /api/admin/email-templates/initialize`**: تهيئة القوالب الافتراضية
6. **`POST /api/admin/email-templates/test`**: إرسال إيميل تجريبي
7. **`POST /api/admin/email-templates/send-custom`**: إرسال إيميل مخصص

## 📋 القوالب الافتراضية

### 1. **تأكيد التسجيل** (`registration_confirmation`)
- **الفئة**: participant
- **المتغيرات**: `participantName`, `participantEmail`, `hackathonTitle`, `registrationDate`, `teamRole`
- **الوصف**: يُرسل عند تسجيل مشارك جديد

### 2. **قبول المشاركة** (`acceptance`)
- **الفئة**: participant
- **المتغيرات**: `participantName`, `hackathonTitle`, `teamRole`, `hackathonDate`, `hackathonLocation`
- **الوصف**: يُرسل عند قبول طلب مشارك

### 3. **رفض المشاركة** (`rejection`)
- **الفئة**: participant
- **المتغيرات**: `participantName`, `hackathonTitle`
- **الوصف**: يُرسل عند رفض طلب مشارك

### 4. **تكوين الفريق** (`team_assignment`)
- **الفئة**: team
- **المتغيرات**: `participantName`, `hackathonTitle`, `teamName`, `teamNumber`, `teamRole`, `teamMembers`
- **الوصف**: يُرسل عند تكوين الفرق

### 5. **دعوة محكم** (`judge_invitation`)
- **الفئة**: judge
- **المتغيرات**: `judgeName`, `judgeEmail`, `hackathonTitle`, `hackathonDate`, `invitationLink`
- **الوصف**: يُرسل لدعوة محكم جديد

### 6. **دعوة مشرف** (`supervisor_invitation`)
- **الفئة**: supervisor
- **المتغيرات**: `supervisorName`, `supervisorEmail`, `department`, `invitationLink`
- **الوصف**: يُرسل لدعوة مشرف جديد

### 7. **شهادة محكم** (`certificate_judge`)
- **الفئة**: certificate
- **المتغيرات**: `judgeName`, `hackathonTitle`, `issueDate`, `certificateUrl`
- **الوصف**: يُرسل للمحكم مع رابط الشهادة

### 8. **شهادة مشرف** (`certificate_supervisor`)
- **الفئة**: certificate
- **المتغيرات**: `supervisorName`, `hackathonTitle`, `issueDate`, `certificateUrl`
- **الوصف**: يُرسل للمشرف مع رابط الشهادة

### 9. **ترحيب بمستخدم جديد** (`welcome_user`)
- **الفئة**: general
- **المتغيرات**: `userName`, `userEmail`, `registrationDate`, `platformUrl`
- **الوصف**: يُرسل عند تسجيل مستخدم جديد

## 🔧 كيفية الاستخدام

### 1. الوصول للنظام
```
https://your-domain.com/admin/email-management
```
أو من لوحة التحكم الرئيسية → زر "إدارة الإيميلات"

### 2. تحرير قالب
1. اختر التبويب المناسب (مشاركين، محكمين، إلخ)
2. اضغط على القالب المراد تحريره
3. عدّل العنوان أو المحتوى
4. استخدم زر "معاينة" لرؤية النتيجة
5. اضغط "حفظ" لحفظ التغييرات

### 3. إرسال إيميل مخصص
1. اختر تبويب "إيميل مخصص"
2. حدد المستلمين (الكل، هاكاثون، محكمين، مشرفين)
3. اكتب العنوان والمحتوى
4. اضغط "إرسال الآن"

### 4. إرسال إيميل تجريبي
1. اختر القالب
2. اضغط "إرسال تجريبي"
3. سيُرسل الإيميل بقيم تجريبية للمتغيرات

## 💡 نظام المتغيرات

### المتغيرات المشتركة
- `{{participantName}}` - اسم المشارك
- `{{participantEmail}}` - البريد الإلكتروني
- `{{hackathonTitle}}` - عنوان الهاكاثون
- `{{hackathonDate}}` - تاريخ الهاكاثون
- `{{hackathonLocation}}` - موقع الهاكاثون
- `{{platformUrl}}` - رابط المنصة

### متغيرات الفرق
- `{{teamName}}` - اسم الفريق
- `{{teamNumber}}` - رقم الفريق
- `{{teamRole}}` - دور المشارك
- `{{teamMembers}}` - قائمة أعضاء الفريق (HTML)

### متغيرات الدعوات
- `{{invitationLink}}` - رابط قبول الدعوة
- `{{expirationDate}}` - تاريخ انتهاء الدعوة

### متغيرات الشهادات
- `{{certificateUrl}}` - رابط تحميل الشهادة
- `{{issueDate}}` - تاريخ الإصدار

## 🎨 تصميم الإيميلات

### قواعد التصميم
1. **اتجاه RTL**: استخدم `direction: rtl` للنصوص العربية
2. **عرض محدود**: `max-width: 600px` للتوافق مع جميع البريد الإلكتروني
3. **ألوان متسقة**: استخدم ألوان المنصة الرئيسية
4. **تدرجات**: استخدم `linear-gradient` للرؤوس الجذابة

### مثال على هيكل HTML
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
  <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">🎉 عنوان الإيميل</h1>
  </div>
  <div style="padding: 30px; background: white;">
    <p>المحتوى هنا...</p>
  </div>
</div>
```

## 📊 الإحصائيات

يمكن إضافة نظام تتبع الإيميلات لاحقًا:
- عدد الإيميلات المُرسلة
- نسبة التسليم
- نسبة الفتح
- آخر إرسال

## 🔐 الأمان

- ✅ جميع الـ APIs محمية (تتطلب صلاحيات Admin)
- ✅ لا يمكن حذف القوالب الأساسية (`isSystem: true`)
- ✅ التحقق من صحة البيانات قبل الحفظ
- ✅ معالجة الأخطاء بشكل آمن

## 🚀 التطويرات المستقبلية

### المرحلة 1 (تم) ✅
- ✅ إضافة جدول EmailTemplate
- ✅ إنشاء صفحة إدارة الإيميلات
- ✅ APIs الأساسية
- ✅ القوالب الافتراضية (9 قوالب)
- ✅ نظام المتغيرات
- ✅ إرسال إيميلات مخصصة

### المرحلة 2 (مقترحة)
- [ ] محرر نصوص متقدم (WYSIWYG)
- [ ] إحصائيات الإرسال والفتح
- [ ] جدولة الإيميلات
- [ ] نماذج إيميلات جاهزة
- [ ] اختبار A/B للقوالب
- [ ] إيميلات متعددة اللغات
- [ ] مرفقات (ملفات PDF، صور)
- [ ] قوالب ديناميكية حسب الهاكاثون

### المرحلة 3 (متقدمة)
- [ ] تكامل مع خدمات SMTP متقدمة (SendGrid, Mailgun)
- [ ] نظام إشعارات فورية (Push Notifications)
- [ ] سجل كامل للإيميلات المُرسلة
- [ ] فلاتر متقدمة للمستلمين
- [ ] قوالب شرطية (if/else)
- [ ] تحليلات متقدمة (Google Analytics)

## 🐛 استكشاف الأخطاء

### المشكلة: القوالب لا تظهر
**الحل**: 
```bash
# التأكد من تطبيق schema
npx prisma db push

# تهيئة القوالب الافتراضية
POST /api/admin/email-templates/initialize
```

### المشكلة: المتغيرات لا تُستبدل
**الحل**: تأكد من استخدام الصيغة الصحيحة `{{variableName}}` بدون مسافات

### المشكلة: فشل إرسال الإيميل
**الحل**: 
1. تحقق من إعدادات SMTP في `.env`
2. تأكد من صحة `GMAIL_USER` و `GMAIL_APP_PASSWORD`
3. تحقق من logs في console

## 📞 الدعم

للمساعدة أو الاستفسارات:
- افتح issue على GitHub
- تواصل مع فريق التطوير

---

**تم التحديث**: 2024
**الإصدار**: 1.0.0
**الحالة**: ✅ جاهز للإنتاج
