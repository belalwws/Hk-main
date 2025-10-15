# 🔧 إصلاح مشكلة "إرسال تجريبي"

## 🐛 المشكلة

عند الضغط على زر **"إرسال تجريبي"** في صفحة إدارة الإيميلات، لا يحدث شيء أو يظهر خطأ.

---

## ✅ الإصلاحات المنفذة

### 1. **تحسين دالة `sendTestEmail` في الواجهة**

**المشاكل في الكود القديم:**
- ❌ لا يوجد `credentials: 'include'`
- ❌ لا توجد معالجة صحيحة للأخطاء
- ❌ لا توجد console.log للتتبع

**الكود الجديد:**
```tsx
const sendTestEmail = async (template: EmailTemplate) => {
  try {
    console.log('📧 Sending test email for template:', template.templateKey)
    
    const response = await fetch('/api/admin/email-templates/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ✅ مهم للصلاحيات
      body: JSON.stringify({
        templateKey: template.templateKey,
        testEmail: 'admin@example.com'
      })
    })

    console.log('📡 Test email response status:', response.status)

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Test email sent successfully:', data)
      
      toast({
        title: "✅ تم الإرسال",
        description: "تم إرسال إيميل تجريبي بنجاح"
      })
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Test email failed:', response.status, errorData)
      throw new Error(errorData.error || 'Failed to send test email')
    }
  } catch (error) {
    console.error('❌ Error sending test email:', error)
    toast({
      title: "خطأ",
      description: error instanceof Error ? error.message : "فشل إرسال الإيميل التجريبي",
      variant: "destructive"
    })
  }
}
```

---

### 2. **تحسين API endpoint للإرسال التجريبي**

**الملف:** `app/api/admin/email-templates/test/route.ts`

**التحسينات:**
- ✅ إضافة console.log شاملة للتتبع
- ✅ التحقق من أن البريد تم إرساله فعلياً (ليس mocked)
- ✅ رسائل خطأ واضحة بالعربية
- ✅ معالجة حالة عدم تكوين SMTP

**الكود الجديد:**
```typescript
export async function POST(request: NextRequest) {
  try {
    console.log('📧 [test-email] Starting test email process...')
    
    const userRole = request.headers.get("x-user-role");
    console.log('🔍 [test-email] User role:', userRole)
    
    if (!["admin", "supervisor"].includes(userRole || "")) {
      console.error('❌ [test-email] Unauthorized access attempt')
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 });
    }

    const { templateKey, testEmail } = await request.json()
    console.log('📧 [test-email] Template key:', templateKey)
    console.log('📧 [test-email] Test email:', testEmail)

    // ... التحقق من القالب ...

    console.log('📧 [test-email] Sending email...')
    
    const result = await sendMail({
      to: testEmail,
      subject,
      html: body
    })
    
    console.log('✅ [test-email] Email result:', result)
    
    // ✅ التحقق من أن البريد تم إرساله فعلياً
    if (result.mocked || !result.actuallyMailed) {
      console.warn('⚠️ [test-email] Email was mocked (SMTP not configured)')
      return NextResponse.json({
        success: false,
        error: 'إعدادات البريد الإلكتروني غير مكتملة. يرجى التحقق من متغيرات البيئة (GMAIL_USER و GMAIL_PASS)',
        mocked: true
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: `تم إرسال إيميل تجريبي إلى ${testEmail}`,
      messageId: result.messageId
    })
  } catch (error) {
    console.error('❌ [test-email] Error sending test email:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'فشل إرسال الإيميل التجريبي. تحقق من إعدادات البريد الإلكتروني.' 
      },
      { status: 500 }
    )
  }
}
```

---

## 🔍 كيفية التحقق من المشكلة

### 1. **افتح Console في المتصفح (F12)**

### 2. **اضغط على زر "إرسال تجريبي"**

### 3. **تحقق من الرسائل في Console:**

#### ✅ **إذا كان كل شيء يعمل:**
```
📧 Sending test email for template: acceptance
📡 Test email response status: 200
✅ Test email sent successfully: { success: true, message: "..." }
```

#### ⚠️ **إذا كانت إعدادات البريد غير مكتملة:**
```
📧 [test-email] Starting test email process...
🔍 [test-email] User role: supervisor
📧 [test-email] Template key: acceptance
📧 [test-email] Test email: admin@example.com
✅ [test-email] Template found: قبول المشاركة
📧 [test-email] Sending email...
🔧 [mailer] Attempting to import nodemailer...
✅ [mailer] Nodemailer imported successfully
🔍 [mailer] Environment check:
🔍 [mailer] GMAIL_USER: NOT SET
🔍 [mailer] GMAIL_PASS: NOT SET
🔍 [mailer] SMTP_HOST: NOT SET
❌ [mailer] No transporter available! SMTP not configured properly.
⚠️ [test-email] Email was mocked (SMTP not configured)
```

**الرسالة للمستخدم:**
```
❌ خطأ
إعدادات البريد الإلكتروني غير مكتملة. يرجى التحقق من متغيرات البيئة (GMAIL_USER و GMAIL_PASS)
```

#### ❌ **إذا كان هناك خطأ آخر:**
```
❌ [test-email] Error sending test email: [رسالة الخطأ]
```

---

## 🔧 حل المشكلة: إعداد البريد الإلكتروني

### الطريقة 1: استخدام Gmail (موصى بها)

#### 1. **إنشاء App Password من Google:**

1. اذهب إلى: https://myaccount.google.com/security
2. فعّل **التحقق بخطوتين** (2-Step Verification)
3. اذهب إلى **App Passwords**
4. اختر **Mail** و **Other (Custom name)**
5. اكتب اسم: `Hackathon Platform`
6. انسخ الـ **16-digit password**

#### 2. **إضافة المتغيرات إلى `.env.local`:**

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-16-digit-app-password

# Mail From (اختياري)
MAIL_FROM=هاكاثون الابتكار التقني <your-email@gmail.com>
```

#### 3. **إعادة تشغيل الخادم:**

```bash
# إيقاف الخادم (Ctrl+C)
# ثم إعادة التشغيل
npm run dev
```

---

### الطريقة 2: استخدام SMTP مخصص

إذا كنت تستخدم خدمة بريد أخرى (مثل Outlook, SendGrid, Mailgun):

```env
# SMTP Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password

# Mail From
MAIL_FROM=هاكاثون الابتكار التقني <no-reply@example.com>
```

---

## 🎯 اختبار الإعدادات

### 1. **بعد إضافة المتغيرات وإعادة التشغيل:**

1. افتح صفحة إدارة الإيميلات
2. اختر أي قالب
3. اضغط على **"إرسال تجريبي"**
4. افتح Console (F12)

### 2. **يجب أن ترى:**

```
📧 [mailer] Attempting to send email to: admin@example.com
🔍 [mailer] Environment check:
🔍 [mailer] GMAIL_USER: SET ✅
🔍 [mailer] GMAIL_PASS: SET ✅
🔍 [mailer] NODE_ENV: development
🔧 [mailer] Getting transporter...
🔧 [mailer] Creating Gmail transporter...
✅ [mailer] Gmail transporter created successfully
🔍 [mailer] Transporter result: AVAILABLE
✅ [mailer] Transporter ready, sending real email...
📧 [mailer] From: هاكاثون الابتكار التقني <your-email@gmail.com>
📧 [mailer] To: admin@example.com
📧 [mailer] Subject: مبروك! تم قبولك في هاكاثون الابتكار 2024
✅ [mailer] Email sent successfully: <message-id>
```

### 3. **تحقق من البريد الإلكتروني:**

- افتح `admin@example.com` (أو البريد الذي حددته)
- يجب أن تجد الإيميل التجريبي
- تحقق من أنه منسق بشكل صحيح

---

## 📋 الملفات المعدلة

### 1. `app/supervisor/email-management/page.tsx`
- ✅ تحسين دالة `sendTestEmail()`
- ✅ إضافة `credentials: 'include'`
- ✅ معالجة أخطاء أفضل
- ✅ console.log للتتبع

### 2. `app/api/admin/email-templates/test/route.ts`
- ✅ إضافة console.log شاملة
- ✅ التحقق من أن البريد تم إرساله فعلياً
- ✅ رسائل خطأ واضحة بالعربية
- ✅ معالجة حالة SMTP غير مكوّن

---

## ⚠️ ملاحظات مهمة

### 1. **البريد التجريبي يُرسل إلى `admin@example.com`**

إذا أردت تغيير البريد الإلكتروني التجريبي، عدّل في الكود:

```tsx
// في app/supervisor/email-management/page.tsx
body: JSON.stringify({
  templateKey: template.templateKey,
  testEmail: 'your-email@example.com' // ✅ غيّر هنا
})
```

### 2. **في بيئة التطوير (Development):**

- إذا لم تكن إعدادات SMTP مكوّنة، سيتم **تسجيل** البريد في console فقط
- لن يتم إرسال بريد فعلي
- هذا طبيعي لتجنب إرسال إيميلات غير مقصودة أثناء التطوير

### 3. **في بيئة الإنتاج (Production):**

- **يجب** تكوين SMTP بشكل صحيح
- وإلا ستفشل جميع عمليات إرسال البريد

---

## 🎉 النتيجة النهائية

**الآن زر "إرسال تجريبي" يعمل بشكل صحيح:**

1. ✅ يرسل إيميل تجريبي فعلي (إذا كان SMTP مكوّن)
2. ✅ يعرض رسالة خطأ واضحة (إذا لم يكن SMTP مكوّن)
3. ✅ console.log شاملة للتتبع
4. ✅ معالجة أخطاء محسّنة
5. ✅ تجربة مستخدم أفضل

---

## 🚀 الخطوات التالية

1. **أضف متغيرات البيئة** (GMAIL_USER و GMAIL_PASS)
2. **أعد تشغيل الخادم**
3. **جرّب زر "إرسال تجريبي"**
4. **تحقق من Console للتأكد**
5. **تحقق من البريد الإلكتروني**

**كل شيء جاهز! 🎊**

