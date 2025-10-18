# إصلاح خطأ 400 في رفع PDF - Cloudinary

## 🔴 المشكلة
```
400 Bad Request
فشل في رفع المرفق
```

---

## ✅ الحل السريع (3 خطوات)

### 1️⃣ إنشاء Upload Preset في Cloudinary

**افتح:** https://cloudinary.com/console

**اتبع الخطوات:**
1. Settings → Upload → Upload presets
2. اضغط "Add upload preset"
3. املأ الإعدادات التالية **بالضبط**:

```
Upload preset name: hackathon_pdfs
Signing Mode: Unsigned ⭐
Resource type: Raw ⭐
Access mode: Public ⭐
```

4. اضغط **Save**

⚠️ **مهم جداً:** اسم الـ preset يجب أن يكون `hackathon_pdfs` بالضبط!

---

### 2️⃣ إضافة Environment Variable

**افتح:** https://cloud.digitalocean.com/apps

1. اختر التطبيق (clownfish-app-px9sc)
2. Settings → App-Level Environment Variables
3. اضغط Edit
4. أضف:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=djva3nfy5
```
5. Save

---

### 3️⃣ Deploy الكود

```powershell
git add .
git commit -m "Fix: Cloudinary 400 error - correct upload parameters"
git push origin اخير
```

انتظر 2-3 دقائق للـ deploy

---

## 🎯 لماذا كان الخطأ؟

المشكلة كانت:
1. ❌ Upload preset `hackathon_pdfs` **غير موجود** في Cloudinary
2. ❌ إرسال `resource_type` كـ parameter في FormData (غير صحيح)
3. ✅ يجب استخدام endpoint `/raw/upload` فقط

---

## ✅ ماذا تم تغييره في الكود؟

### قبل:
```typescript
formData.append('resource_type', 'raw')     // ❌ غير صحيح
formData.append('access_mode', 'public')    // ❌ غير صحيح
```

### بعد:
```typescript
// ✅ فقط file و upload_preset
formData.append('file', file)
formData.append('upload_preset', 'hackathon_pdfs')
// resource_type و access_mode محددين في الـ preset
```

---

## 🧪 اختبار

بعد تطبيق الخطوات:

1. افتح: https://clownfish-app-px9sc.ondigitalocean.app/admin/judges
2. "إرسال دعوة"
3. اختر ملف PDF
4. يجب أن يظهر: ✅ تم رفع المرفق بنجاح!

---

## 🆘 إذا استمر الخطأ

**تأكد من:**
- [ ] Upload preset اسمه `hackathon_pdfs` **بالضبط**
- [ ] Signing Mode = **Unsigned**
- [ ] Resource type = **Raw**
- [ ] Access mode = **Public**
- [ ] الـ preset **محفوظ** في Cloudinary
- [ ] Environment variable تم إضافته في DigitalOcean
- [ ] تم عمل deploy للكود الجديد

---

**التحديث:** 18 أكتوبر 2025  
**الحالة:** جاهز للتطبيق ✅
