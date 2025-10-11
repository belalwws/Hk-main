# 📋 دليل المشرف الكامل - Supervisor Complete Guide

## 🎯 نظرة عامة

المشرف في نظام الهاكاثون له صلاحيات محددة لإدارة المشاركين والفرق ومتابعة سير العمل.

---

## 🔐 تسجيل الدخول والبدء

### 1. قبول الدعوة
- يتلقى المشرف دعوة عبر البريد الإلكتروني
- يضغط على رابط الدعوة
- يدخل كلمة المرور الجديدة
- يتم تحويله تلقائياً لـ `/supervisor/dashboard`

### 2. إكمال البيانات الشخصية
**مطلوب للوصول الكامل:**
- ✅ الاسم الكامل
- ✅ رقم الهاتف
- ✅ المدينة
- ✅ القسم (إذا كان محدداً)

**اختياري:**
- السيرة الذاتية
- GitHub
- LinkedIn
- Portfolio
- المهارات
- الخبرات

---

## 📊 لوحة التحكم - Dashboard

### الإحصائيات المتاحة:
1. **إجمالي المشاركين** - عدد كل المشاركين
2. **المشاركين المعتمدين** - الذين تمت الموافقة عليهم
3. **المشاركين المعلقين** - في انتظار المراجعة
4. **المشاركين المرفوضين** - تم رفضهم
5. **إجمالي الفرق** - عدد كل الفرق
6. **الفرق النشطة** - الفرق التي تعمل حالياً
7. **المشاريع المكتملة** - الفرق التي سلمت مشاريعها

### النشاطات الأخيرة:
- آخر 10 أنشطة (مشاركين جدد، فرق جديدة، إلخ)
- مع الوقت النسبي (منذ 5 دقائق، منذ ساعة، إلخ)

---

## 👥 إدارة المشاركين - Participants Management

### الصلاحيات:
- ✅ عرض قائمة المشاركين
- ✅ البحث والفلترة
- ✅ تحديث حالة المشارك (موافقة/رفض)
- ✅ عرض تفاصيل المشارك
- ❌ حذف المشاركين (للأدمن فقط)

### الحالات المتاحة:
- `pending` - في انتظار المراجعة
- `approved` - معتمد
- `rejected` - مرفوض

### API Endpoints:
```
GET /api/supervisor/participants
  - Query params: page, limit, status, search
  - Returns: participants list with pagination

PATCH /api/supervisor/participants
  - Body: { participantId, status }
  - Updates participant status
```

---

## 🏆 إدارة الفرق - Teams Management

### الصلاحيات:
- ✅ عرض قائمة الفرق
- ✅ البحث والفلترة
- ✅ عرض أعضاء الفريق
- ✅ تحديث معلومات الفريق
- ✅ متابعة تقدم المشاريع

### معلومات الفريق:
- اسم الفريق
- القائد
- الأعضاء
- المشروع
- حالة التسليم
- التقييمات

### API Endpoints:
```
GET /api/supervisor/teams
  - Query params: page, limit, status, search
  - Returns: teams list with members

PATCH /api/supervisor/teams
  - Body: { teamId, updates }
  - Updates team information
```

---

## 📈 التقارير - Reports

### أنواع التقارير المتاحة:

#### 1. التقرير العام (Overview)
```
GET /api/supervisor/reports?type=overview
```
- إحصائيات شاملة
- نسب الإنجاز
- المقارنات

#### 2. تقرير المشاركين (Participants)
```
GET /api/supervisor/reports?type=participants
```
- توزيع المشاركين حسب الحالة
- توزيع جغرافي
- إحصائيات التسجيل

#### 3. تقرير الفرق (Teams)
```
GET /api/supervisor/reports?type=teams
```
- توزيع الفرق
- حالة المشاريع
- معدلات الإنجاز

#### 4. تقرير التقدم (Progress)
```
GET /api/supervisor/reports?type=progress
```
- تقدم الهاكاثون
- الجداول الزمنية
- المعالم المحققة

---

## 💬 الرسائل - Messages

### الصلاحيات:
- ✅ إرسال رسائل للمشاركين
- ✅ استخدام قوالب جاهزة
- ✅ إرسال جماعي
- ✅ تخصيص الرسائل

### قوالب الرسائل:
1. **رسالة ترحيب** - للمشاركين الجدد
2. **تذكير** - للمواعيد المهمة
3. **إشعار** - للتحديثات
4. **تهنئة** - للإنجازات

### API Endpoints:
```
GET /api/supervisor/messages
  - Returns: message templates

POST /api/supervisor/messages
  - Body: { recipients, template, customMessage }
  - Sends messages to participants
```

---

## 👤 الملف الشخصي - Profile

### البيانات القابلة للتعديل:
- ✅ الاسم
- ✅ رقم الهاتف
- ✅ المدينة
- ✅ السيرة الذاتية
- ✅ الروابط الاجتماعية
- ✅ المهارات والخبرات
- ✅ الصورة الشخصية
- ✅ كلمة المرور

### API Endpoints:
```
GET /api/supervisor/profile
  - Returns: supervisor profile with assignments

PATCH /api/supervisor/profile
  - Body: { name, phone, city, bio, ... }
  - Updates profile information

POST /api/supervisor/profile
  - Body: FormData with image
  - Uploads profile picture
```

---

## 🔒 الصلاحيات والأمان

### الصلاحيات الافتراضية:
```json
{
  "canManageParticipants": true,
  "canManageTeams": true,
  "canViewReports": true,
  "canSendMessages": true,
  "canEditProfile": true
}
```

### الصلاحيات المخصصة:
يمكن للأدمن تخصيص صلاحيات كل مشرف عند الدعوة:
```json
{
  "canManageParticipants": true,
  "canManageTeams": false,
  "canViewReports": true,
  "canSendMessages": false
}
```

### الحماية:
- ✅ JWT Authentication
- ✅ Role-based Access Control
- ✅ Middleware Protection
- ✅ API Route Guards
- ✅ CSRF Protection

---

## 🗂️ هيكل الملفات

### Frontend Pages:
```
app/supervisor/
├── dashboard/page.tsx       # لوحة التحكم
├── participants/page.tsx    # إدارة المشاركين
├── teams/page.tsx           # إدارة الفرق
├── reports/page.tsx         # التقارير
├── messages/page.tsx        # الرسائل
├── profile/page.tsx         # الملف الشخصي
└── layout.tsx               # Layout مشترك
```

### API Routes:
```
app/api/supervisor/
├── dashboard/route.ts       # Dashboard API
├── participants/route.ts    # Participants API
├── teams/route.ts           # Teams API
├── reports/route.ts         # Reports API
├── messages/route.ts        # Messages API
├── profile/route.ts         # Profile API
├── invite/route.ts          # Invitation API
└── accept-invitation/route.ts
```

---

## 🚀 سير العمل - Workflow

### 1. استلام الدعوة
```
Admin → Send Invitation → Email → Supervisor
```

### 2. قبول الدعوة
```
Click Link → Set Password → Create Account → Login
```

### 3. إكمال البيانات
```
Dashboard → Profile Warning → Complete Profile → Full Access
```

### 4. البدء في العمل
```
Dashboard → View Stats → Manage Participants → Review Teams → Send Messages
```

---

## 📱 الواجهات المتاحة

### 1. Dashboard
- `/supervisor/dashboard`
- إحصائيات شاملة
- نشاطات أخيرة
- تنبيهات

### 2. Participants
- `/supervisor/participants`
- قائمة المشاركين
- بحث وفلترة
- إدارة الحالات

### 3. Teams
- `/supervisor/teams`
- قائمة الفرق
- تفاصيل الأعضاء
- متابعة المشاريع

### 4. Reports
- `/supervisor/reports`
- تقارير متنوعة
- رسوم بيانية
- تصدير البيانات

### 5. Messages
- `/supervisor/messages`
- قوالب جاهزة
- إرسال جماعي
- سجل الرسائل

### 6. Profile
- `/supervisor/profile`
- تعديل البيانات
- تغيير الصورة
- تغيير كلمة المرور

---

## ✅ الخطوات التالية

### للمشرف الجديد:
1. ✅ قبول الدعوة
2. ✅ تسجيل الدخول
3. ✅ إكمال البيانات الشخصية
4. ✅ استكشاف لوحة التحكم
5. ✅ مراجعة المشاركين المعلقين
6. ✅ متابعة الفرق
7. ✅ إرسال رسائل ترحيب

### للأدمن:
1. ✅ دعوة المشرفين
2. ✅ تحديد الصلاحيات
3. ✅ تعيين الهاكاثون
4. ✅ متابعة أداء المشرفين

---

## 🆘 المشاكل الشائعة وحلولها

### 1. لا أستطيع الوصول للـ Dashboard
**الحل:** تأكد من إكمال البيانات الشخصية

### 2. لا أرى المشاركين
**الحل:** تأكد من تعيينك لهاكاثون محدد أو أنك مشرف عام

### 3. لا أستطيع تحديث حالة المشارك
**الحل:** تحقق من صلاحياتك مع الأدمن

### 4. الإحصائيات تظهر صفر
**الحل:** تأكد من وجود بيانات في النظام

---

## 📞 الدعم

للمساعدة أو الاستفسارات:
- تواصل مع الأدمن
- راجع التوثيق
- تحقق من سجل الأخطاء

---

**آخر تحديث:** 2025-10-12
**الإصدار:** 1.0.0

