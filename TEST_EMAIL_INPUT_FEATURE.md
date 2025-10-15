# ✉️ ميزة إدخال البريد الإلكتروني التجريبي

## 🎯 الهدف

السماح للمشرفين بإدخال البريد الإلكتروني الذي يريدون إرسال الإيميل التجريبي إليه، بدلاً من استخدام بريد ثابت.

---

## ✅ ما تم إنجازه

### 1. **إضافة حقل إدخال البريد الإلكتروني**

**الموقع:** في صفحة تحرير القالب، بجانب أزرار "معاينة" و "إرسال تجريبي"

<augment_code_snippet path="app/supervisor/email-management/page.tsx" mode="EXCERPT">
````tsx
{/* حقل الإيميل التجريبي */}
<div className="flex items-center gap-2 border border-slate-200 rounded-md px-3 py-1.5 bg-white">
  <Mail className="w-4 h-4 text-slate-400" />
  <input
    type="email"
    value={testEmail}
    onChange={(e) => setTestEmail(e.target.value)}
    placeholder="بريد تجريبي..."
    className="outline-none text-sm w-48 text-slate-700 placeholder:text-slate-400"
    dir="ltr"
  />
</div>
````
</augment_code_snippet>

**المميزات:**
- ✅ تصميم بسيط وأنيق
- ✅ أيقونة بريد للتوضيح
- ✅ placeholder واضح
- ✅ اتجاه LTR للبريد الإلكتروني
- ✅ عرض مناسب (48 وحدة)

---

### 2. **إضافة State للبريد التجريبي**

<augment_code_snippet path="app/supervisor/email-management/page.tsx" mode="EXCERPT">
````tsx
const [testEmail, setTestEmail] = useState('') // الإيميل التجريبي
````
</augment_code_snippet>

---

### 3. **تحديث دالة `sendTestEmail` مع التحقق**

**التحسينات:**
- ✅ التحقق من إدخال البريد الإلكتروني
- ✅ التحقق من صحة البريد الإلكتروني (regex validation)
- ✅ رسائل خطأ واضحة بالعربية
- ✅ استخدام البريد المدخل بدلاً من البريد الثابت

<augment_code_snippet path="app/supervisor/email-management/page.tsx" mode="EXCERPT">
````tsx
const sendTestEmail = async (template: EmailTemplate) => {
  // التحقق من إدخال الإيميل
  if (!testEmail || !testEmail.trim()) {
    toast({
      title: "⚠️ تنبيه",
      description: "يرجى إدخال البريد الإلكتروني التجريبي أولاً",
      variant: "destructive"
    })
    return
  }

  // التحقق من صحة الإيميل
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(testEmail.trim())) {
    toast({
      title: "⚠️ تنبيه",
      description: "يرجى إدخال بريد إلكتروني صحيح",
      variant: "destructive"
    })
    return
  }

  try {
    console.log('📧 Sending test email for template:', template.templateKey)
    console.log('📧 Test email address:', testEmail.trim())

    const response = await fetch('/api/admin/email-templates/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        templateKey: template.templateKey,
        testEmail: testEmail.trim() // ✅ استخدام البريد المدخل
      })
    })

    if (response.ok) {
      const data = await response.json()
      toast({
        title: "✅ تم الإرسال",
        description: `تم إرسال إيميل تجريبي إلى ${testEmail.trim()}` // ✅ عرض البريد
      })
    } else {
      // ... معالجة الأخطاء
    }
  } catch (error) {
    // ... معالجة الأخطاء
  }
}
````
</augment_code_snippet>

---

## 🎯 كيفية الاستخدام

### الخطوات:

1. **افتح صفحة إدارة الإيميلات**
   - اذهب إلى `/supervisor/email-management`

2. **اختر قالب للتحرير**
   - اضغط على أي قالب من القائمة

3. **أدخل البريد الإلكتروني التجريبي**
   - في الحقل الجديد بجانب الأزرار
   - مثال: `test@example.com`

4. **اضغط على "إرسال تجريبي"**
   - سيتم التحقق من البريد الإلكتروني
   - إذا كان صحيحاً، سيتم إرسال الإيميل
   - إذا كان غير صحيح، ستظهر رسالة خطأ

---

## ✅ التحققات المضافة

### 1. **التحقق من الإدخال**

إذا لم تدخل بريد إلكتروني:
```
⚠️ تنبيه
يرجى إدخال البريد الإلكتروني التجريبي أولاً
```

### 2. **التحقق من الصحة**

إذا أدخلت بريد غير صحيح (مثل `test` أو `test@` أو `test@example`):
```
⚠️ تنبيه
يرجى إدخال بريد إلكتروني صحيح
```

### 3. **رسالة النجاح**

عند الإرسال بنجاح:
```
✅ تم الإرسال
تم إرسال إيميل تجريبي إلى test@example.com
```

---

## 🔍 Console Logs للتتبع

عند الضغط على "إرسال تجريبي"، ستظهر في Console:

```
📧 Sending test email for template: acceptance
📧 Test email address: test@example.com
📡 Test email response status: 200
✅ Test email sent successfully: {...}
```

---

## 🎨 التصميم

### الحقل الجديد:
- ✅ **أيقونة بريد** (Mail icon) للتوضيح
- ✅ **Border رمادي فاتح** للتناسق مع التصميم
- ✅ **Placeholder واضح**: "بريد تجريبي..."
- ✅ **اتجاه LTR** للبريد الإلكتروني
- ✅ **عرض مناسب** (192px / w-48)
- ✅ **تصميم متناسق** مع باقي الأزرار

### الموقع:
```
[حقل البريد] [معاينة] [إرسال تجريبي] [إعادة للوضع الافتراضي] [حفظ]
```

---

## 📋 الملفات المعدلة

### 1. `app/supervisor/email-management/page.tsx`

**التغييرات:**
- ✅ إضافة `const [testEmail, setTestEmail] = useState('')`
- ✅ إضافة حقل إدخال البريد الإلكتروني في الواجهة
- ✅ تحديث `sendTestEmail()` للتحقق واستخدام البريد المدخل
- ✅ تحسين رسائل النجاح لعرض البريد المرسل إليه

---

## 🧪 اختبار الميزة

### 1. **اختبار الإدخال الفارغ:**
- لا تدخل أي بريد
- اضغط "إرسال تجريبي"
- **النتيجة المتوقعة:** رسالة تنبيه "يرجى إدخال البريد الإلكتروني التجريبي أولاً"

### 2. **اختبار بريد غير صحيح:**
- أدخل: `test`
- اضغط "إرسال تجريبي"
- **النتيجة المتوقعة:** رسالة تنبيه "يرجى إدخال بريد إلكتروني صحيح"

### 3. **اختبار بريد صحيح:**
- أدخل: `test@example.com`
- اضغط "إرسال تجريبي"
- **النتيجة المتوقعة:** 
  - إذا كان SMTP مكوّن: "تم إرسال إيميل تجريبي إلى test@example.com"
  - إذا لم يكن مكوّن: رسالة خطأ واضحة عن إعدادات البريد

### 4. **اختبار مع مسافات:**
- أدخل: `  test@example.com  ` (مع مسافات)
- اضغط "إرسال تجريبي"
- **النتيجة المتوقعة:** يتم إزالة المسافات تلقائياً (`trim()`) والإرسال بنجاح

---

## 🎉 الفوائد

### للمشرفين:
- ✅ **مرونة أكبر** - اختبار على أي بريد إلكتروني
- ✅ **سهولة الاستخدام** - حقل واضح وبسيط
- ✅ **تحقق تلقائي** - لا حاجة للقلق من الأخطاء
- ✅ **رسائل واضحة** - معرفة البريد المرسل إليه

### للنظام:
- ✅ **أمان أفضل** - التحقق من صحة البريد
- ✅ **تجربة مستخدم محسّنة** - رسائل خطأ واضحة
- ✅ **تتبع أفضل** - console.log للبريد المرسل إليه
- ✅ **كود نظيف** - validation منفصل وواضح

---

## 📝 ملاحظات

### 1. **البريد الافتراضي:**
- الحقل يبدأ فارغاً
- يمكن للمشرف إدخال أي بريد يريده

### 2. **التحقق من الصحة:**
- يستخدم regex بسيط: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- يتحقق من وجود `@` ونقطة `.` بعدها
- يزيل المسافات تلقائياً (`trim()`)

### 3. **الأمان:**
- التحقق يتم في الواجهة (Frontend)
- يجب أن يكون هناك تحقق إضافي في الـ API (Backend) - موجود بالفعل

---

## 🚀 الخطوات التالية (اختياري)

### تحسينات مستقبلية محتملة:

1. **حفظ البريد الأخير:**
   ```tsx
   // حفظ في localStorage
   useEffect(() => {
     if (testEmail) {
       localStorage.setItem('lastTestEmail', testEmail)
     }
   }, [testEmail])
   
   // استرجاع عند التحميل
   useEffect(() => {
     const saved = localStorage.getItem('lastTestEmail')
     if (saved) setTestEmail(saved)
   }, [])
   ```

2. **قائمة بريدية سريعة:**
   - إضافة dropdown بإيميلات محفوظة
   - للوصول السريع للإيميلات المستخدمة كثيراً

3. **إرسال لعدة إيميلات:**
   - السماح بإدخال عدة إيميلات مفصولة بفاصلة
   - مثال: `test1@example.com, test2@example.com`

---

## ✅ النتيجة النهائية

**الآن المشرفون يمكنهم:**
- ✅ إدخال أي بريد إلكتروني للاختبار
- ✅ التحقق التلقائي من صحة البريد
- ✅ رؤية رسائل واضحة عن البريد المرسل إليه
- ✅ تجربة مستخدم ممتازة وسلسة

**كل شيء جاهز للاستخدام! 🎊**

