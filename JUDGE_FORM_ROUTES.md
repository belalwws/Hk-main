# 🗺️ روابط نظام فورم المحكمين

## 📍 الروابط الرئيسية

### **للأدمن**

#### **1. تخصيص تصميم الفورم**
```
/admin/judge-form-design/[hackathonId]
```
**مثال:**
```
/admin/judge-form-design/hack123
```

**الوصول:**
- من صفحة الهاكاثون
- أو مباشرة بإدخال الرابط

**الميزات:**
- 🎨 تخصيص الألوان
- 📸 رفع صورة غلاف
- ✍️ تخصيص النصوص
- 💻 CSS مخصص
- 👁️ معاينة مباشرة
- 📋 نسخ رابط الفورم

---

#### **2. إدارة الطلبات**
```
/admin/judges
```

**الوصول:**
- من القائمة الجانبية → "المحكمين"
- اضغط زر "الطلبات (X)"

**الميزات:**
- 📋 عرض جميع الطلبات
- 👁️ عرض تفاصيل كل طلب
- ✅ قبول الطلبات
- ❌ رفض الطلبات
- 📝 إضافة ملاحظات

---

### **للمحكمين**

#### **فورم التقديم**
```
/judge/apply/[hackathonId]
```

**مثال:**
```
/judge/apply/hack123
```

**الوصول:**
- من الرابط الذي يشاركه الأدمن

**الميزات:**
- 📸 رفع صورة شخصية
- ✍️ ملء البيانات
- 📤 إرسال الطلب
- ✅ رسالة نجاح

---

## 🔗 أمثلة كاملة

### **مثال 1: هاكاثون الابتكار**
```
Hackathon ID: innovation2024

تخصيص الفورم:
https://yoursite.com/admin/judge-form-design/innovation2024

فورم التقديم:
https://yoursite.com/judge/apply/innovation2024

إدارة الطلبات:
https://yoursite.com/admin/judges
```

### **مثال 2: هاكاثون الذكاء الاصطناعي**
```
Hackathon ID: ai-hack-2024

تخصيص الفورم:
https://yoursite.com/admin/judge-form-design/ai-hack-2024

فورم التقديم:
https://yoursite.com/judge/apply/ai-hack-2024

إدارة الطلبات:
https://yoursite.com/admin/judges
```

---

## 📊 API Endpoints

### **للمحكمين**

#### **إرسال طلب**
```http
POST /api/judge/apply
Content-Type: multipart/form-data

Body:
- hackathonId: string (required)
- name: string (required)
- email: string (required)
- phone: string (optional)
- bio: string (optional)
- expertise: string (optional)
- experience: string (optional)
- linkedin: string (optional)
- twitter: string (optional)
- website: string (optional)
- profileImage: File (optional)
```

---

### **للأدمن**

#### **جلب جميع الطلبات**
```http
GET /api/admin/judge-applications
Query Parameters:
- status: 'pending' | 'approved' | 'rejected' (optional)
- hackathonId: string (optional)

Response:
{
  applications: [...],
  stats: {
    total: number,
    pending: number,
    approved: number,
    rejected: number
  }
}
```

#### **قبول طلب**
```http
PATCH /api/admin/judge-applications/[id]
Content-Type: application/json

Body:
{
  action: 'approve',
  password: string (required),
  reviewNotes: string (optional)
}

Response:
{
  success: true,
  user: {...},
  judge: {...},
  application: {...}
}
```

#### **رفض طلب**
```http
PATCH /api/admin/judge-applications/[id]
Content-Type: application/json

Body:
{
  action: 'reject',
  rejectionReason: string (required),
  reviewNotes: string (optional)
}

Response:
{
  success: true,
  application: {...}
}
```

#### **حذف طلب**
```http
DELETE /api/admin/judge-applications/[id]

Response:
{
  success: true
}
```

#### **جلب تصميم الفورم**
```http
GET /api/admin/judge-form-design/[hackathonId]

Response:
{
  design: {
    id: string,
    hackathonId: string,
    isEnabled: boolean,
    coverImage: string?,
    primaryColor: string,
    secondaryColor: string,
    accentColor: string,
    backgroundColor: string,
    title: string?,
    description: string?,
    welcomeMessage: string?,
    successMessage: string?,
    logoUrl: string?,
    customCss: string?
  }
}
```

#### **حفظ تصميم الفورم**
```http
POST /api/admin/judge-form-design/[hackathonId]
Content-Type: multipart/form-data

Body:
- isEnabled: boolean
- primaryColor: string
- secondaryColor: string
- accentColor: string
- backgroundColor: string
- title: string (optional)
- description: string (optional)
- welcomeMessage: string (optional)
- successMessage: string (optional)
- logoUrl: string (optional)
- customCss: string (optional)
- coverImage: File (optional)

Response:
{
  success: true,
  design: {...}
}
```

---

## 🎯 سير العمل السريع

### **للأدمن:**
```
1. افتح: /admin/judge-form-design/[hackathonId]
2. خصص التصميم
3. احفظ
4. انسخ الرابط
5. شارك الرابط
6. افتح: /admin/judges
7. اضغط "الطلبات"
8. راجع واقبل/ارفض
```

### **للمحكم:**
```
1. افتح الرابط المشارك
2. املأ البيانات
3. ارفع صورتك
4. أرسل الطلب
5. انتظر المراجعة
```

---

## 📱 الوصول السريع

### **من لوحة التحكم**
```
Dashboard → المحكمين → "الطلبات"
Dashboard → الهاكاثونات → [اختر هاكاثون] → "تخصيص فورم المحكمين"
```

### **من القائمة الجانبية**
```
القائمة → المحكمين → "الطلبات"
القائمة → الهاكاثونات → [اختر هاكاثون] → "تخصيص الفورم"
```

---

## 🔍 البحث والفلترة

### **فلترة الطلبات حسب الحالة**
```javascript
// في الكود
fetch('/api/admin/judge-applications?status=pending')
fetch('/api/admin/judge-applications?status=approved')
fetch('/api/admin/judge-applications?status=rejected')
```

### **فلترة الطلبات حسب الهاكاثون**
```javascript
fetch('/api/admin/judge-applications?hackathonId=hack123')
```

### **فلترة مركبة**
```javascript
fetch('/api/admin/judge-applications?status=pending&hackathonId=hack123')
```

---

## 🎨 تخصيص الألوان

### **الألوان الافتراضية**
```css
Primary Color:    #01645e  /* أخضر داكن */
Secondary Color:  #3ab666  /* أخضر فاتح */
Accent Color:     #c3e956  /* أخضر ليموني */
Background Color: #ffffff  /* أبيض */
```

### **أمثلة ألوان أخرى**

#### **أزرق احترافي**
```css
Primary:    #0066cc
Secondary:  #00aaff
Accent:     #ffcc00
Background: #ffffff
```

#### **أحمر حيوي**
```css
Primary:    #cc0000
Secondary:  #ff3333
Accent:     #ffcc00
Background: #ffffff
```

#### **بنفسجي عصري**
```css
Primary:    #6600cc
Secondary:  #9933ff
Accent:     #ffcc00
Background: #ffffff
```

---

## 📋 قائمة التحقق السريعة

### **قبل مشاركة الفورم:**
- [ ] تم تخصيص التصميم
- [ ] تم اختبار الفورم
- [ ] تم نسخ الرابط الصحيح

### **عند مراجعة طلب:**
- [ ] تم مراجعة جميع البيانات
- [ ] تم اتخاذ القرار
- [ ] تم إضافة ملاحظات

---

## 🚀 ابدأ الآن!

**الخطوة 1:** افتح `/admin/judge-form-design/[hackathonId]`  
**الخطوة 2:** خصص الفورم  
**الخطوة 3:** شارك الرابط  
**الخطوة 4:** راجع الطلبات في `/admin/judges`  

**بالتوفيق! 🎉**

