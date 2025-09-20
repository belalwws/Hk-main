# 🚀 **دليل المحرر المتقدم للصفحات**

## 📋 **نظرة عامة**

المحرر المتقدم هو بيئة تطوير متكاملة شبيهة بـ VSCode لإنشاء وتحرير صفحات الهبوط للهاكاثونات. يوفر المحرر:

- ✅ **محرر متعدد الملفات** مع syntax highlighting
- ✅ **مكتبة أكواد مساعدة** للتسجيل والتأثيرات
- ✅ **معرض قوالب جاهزة** للاستخدام المباشر
- ✅ **معاينة مباشرة** متجاوبة (Desktop/Tablet/Mobile)
- ✅ **تكامل تلقائي** مع نظام التسجيل
- ✅ **حفظ تلقائي** وإدارة الملفات

---

## 🎯 **الميزات الرئيسية**

### **1. محرر الملفات المتقدم**
- **إدارة ملفات متعددة**: HTML, CSS, JS, JSON
- **File Explorer**: تصفح وإدارة الملفات بسهولة
- **Syntax Highlighting**: تمييز الكود حسب النوع
- **Auto-completion**: اقتراحات تلقائية للكود

### **2. مكتبة الأكواد المساعدة**
- **أكواد التسجيل**: أزرار وروابط التسجيل الجاهزة
- **مكونات UI**: عناصر واجهة مستخدم متقدمة
- **تأثيرات حركية**: animations وtransitions
- **تصميم متجاوب**: أكواد responsive design
- **تكامل APIs**: ربط مع نظام التسجيل

### **3. معرض القوالب**
- **قوالب عصرية**: تصاميم حديثة مع تأثيرات بصرية
- **قوالب بسيطة**: تصاميم نظيفة وسريعة التحميل
- **قوالب إبداعية**: تصاميم فريدة ومبتكرة
- **قوالب مؤسسية**: تصاميم احترافية للشركات

### **4. معاينة متجاوبة**
- **Desktop Preview**: معاينة للشاشات الكبيرة
- **Tablet Preview**: معاينة للأجهزة اللوحية
- **Mobile Preview**: معاينة للهواتف الذكية
- **Live Reload**: تحديث فوري للتغييرات

---

## 🛠️ **كيفية الاستخدام**

### **الخطوة 1: الوصول للمحرر**
```
/admin/hackathons/[id]/landing-page-pro
```

### **الخطوة 2: إنشاء الملفات**
1. انقر على زر **"+"** في File Explorer
2. أدخل اسم الملف مع الامتداد (مثل: `styles.css`)
3. ابدأ بكتابة الكود

### **الخطوة 3: استخدام مكتبة الأكواد**
1. انقر على **"مكتبة الأكواد"**
2. اختر الفئة المناسبة (تسجيل، UI، تأثيرات، إلخ)
3. انقر **"إدراج"** لإضافة الكود للملف النشط

### **الخطوة 4: تطبيق قالب جاهز**
1. انقر على **"معرض القوالب"**
2. اختر القالب المناسب
3. انقر **"استخدام القالب"**

### **الخطوة 5: المعاينة والحفظ**
1. انقر **"معاينة"** لرؤية النتيجة
2. جرب المعاينة على أجهزة مختلفة
3. انقر **"حفظ"** لحفظ التغييرات

---

## 🔗 **التكامل مع نظام التسجيل**

### **المتغيرات التلقائية**
يتم استبدال هذه المتغيرات تلقائياً:
- `{{HACKATHON_TITLE}}` → عنوان الهاكاثون
- `{{HACKATHON_DESCRIPTION}}` → وصف الهاكاثون
- `{{HACKATHON_ID}}` → معرف الهاكاثون
- `{{REGISTRATION_URL}}` → رابط التسجيل

### **دوال التسجيل الجاهزة**
```javascript
// توجيه مباشر لصفحة التسجيل
function registerNow() {
    window.location.href = '/hackathons/{{HACKATHON_ID}}/register-form';
}

// فتح نافذة تسجيل منبثقة
function openRegistrationModal() {
    const modal = window.open(
        '/hackathons/{{HACKATHON_ID}}/register-form',
        'registration',
        'width=800,height=600,scrollbars=yes,resizable=yes'
    );
}

// فحص حالة التسجيل
function checkRegistrationStatus() {
    const registered = localStorage.getItem('hackathon_registered_{{HACKATHON_ID}}');
    return registered === 'true';
}
```

---

## 🎨 **أمثلة على الأكواد المساعدة**

### **زر التسجيل المتقدم**
```html
<button class="register-btn pulse" onclick="registerNow()">
    <i class="fas fa-rocket"></i>
    سجل الآن
</button>

<style>
.register-btn {
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 18px;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.pulse {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3); }
    50% { box-shadow: 0 4px 25px rgba(255, 107, 107, 0.6); }
    100% { box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3); }
}
</style>
```

### **عداد تنازلي**
```html
<div class="countdown" id="countdown">
    <div class="time-unit">
        <span class="number" id="days">00</span>
        <span class="label">يوم</span>
    </div>
    <!-- المزيد من الوحدات -->
</div>

<script>
function startCountdown() {
    const startDate = new Date('2024-12-31T00:00:00').getTime();
    
    const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = startDate - now;
        
        if (distance < 0) {
            clearInterval(timer);
            document.getElementById('countdown').innerHTML = '<h2>بدأ الهاكاثون!</h2>';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        // حساب باقي الوحدات...
        
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        // تحديث باقي الوحدات...
    }, 1000);
}
</script>
```

---

## 📱 **التصميم المتجاوب**

### **نظام Grid متجاوب**
```css
.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 2rem;
}

@media (max-width: 768px) {
    .grid-container {
        grid-template-columns: 1fr;
        padding: 1rem;
        gap: 1rem;
    }
}
```

### **تأثيرات الحركة**
```css
.fade-in {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s ease;
}

.fade-in.visible {
    opacity: 1;
    transform: translateY(0);
}
```

---

## 🚀 **نشر الصفحة**

### **تفعيل الصفحة**
1. ✅ تأكد من تفعيل خيار **"تفعيل الصفحة"**
2. 💾 احفظ التغييرات
3. 🔗 استخدم رابط المعاينة المباشرة

### **الرابط النهائي**
```
https://your-domain.com/api/landing-pro/[hackathon-id]
```

---

## 🔧 **نصائح للتطوير**

### **أفضل الممارسات**
- ✅ استخدم أسماء ملفات واضحة ومنطقية
- ✅ اختبر الصفحة على أجهزة مختلفة
- ✅ استخدم التأثيرات بحكمة (لا تفرط)
- ✅ تأكد من سرعة التحميل
- ✅ اجعل التصميم accessible

### **تحسين الأداء**
- 🚀 ضغط الصور قبل الاستخدام
- 🚀 تجنب الـ CSS والـ JS الزائد
- 🚀 استخدم CDN للخطوط والمكتبات
- 🚀 اختبر سرعة التحميل

### **التوافق**
- 📱 اختبر على Safari, Chrome, Firefox
- 📱 تأكد من التوافق مع iOS و Android
- 📱 اختبر على شاشات مختلفة الأحجام

---

## 🆘 **استكشاف الأخطاء**

### **مشاكل شائعة**
- **الصفحة لا تظهر**: تأكد من تفعيل الصفحة وحفظ التغييرات
- **الـ CSS لا يعمل**: تحقق من أسماء الملفات والروابط
- **الـ JavaScript لا يعمل**: افحص console للأخطاء
- **التصميم مكسور على الموبايل**: أضف media queries

### **الحصول على المساعدة**
- 📧 راسل فريق الدعم الفني
- 📖 راجع هذا الدليل
- 🔍 ابحث في مكتبة الأكواد المساعدة

---

**🎉 استمتع بإنشاء صفحات هبوط رائعة لهاكاثونك! 🚀**
