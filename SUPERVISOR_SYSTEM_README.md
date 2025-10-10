# نظام إدارة المشرفين - دليل شامل

## نظرة عامة

تم تطوير نظام إدارة المشرفين كإضافة شاملة لمنصة إدارة الهاكاثونات. يوفر هذا النظام دوراً وسطياً بين الأدمن والمشاركين، مما يتيح إدارة أكثر فعالية ومرونة للهاكاثونات.

## الميزات الرئيسية

### 🔐 نظام الدعوات الآمن
- **دعوات بالبريد الإلكتروني**: الأدمن يرسل دعوات آمنة للمشرفين المحتملين
- **روابط آمنة**: كل دعوة تحتوي على token فريد مشفر
- **انتهاء صلاحية**: الدعوات تنتهي صلاحيتها خلال 7 أيام
- **إنشاء كلمة مرور**: المشرف ينشئ كلمة مروره الخاصة عند قبول الدعوة

### 👥 إدارة المشاركين
- **عرض قائمة المشاركين**: مع إمكانية البحث والتصفية
- **إدارة حالات التسجيل**: موافقة/رفض طلبات المشاركة
- **إرسال ملاحظات**: إضافة تعليقات عند الموافقة أو الرفض
- **إحصائيات شاملة**: عدد المشاركين حسب الحالة

### 🏆 إدارة الفرق
- **عرض الفرق والمشاريع**: معلومات مفصلة عن كل فريق
- **تحديث معلومات الفرق**: تعديل أسماء الفرق ومعلومات المشاريع
- **متابعة التقدم**: حالة المشاريع وروابط GitHub
- **إحصائيات الفرق**: معدل الإنجاز والتقييمات

### 📊 نظام التقارير
- **تقارير شاملة**: إحصائيات المشاركين والفرق
- **تحليل البيانات**: توزيع المشاركين حسب المدن والمهارات
- **تقارير التقدم**: متابعة سير الهاكاثون
- **تصدير البيانات**: إمكانية تصدير التقارير

### 💬 نظام الرسائل
- **قوالب جاهزة**: رسائل معدة مسبقاً للمناسبات المختلفة
- **رسائل مخصصة**: إمكانية كتابة رسائل مخصصة
- **إرسال جماعي**: للمشاركين المختارين أو جميع المشاركين
- **متغيرات ديناميكية**: استخدام {name}, {email}, {date} في الرسائل

### 👤 الملف الشخصي
- **إدارة المعلومات الشخصية**: تحديث البيانات والصورة الشخصية
- **تغيير كلمة المرور**: بأمان مع التحقق من كلمة المرور الحالية
- **روابط التواصل الاجتماعي**: GitHub, LinkedIn, الموقع الشخصي
- **معلومات مهنية**: المهارات والخبرة

## البنية التقنية

### قاعدة البيانات
```prisma
model Supervisor {
  id          String   @id @default(cuid())
  userId      String
  hackathonId String?  // null = مشرف عام
  permissions Json?    // صلاحيات مخصصة
  department  String?  // القسم المسؤول عنه
  isActive    Boolean  @default(true)
  lastLogin   DateTime?
  assignedAt  DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User      @relation(fields: [userId], references: [id])
  hackathon   Hackathon? @relation(fields: [hackathonId], references: [id])
  
  @@unique([userId, hackathonId])
}

model SupervisorInvitation {
  id          String   @id @default(cuid())
  email       String
  name        String?
  hackathonId String?
  token       String   @unique
  status      String   @default("pending") // pending, accepted, expired, cancelled
  invitedBy   String
  permissions Json?
  department  String?
  expiresAt   DateTime
  acceptedAt  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  inviter     User      @relation(fields: [invitedBy], references: [id])
  hackathon   Hackathon? @relation(fields: [hackathonId], references: [id])
}
```

### API Endpoints

#### نظام الدعوات
- `POST /api/supervisor/invite` - إرسال دعوة جديدة
- `GET /api/supervisor/invite` - عرض الدعوات المعلقة
- `POST /api/supervisor/accept-invitation` - قبول الدعوة
- `GET /api/supervisor/invitation/[token]` - عرض تفاصيل الدعوة

#### إدارة المشاركين
- `GET /api/supervisor/participants` - عرض المشاركين
- `PATCH /api/supervisor/participants` - تحديث حالة المشارك
- `POST /api/supervisor/participants` - إحصائيات المشاركين

#### إدارة الفرق
- `GET /api/supervisor/teams` - عرض الفرق
- `PATCH /api/supervisor/teams` - تحديث معلومات الفريق
- `POST /api/supervisor/teams` - إحصائيات الفرق

#### التقارير
- `GET /api/supervisor/reports?type=overview` - تقرير عام
- `GET /api/supervisor/reports?type=participants` - تقرير المشاركين
- `GET /api/supervisor/reports?type=teams` - تقرير الفرق

#### الرسائل
- `GET /api/supervisor/messages` - قوالب الرسائل
- `POST /api/supervisor/messages` - إرسال رسالة
- `PATCH /api/supervisor/messages` - عرض المشاركين للاختيار

#### الملف الشخصي
- `GET /api/supervisor/profile` - عرض الملف الشخصي
- `PATCH /api/supervisor/profile` - تحديث الملف الشخصي
- `POST /api/supervisor/profile` - رفع الصورة الشخصية

### الأمان والحماية

#### نظام المصادقة
- **JWT Tokens**: مع httpOnly cookies
- **Role-based Access**: التحقق من الدور في كل طلب
- **Middleware Protection**: حماية جميع routes المشرف

#### أمان الدعوات
- **Crypto-secure Tokens**: استخدام crypto.randomBytes(32)
- **Expiration Dates**: انتهاء صلاحية خلال 7 أيام
- **One-time Use**: كل token يُستخدم مرة واحدة فقط
- **Email Verification**: التحقق من البريد الإلكتروني

#### حماية البيانات
- **Password Hashing**: bcryptjs مع 12 rounds
- **Input Validation**: التحقق من جميع المدخلات
- **SQL Injection Protection**: استخدام Prisma ORM
- **XSS Protection**: تنظيف المدخلات

## دليل الاستخدام

### للأدمن: دعوة مشرف جديد

1. **الذهاب لصفحة إدارة المشرفين**
   ```
   /admin/supervisors
   ```

2. **النقر على "دعوة مشرف جديد"**

3. **ملء بيانات الدعوة**:
   - الاسم الكامل
   - البريد الإلكتروني
   - القسم (اختياري)
   - الهاكاثون المحدد (اختياري)

4. **إرسال الدعوة**
   - سيتم إرسال بريد إلكتروني للمشرف
   - يحتوي على رابط آمن لقبول الدعوة

### للمشرف: قبول الدعوة

1. **فتح الرابط من البريد الإلكتروني**

2. **إنشاء كلمة مرور**:
   - كتابة كلمة مرور قوية (6 أحرف على الأقل)
   - تأكيد كلمة المرور

3. **تسجيل الدخول**:
   - سيتم توجيهك لـ dashboard المشرف
   - يمكنك إكمال ملفك الشخصي

### استخدام dashboard المشرف

#### الصفحة الرئيسية
- **إحصائيات سريعة**: عدد المشاركين والفرق
- **النشاطات الأخيرة**: آخر التحديثات
- **إجراءات سريعة**: روابط للمهام الشائعة

#### إدارة المشاركين
- **البحث والتصفية**: حسب الاسم أو الحالة
- **الموافقة/الرفض**: مع إمكانية إضافة ملاحظات
- **عرض التفاصيل**: معلومات كاملة عن كل مشارك

#### إدارة الفرق
- **عرض المشاريع**: حالة كل مشروع وروابطه
- **تحديث المعلومات**: تعديل أسماء الفرق والمشاريع
- **متابعة التقدم**: نسبة الإنجاز والتقييمات

#### إرسال الرسائل
- **اختيار المستلمين**: جميع المشاركين أو مجموعة محددة
- **استخدام القوالب**: رسائل جاهزة للمناسبات المختلفة
- **المعاينة**: مراجعة الرسالة قبل الإرسال

## التطوير والصيانة

### إضافة ميزات جديدة

#### إضافة صلاحية جديدة
1. تحديث نموذج `Supervisor` في `schema.prisma`
2. إضافة التحقق في middleware
3. تحديث واجهة المستخدم

#### إضافة قالب رسالة جديد
1. تحديث `templates` في `/api/supervisor/messages/route.ts`
2. إضافة القالب لقائمة الاختيار

### الاختبار

#### اختبار نظام الدعوات
```bash
# اختبار إرسال دعوة
curl -X POST http://localhost:3000/api/supervisor/invite \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# اختبار قبول دعوة
curl -X POST http://localhost:3000/api/supervisor/accept-invitation \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_HERE","password":"password123"}'
```

#### اختبار الصلاحيات
- تسجيل دخول كمشرف
- محاولة الوصول لصفحات الأدمن (يجب أن تُرفض)
- اختبار جميع وظائف المشرف

### الأخطاء الشائعة وحلولها

#### "غير مصرح بالوصول"
- التأكد من تسجيل الدخول بحساب مشرف
- التحقق من صحة JWT token
- مراجعة middleware configuration

#### "انتهت صلاحية الدعوة"
- التحقق من تاريخ انتهاء الصلاحية
- إرسال دعوة جديدة من الأدمن

#### مشاكل في إرسال البريد الإلكتروني
- التحقق من إعدادات SMTP
- مراجعة متغيرات البيئة
- اختبار اتصال البريد الإلكتروني

## الخلاصة

نظام إدارة المشرفين يوفر طبقة إضافية من الإدارة والتحكم في الهاكاثونات، مما يتيح:

- **توزيع المسؤوليات**: تقليل العبء على الأدمن
- **إدارة أكثر فعالية**: متابعة أقرب للمشاركين والفرق
- **مرونة في التحكم**: صلاحيات قابلة للتخصيص
- **أمان عالي**: نظام دعوات آمن ومحمي
- **سهولة الاستخدام**: واجهة بديهية ومتجاوبة

النظام جاهز للاستخدام ويمكن توسيعه بسهولة لإضافة ميزات جديدة حسب الحاجة.
