# المرحلة 2: تعديل باقي ملفات الإيميلات

## 📋 الملفات المطلوب تعديلها:

بسبب كثرة الملفات (13 ملف)، هذا الملف يوثق التعديلات المطلوبة.

---

## ✅ ملخص سريع:

**النمط:**
```typescript
// قبل ❌
from: process.env.MAIL_FROM || 'هاكاثون الابتكار التقني <racein668@gmail.com>',

// بعد ✅
from: `"${hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,
```

**ملاحظة مهمة:**
- كل هذه الملفات لديها `hackathon` object بالفعل مع `title`
- فقط نحتاج تغيير سطر `from:`

---

## 📝 القائمة الكاملة:

### Admin - Teams Management:

#### 1. `app/api/admin/hackathons/[id]/teams/auto-create/route.ts`
**السطر 318:** في دالة `sendTeamAssignmentEmail`
```typescript
from: `"${hackathonTitle}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,
```
**ملاحظة:** hackathonTitle مُمرر كـ parameter للدالة

---

#### 2. `app/api/admin/hackathons/[id]/teams/[teamId]/send-emails/route.ts`
**تقريباً سطر 67:**
```typescript
from: `"${hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,
```

---

#### 3. `app/api/admin/hackathons/[id]/teams/[teamId]/members/[participantId]/route.ts`
**سطران (122 و 151):**
```typescript
// السطر 122 - إضافة عضو
from: `"${team.hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,

// السطر 151 - حذف عضو  
from: `"${team.hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,
```
**ملاحظة:** الـ hackathon يأتي من `team.hackathon.title`

---

#### 4. `app/api/admin/hackathons/[id]/teams/[teamId]/members/[participantId]/move/route.ts`
**سطران (170 و 200):**
```typescript
// السطر 170 - إشعار للفريق القديم
from: `"${oldTeam.hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,

// السطر 200 - إشعار للفريق الجديد
from: `"${newTeam.hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,
```

---

### Supervisor - Teams Management:

#### 5. `app/api/supervisor/hackathons/[id]/teams/auto-create/route.ts`
**السطر ~287:**
```typescript
from: `"${hackathonTitle}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,
```

---

#### 6. `app/api/supervisor/hackathons/[id]/teams/confirm-transfers/route.ts`
**سطران (119 و 165):**
```typescript
// السطر 119 - إشعار للفريق القديم
from: `"${oldTeam.hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,

// السطر 165 - إشعار للفريق الجديد
from: `"${newTeam.hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,
```

---

#### 7. `app/api/supervisor/hackathons/[id]/teams/[teamId]/send-emails/route.ts`
**السطر ~110:**
```typescript
from: `"${team.hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,
```

---

#### 8. `app/api/supervisor/hackathons/[id]/teams/[teamId]/members/[participantId]/move/route.ts`
**سطران (214 و 244):**
```typescript
// السطر 214 - إشعار للفريق القديم
from: `"${oldTeam.hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,

// السطر 244 - إشعار للفريق الجديد
from: `"${newTeam.hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,
```

---

### Participants:

#### 9. `app/api/admin/hackathons/[id]/participants/bulk-update/route.ts`
**السطر ~101:**
```typescript
from: `"${hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,
```

---

### Broadcast & Test:

#### 10. `app/api/admin/emails/broadcast/route.ts`
**السطر ~35:**
```typescript
from: `منصة الهاكاثونات <${gmailUser}>`,
```
**ملاحظة:** هذا ملف broadcast عام، قد لا يحتاج تعديل أو يحتاج hackathonId parameter

---

#### 11. `app/api/test-email/route.ts`
**السطر ~43:**
```typescript
from: `منصة الهاكاثونات للاختبار <${gmailUser}>`,
```
**ملاحظة:** ملف اختبار، يُفضل تركه كما هو

---

## 📊 الإحصائيات:

| الفئة | العدد |
|------|-------|
| **Admin Teams** | 4 ملفات |
| **Supervisor Teams** | 4 ملفات |
| **Participants** | 1 ملف |
| **Broadcast/Test** | 2 ملف (اختياري) |
| **إجمالي** | 9-11 ملف |

---

## 🎯 الأولوية:

### عالية الأهمية (9 ملفات):
1-4: Admin Teams  
5-8: Supervisor Teams  
9: Participants

### منخفضة الأهمية (2 ملف):
10: Broadcast (عام)  
11: Test (اختبار)

---

## ⚡ التطبيق السريع:

نظراً لتشابه التعديلات، يمكن استخدام Find & Replace بحذر:

**بحث:**
```
from: process.env.MAIL_FROM || 'هاكاثون الابتكار التقني <racein668@gmail.com>',
```

**استبدال:**
يعتمد على المتغير المتاح (`hackathon.title` أو `hackathonTitle` أو `team.hackathon.title`)

---

## ✅ بعد التطبيق:

- [ ] تأكد من عدم وجود أخطاء TypeScript
- [ ] test على localhost أولاً
- [ ] deploy للإنتاج
- [ ] اختبر إيميل واحد من كل نوع

---

**ملاحظة:** بسبب كثرة الملفات وتشابه التعديلات، من الأفضل تطبيقها واحدة تلو الأخرى للتأكد من الصحة.

---

**الحالة:** قائمة التعديلات جاهزة ✅  
**التنفيذ:** قيد الانتظار ⏳
