# كيفية استخدام الصور في صفحة الهبوط المتقدمة

## 🖼️ رفع الصور

### الطريقة الأولى: من واجهة المحرر
1. اذهب إلى صفحة الهبوط المتقدمة: `/admin/hackathons/[id]/landing-page-pro`
2. في قائمة الملفات على اليسار، اضغط على أيقونة الرفع (📤)
3. اختر الصورة من جهازك (حد أقصى 5MB)
4. ستظهر الصورة في قائمة الملفات مع أيقونة صورة بنفسجية

### الطريقة الثانية: عبر API
```javascript
const formData = new FormData()
formData.append('image', file)

const response = await fetch(`/api/admin/hackathons/[id]/landing-page-pro/upload-image`, {
  method: 'POST',
  body: formData
})

const result = await response.json()
console.log('رابط الصورة:', result.image.url)
```

## 🔗 استخدام الصور في الكود

### في HTML
```html
<!-- استخدام الرابط المباشر -->
<img src="/api/admin/hackathons/[id]/landing-page-pro/images/[imageId]" alt="صورة الهاكاثون">

<!-- أو استخدام base64 -->
<img src="data:image/jpeg;base64,..." alt="صورة الهاكاثون">
```

### في CSS
```css
.hero-background {
  background-image: url('/api/admin/hackathons/[id]/landing-page-pro/images/[imageId]');
  background-size: cover;
  background-position: center;
}
```

### في JavaScript
```javascript
// تحميل الصورة ديناميكياً
const img = new Image()
img.src = '/api/admin/hackathons/[id]/landing-page-pro/images/[imageId]'
img.onload = () => {
  document.getElementById('hero').appendChild(img)
}
```

## 📋 نسخ رابط الصورة

### من واجهة المحرر
1. اضغط على الصورة في قائمة الملفات
2. ستظهر معلومات الصورة في المحرر
3. انسخ الرابط من حقل "رابط الصورة للاستخدام في الكود"
4. أو اضغط على زر "نسخ" بجانب الرابط

### الروابط المتاحة
- **رابط API**: `/api/admin/hackathons/[id]/landing-page-pro/images/[imageId]`
- **رابط Base64**: `data:image/[type];base64,[data]`

## 🎨 أمثلة عملية

### صفحة هبوط بصورة خلفية
```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>هاكاثون الابتكار</title>
    <style>
        .hero {
            background-image: url('/api/admin/hackathons/[id]/landing-page-pro/images/[imageId]');
            background-size: cover;
            background-position: center;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
        }
        .hero-content {
            background: rgba(0,0,0,0.7);
            padding: 2rem;
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="hero">
        <div class="hero-content">
            <h1>هاكاثون الابتكار 2024</h1>
            <p>انضم إلينا في رحلة الإبداع والابتكار</p>
            <button onclick="registerNow()">سجل الآن</button>
        </div>
    </div>
</body>
</html>
```

### معرض صور
```html
<div class="gallery">
    <img src="/api/admin/hackathons/[id]/landing-page-pro/images/[imageId1]" alt="صورة 1">
    <img src="/api/admin/hackathons/[id]/landing-page-pro/images/[imageId2]" alt="صورة 2">
    <img src="/api/admin/hackathons/[id]/landing-page-pro/images/[imageId3]" alt="صورة 3">
</div>

<style>
.gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    padding: 2rem;
}

.gallery img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    transition: transform 0.3s ease;
}

.gallery img:hover {
    transform: scale(1.05);
}
</style>
```

## 🔧 إدارة الصور

### حذف صورة
1. اضغط على الصورة في قائمة الملفات
2. اضغط على أيقونة الحذف (🗑️)
3. أكد الحذف

### معلومات الصورة
عند اختيار صورة، ستظهر المعلومات التالية:
- اسم الملف
- حجم الملف بالكيلوبايت
- تاريخ ووقت الرفع
- الرابط للاستخدام في الكود

## ⚠️ ملاحظات مهمة

1. **حجم الملف**: الحد الأقصى 5MB لكل صورة
2. **أنواع الملفات المدعومة**: JPG, PNG, GIF, WebP, SVG
3. **التخزين**: الصور تُحفظ كـ base64 في قاعدة البيانات
4. **الأداء**: للمشاريع الكبيرة، يُنصح باستخدام خدمة تخزين سحابية
5. **الروابط**: الروابط تعمل فقط داخل نطاق الموقع

## 🚀 نصائح للأداء

1. **ضغط الصور**: استخدم أدوات ضغط الصور قبل الرفع
2. **أحجام متعددة**: ارفع أحجام مختلفة للشاشات المختلفة
3. **تنسيق WebP**: يوفر ضغط أفضل من JPG/PNG
4. **Lazy Loading**: استخدم تحميل تدريجي للصور الكبيرة

```html
<img src="placeholder.jpg" data-src="/api/admin/hackathons/[id]/landing-page-pro/images/[imageId]" 
     alt="صورة" class="lazy-load">

<script>
// Lazy loading implementation
const lazyImages = document.querySelectorAll('.lazy-load')
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target
      img.src = img.dataset.src
      img.classList.remove('lazy-load')
      imageObserver.unobserve(img)
    }
  })
})

lazyImages.forEach(img => imageObserver.observe(img))
</script>
```

---

**تاريخ التحديث**: 2024-12-20  
**الإصدار**: 1.0  
**الحالة**: جاهز للاستخدام ✅
