# حل مشكلة Cloudinary 400 Bad Request

## المشكلة
```
api.cloudinary.com/v1_1/djva3nfy5/raw/upload: Failed to load resource: the server responded with a status of 400 (Bad Request)
فشل في رفع المرفق. تأكد من إعدادات Cloudinary.
```

## السبب
خطأ **400 Bad Request** يحدث عندما:
1. ❌ Upload Preset غير موجود أو اسمه خطأ
2. ❌ Upload Preset ليس من نوع **Unsigned** 
3. ❌ إرسال parameters خاطئة مع الـ FormData

---

## الحل الكامل ✅

### الخطوة 1️⃣: إنشاء Upload Preset في Cloudinary

**قبل كل شيء، يجب إنشاء Upload Preset صحيح:**

1. اذهب إلى: https://cloudinary.com/console
2. تسجيل الدخول بحسابك (djva3nfy5)
3. اضغط على **Settings** (⚙️) في الأعلى
4. اختر **Upload** من القائمة اليسرى
5. انزل لقسم **Upload presets**
6. اضغط على **Add upload preset**

**⚠️ الإعدادات المطلوبة بالضبط:**

```
Upload preset name: hackathon_pdfs
Signing Mode: Unsigned ⭐ (مهم جداً!)
Resource type: Raw ⭐ (للـ PDF)
Access mode: Public ⭐ (لجعل الملف يفتح بدون 401)
Folder: judge-invitations (اختياري)
Allowed formats: pdf (اختياري - للأمان)
Max file size: 10485760 (10MB بالبايت)
```

**📸 شرح مصور:**

**Signing Mode = Unsigned** ← هذا الأهم! بدونه سيظهر 400 Bad Request
- ✅ Unsigned: يسمح بالرفع من المتصفح مباشرة
- ❌ Signed: يتطلب API signature من السيرفر

**Resource type = Raw** ← لأن PDF ليس صورة
- ✅ Raw: للملفات مثل PDF, DOC, ZIP
- ❌ Image: للصور فقط (JPG, PNG)

**Access mode = Public** ← لجعل الرابط يعمل بدون 401
- ✅ Public: أي شخص يفتح الرابط
- ❌ Authenticated: يتطلب تسجيل دخول

---

### الخطوة 2️⃣: حفظ الإعدادات في Cloudinary

بعد ملء الإعدادات أعلاه:
1. اضغط **Save** في الأسفل
2. **تأكد** أن اسم الـ preset هو بالضبط: `hackathon_pdfs`
3. **تأكد** أن Signing Mode = **Unsigned**

---

### الخطوة 3️⃣: إضافة Environment Variable في DigitalOcean

1. اذهب إلى: https://cloud.digitalocean.com/apps
2. اختر التطبيق الخاص بك (clownfish-app-px9sc)
3. اضغط على **Settings**
4. اذهب إلى **App-Level Environment Variables**
5. اضغط **Edit**
6. أضف هذا المتغير:

```
Key: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
Value: djva3nfy5
```

7. اضغط **Save**
8. سيتم إعادة deploy تلقائياً

---

### الخطوة 4️⃣: Deploy التعديلات للكود

الكود الآن صحيح، قم برفعه:

```powershell
git add .
git commit -m "Fix: Cloudinary upload - remove resource_type parameter"
git push origin اخير
```

⏳ انتظر 2-3 دقائق حتى يتم الـ deploy التلقائي في DigitalOcean

---

## كيف يعمل الكود الآن؟

### كود الرفع الصحيح:
```typescript
const formData = new FormData()
formData.append('file', file)                        // ✅ الملف نفسه
formData.append('upload_preset', 'hackathon_pdfs')  // ✅ اسم الـ preset

// ❌ لا نضيف resource_type هنا لأن الـ endpoint هو /raw/upload
// ❌ لا نضيف access_mode هنا لأنه محدد في الـ preset settings

const response = await fetch(
  'https://api.cloudinary.com/v1_1/djva3nfy5/raw/upload',
  {
    method: 'POST',
    body: formData
  }
)
```

### لماذا `/raw/upload` وليس `/image/upload`?
- `/image/upload` ← للصور فقط (JPG, PNG, GIF)
- `/raw/upload` ← للملفات مثل PDF, DOC, TXT
- `/video/upload` ← للفيديوهات

---

## الفرق بين الأخطاء

| الخطأ | السبب | الحل |
|------|-------|-----|
| **401 Unauthorized** | الملف uploaded لكن access_mode = authenticated | غيّر access_mode إلى public في upload preset |
| **400 Bad Request** | Upload preset غير موجود أو ليس unsigned | أنشئ preset باسم `hackathon_pdfs` وجعله unsigned |
| **undefined cloud name** | NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME غير موجود | أضفه في DigitalOcean environment variables |

---

## ✅ Checklist للتأكد من الإعدادات

في Cloudinary Dashboard:

- [ ] Upload preset موجود باسم `hackathon_pdfs`
- [ ] Signing Mode = **Unsigned** (⭐ مهم!)
- [ ] Resource type = **Raw**
- [ ] Access mode = **Public**
- [ ] Preset محفوظ بنجاح

في DigitalOcean:

- [ ] Environment variable: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=djva3nfy5`
- [ ] التطبيق تم إعادة deploy بعد إضافة الـ variable

في الكود (Local):

- [ ] الكود لا يحتوي على `formData.append('resource_type', 'raw')`
- [ ] الكود لا يحتوي على `formData.append('access_mode', 'public')`
- [ ] الـ endpoint هو `/raw/upload` وليس `/upload`
- [ ] الكود تم push للـ Git

---

## اختبار بعد التطبيق

1. اذهب إلى الصفحة: https://clownfish-app-px9sc.ondigitalocean.app/admin/judges
2. اضغط "إرسال دعوة"
3. املأ البيانات واختر ملف PDF
4. انتظر رفع الملف

### النتيجة المتوقعة ✅:
```
✅ تم رفع المرفق بنجاح!
✅ يظهر رابط الملف في النموذج
✅ عند فتح الرابط: يفتح PDF بدون أي أخطاء
```

### إذا ظهرت أخطاء:

**400 Bad Request:**
- تأكد أن اسم الـ preset بالضبط `hackathon_pdfs`
- تأكد أن Signing Mode = Unsigned

**401 Unauthorized:**
- تأكد أن Access mode = Public في الـ upload preset

**504 Gateway Timeout:**
- الملف كبير جداً (فوق 10MB)
- اختر ملف أصغر

---

## ملاحظات مهمة

1. ⚠️ **Upload preset يجب أن يكون Unsigned**
   - Unsigned = يعمل من المتصفح مباشرة
   - Signed = يحتاج API signature من السيرفر

2. ⚠️ **Resource type محدد في endpoint**
   - `/raw/upload` → resource_type = raw تلقائياً
   - لا حاجة لإضافته في FormData

3. ⚠️ **Access mode محدد في Upload Preset**
   - يتم ضبطه في Cloudinary Dashboard
   - لا حاجة لإرساله مع الطلب

4. ⚠️ **NEXT_PUBLIC prefix مهم**
   - المتغيرات التي تبدأ بـ `NEXT_PUBLIC_` تكون متاحة في المتصفح
   - بدون `NEXT_PUBLIC_` → undefined في client-side

---

## الدعم الفني

إذا استمرت المشكلة بعد تطبيق جميع الخطوات:

1. افتح Console في المتصفح (F12)
2. انظر للـ Network tab
3. ابحث عن طلب `raw/upload`
4. انظر للـ Response:
   - إذا كان `{"error": {"message": "Upload preset not found"}}` → الـ preset غير موجود
   - إذا كان `{"error": {"message": "Upload preset must be unsigned"}}` → غيّر إلى Unsigned
   - إذا كان خطأ آخر → انسخ الـ Response كاملاً

---

## المراجع

- Cloudinary Upload Presets: https://cloudinary.com/documentation/upload_presets
- Raw File Upload: https://cloudinary.com/documentation/raw_file_upload
- Unsigned Upload: https://cloudinary.com/documentation/upload_images#unsigned_upload

---

**تم تحديث الملف:** 18 أكتوبر 2025  
**الحالة:** ✅ جاهز للتطبيق
