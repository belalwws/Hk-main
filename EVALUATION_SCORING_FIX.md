# إصلاح نظام التقييم - تحويل النجوم إلى نقاط

## المشكلة
كان النظام يعرض النقاط بشكل خاطئ عند التقييم:
- عند اختيار 5 نجوم، كان يعرض "5 / 10 نقطة" بدلاً من "10 / 10 نقطة"
- السبب: النظام لم يكن يحول النجوم (1-5) إلى نقاط بناءً على `maxScore` لكل معيار

## الحل
تم تطبيق نظام تحويل صحيح من النجوم إلى النقاط:
- **النجوم**: 1-5 (ثابت للتقييم)
- **النقاط**: تعتمد على `maxScore` لكل معيار (10، 15، 20، إلخ)
- **معادلة التحويل**: `actualScore = (stars / 5) * maxScore`

## الملفات المعدلة

### 1. API - حفظ التقييم
**الملف**: `app/api/judge/evaluate/route.ts`
- **التغيير**: تحويل النجوم إلى نقاط فعلية قبل الحفظ في قاعدة البيانات
- **الكود**:
```typescript
const scoreRecords = criteria.map(criterion => {
  const starRating = scores[criterion.id] // 1-5 stars
  const actualScore = Math.round((starRating / 5) * criterion.maxScore)
  
  return {
    score: actualScore, // النقاط الفعلية (مثلاً 10 لـ 5 نجوم على معيار 10 نقاط)
    maxScore: criterion.maxScore
  }
})
```

### 2. صفحة التقييم - عرض النقاط
**الملف**: `app/judge/evaluation/page.tsx`
- **التغيير**: عرض النقاط المحسوبة بناءً على النجوم و maxScore
- **الكود**:
```typescript
<div className="text-[#8b7632] text-lg">
  {(scores[currentCriterion.id] * currentCriterion.maxScore / 5).toFixed(0)} / {currentCriterion.maxScore} نقطة
</div>
```

### 3. API - حساب النتائج
**الملف**: `app/api/admin/hackathons/[id]/evaluations/route.ts`
- **التغيير**: حساب `averageScore` بالنجوم (1-5) للعرض الصحيح
- **الكود**:
```typescript
const averageScore = team.scores.length > 0 
  ? team.scores.reduce((sum, score) => {
      const stars = (score.score / score.maxScore) * 5
      return sum + stars
    }, 0) / team.scores.length
  : 0
```

### 4. صفحة التقييمات - عرض النجوم
**الملف**: `app/admin/hackathons/[id]/evaluations/page.tsx`
- **التغيير**: تحويل النقاط المحفوظة إلى نجوم للعرض
- **الكود**:
```typescript
const stars = (score.score / score.maxScore) * 5
```

### 5. APIs الأخرى
تم تطبيق نفس المنطق في:
- `app/api/admin/hackathons/[id]/send-certificates/route.ts`
- `app/api/participants/[id]/certificate/route.ts`
- `app/api/supervisor/teams/route.ts`

## مثال عملي

### معيار بـ 10 نقاط:
- 1 نجمة = 2 نقطة
- 2 نجمة = 4 نقاط
- 3 نجوم = 6 نقاط
- 4 نجوم = 8 نقاط
- 5 نجوم = 10 نقاط ✓

### معيار بـ 20 نقطة:
- 1 نجمة = 4 نقاط
- 2 نجمة = 8 نقاط
- 3 نجوم = 12 نقطة
- 4 نجوم = 16 نقطة
- 5 نجوم = 20 نقطة ✓

### معيار بـ 15 نقطة:
- 1 نجمة = 3 نقاط
- 2 نجمة = 6 نقاط
- 3 نجوم = 9 نقاط
- 4 نجوم = 12 نقطة
- 5 نجوم = 15 نقطة ✓

## النتيجة
الآن النظام يعمل بشكل صحيح:
- ✅ عند اختيار 5 نجوم على معيار 10 نقاط → يعرض "10 / 10 نقطة"
- ✅ عند اختيار 3 نجوم على معيار 20 نقطة → يعرض "12 / 20 نقطة"
- ✅ النجوم تظل ثابتة (1-5) للتقييم السهل
- ✅ النقاط تتغير حسب وزن كل معيار

