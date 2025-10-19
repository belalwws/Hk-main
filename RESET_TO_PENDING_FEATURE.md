# ميزة إعادة المشاركين للانتظار (Reset to Pending)

## نظرة عامة
تم إضافة ميزة جديدة تتيح للمسؤولين إعادة المشاركين المقبولين أو المرفوضين إلى حالة الانتظار دون إرسال إيميلات إضافية.

## المشكلة التي تحلها
عند تجاوز حد الإرسال اليومي لـ Gmail (500 إيميل/يوم)، قد يتم قبول مشاركين ولكن لا يتم إرسال إيميلات القبول لهم. هذه الميزة تتيح:
1. إعادة المشاركين للانتظار
2. إعادة قبولهم في اليوم التالي عندما يتم إعادة تعيين حد الإرسال
3. إرسال الإيميلات في المحاولة الثانية

## المزايا الرئيسية

### 1. زر "إعادة للانتظار"
- يظهر للمشاركين المقبولين (approved) بلون برتقالي
- يظهر للمشاركين المرفوضين (rejected) بلون أزرق
- يحتوي على أيقونة ساعة (Clock) للدلالة على الانتظار

### 2. تغيير الحالة الصامت
- عند النقر على الزر، يتم تغيير حالة المشارك إلى `pending`
- **لا يتم إرسال أي إيميل** للمشارك
- يتم مسح حقول `approvedAt` و `rejectedAt`

### 3. إمكانية إعادة القبول
- بعد إعادة المشارك للانتظار، يظهر زر "قبول" مرة أخرى
- عند النقر على "قبول"، يتم إرسال إيميل القبول بشكل طبيعي

## التعديلات التقنية

### 1. ملف الواجهة: `app/admin/hackathons/[id]/page.tsx`

#### إضافة أيقونة Clock:
```typescript
import { Clock } from 'lucide-react'
```

#### تحديث دالة updateParticipantStatus:
```typescript
const updateParticipantStatus = async (
  participantId: string, 
  status: 'approved' | 'rejected' | 'pending', // تم إضافة 'pending'
  feedback?: string
) => {
  // ... الكود الموجود
  const statusMessage = status === 'approved' ? 'قبول' : 
                       status === 'rejected' ? 'رفض' : 
                       'إعادة للانتظار' // رسالة جديدة
}
```

#### إضافة أزرار إعادة للانتظار:
```typescript
{participant.status === 'approved' && (
  <Button
    size="sm"
    variant="outline"
    className="text-orange-600 hover:text-orange-700 border-orange-600"
    onClick={() => updateParticipantStatus(participant.id, 'pending')}
  >
    <Clock className="w-4 h-4 ml-1" />
    إعادة للانتظار
  </Button>
)}

{participant.status === 'rejected' && (
  <Button
    size="sm"
    variant="outline"
    className="text-blue-600 hover:text-blue-700 border-blue-600"
    onClick={() => updateParticipantStatus(participant.id, 'pending')}
  >
    <Clock className="w-4 h-4 ml-1" />
    إعادة للانتظار
  </Button>
)}
```

### 2. API Route: `app/api/admin/hackathons/[id]/participants/[participantId]/route.ts`

#### قبول حالة 'pending':
```typescript
if (!['approved', 'rejected', 'pending'].includes(status)) {
  return NextResponse.json({ error: 'حالة غير صحيحة' }, { status: 400 })
}
```

#### تحديث بيانات المشارك:
```typescript
const updatedParticipant = await prisma.participant.update({
  where: { id: params.participantId },
  data: {
    status: status as any,
    feedback: feedback || null,
    approvedAt: status === 'approved' ? new Date() : null, // يتم مسحها
    rejectedAt: status === 'rejected' ? new Date() : null  // يتم مسحها
  }
})
```

#### منع إرسال الإيميلات للحالة pending:
```typescript
// Send notification email (only for approved/rejected, not for pending)
if (status !== 'pending') {
  // ... كود إرسال الإيميل
} else {
  console.log(`⏸️ Status changed to pending for ${participant.user.email} - no email sent`)
}
```

#### رسالة نجاح محدثة:
```typescript
const statusMessage = status === 'approved' ? 'قبول' : 
                     status === 'rejected' ? 'رفض' : 
                     'إعادة للانتظار'

return NextResponse.json({
  message: `تم ${statusMessage} المشارك بنجاح`,
  // ...
})
```

## سيناريو الاستخدام

### المشكلة:
1. المسؤول يحاول قبول 100 مشارك
2. تم إرسال 50 إيميل فقط
3. ظهر خطأ: "Daily user sending limit exceeded"
4. 50 مشارك مقبول ولكن لم يصلهم إيميل

### الحل:
1. المسؤول ينقر على زر "إعادة للانتظار" للـ 50 مشارك
2. يتم تغيير حالتهم إلى `pending`
3. لا يتم إرسال أي إيميلات
4. في اليوم التالي، عندما يتم إعادة تعيين حد Gmail:
   - المسؤول ينقر "قبول" مرة أخرى
   - يتم إرسال إيميلات القبول بنجاح
   - يحصل المشاركون على إيميلاتهم

## الفوائد

### 1. توفير الوقت
- لا حاجة لتغيير البيانات يدوياً في قاعدة البيانات
- عملية سهلة من الواجهة مباشرة

### 2. تجنب الارتباك
- عدم إرسال إيميلات متعددة للمشارك نفسه
- إدارة أفضل لعملية القبول

### 3. المرونة
- يمكن استخدامه في أي وقت
- يعمل مع المشاركين المقبولين والمرفوضين

### 4. الشفافية
- سجل واضح في قاعدة البيانات
- رسائل تأكيد للمسؤول

## اللوغات والرسائل

### رسائل النجاح:
- ✅ "تم قبول المشارك بنجاح"
- ✅ "تم رفض المشارك بنجاح"
- ✅ "تم إعادة للانتظار المشارك بنجاح"

### لوغات API:
```
⏸️ Status changed to pending for user@example.com - no email sent
```

### لوغات عادية (للقبول/رفض):
```
📧 Preparing to send approved email to user@example.com
✅ approved email sent successfully to user@example.com
```

## ملاحظات مهمة

### 1. عدم إرسال الإيميلات
- الحالة `pending` لا ترسل أي إيميلات
- فقط `approved` و `rejected` يرسلون إيميلات

### 2. مسح البيانات الزمنية
- عند إعادة للانتظار، يتم مسح `approvedAt`
- عند إعادة للانتظار، يتم مسح `rejectedAt`
- هذا يضمن بيانات نظيفة ودقيقة

### 3. الأمان
- يتطلب توثيق المسؤول (auth-token)
- التحقق من صحة الحالة
- التحقق من انتماء المشارك للهاكاثون

## التطويرات المستقبلية المحتملة

### 1. إعادة جماعية
- زر "إعادة جميع المقبولين للانتظار"
- مفيد عند وجود العديد من المشاركين

### 2. تأكيد قبل الإعادة
- نافذة حوار: "هل تريد إعادة {name} للانتظار؟"
- تجنب النقرات الخاطئة

### 3. تتبع سبب الإعادة
- حقل اختياري: "سبب إعادة للانتظار"
- مفيد للتدقيق والتحليل

### 4. إشعار للمشارك (اختياري)
- إيميل اختياري يخبر المشارك بإعادة تقييم الطلب
- يجب أن يكون اختيارياً لتجنب الارتباك

### 5. تكامل مع واجهة المشرف
- نفس الميزة في لوحة المشرف (supervisor)
- توحيد التجربة عبر الواجهات

## خلاصة
هذه الميزة تحل مشكلة عملية حقيقية تتعلق بحدود إرسال Gmail، وتوفر مرونة أكبر في إدارة حالات المشاركين دون التأثير على تجربتهم أو إرباكهم بإيميلات متعددة.
