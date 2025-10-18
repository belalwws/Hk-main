# ⚠️ حل مشكلة Cloudinary PDF 401 Unauthorized

## المشكلة:
```
GET https://res.cloudinary.com/djva3nfy5/raw/upload/v1760785645/file.pdf
401 (Unauthorized)
```

## السبب:
الملفات المرفوعة **غير public** في Cloudinary.

---

## الحل الكامل (خطوة بخطوة):

### 1️⃣ تغيير إعدادات Cloudinary Account

#### اذهب إلى:
```
https://cloudinary.com/console
→ Settings
→ Security
→ "Restricted media types"
```

#### تأكد من:
```
☑️ "Enable unsigned uploading" = ON
☐ "Restrict by media type" = OFF
```

---

### 2️⃣ إنشاء/تعديل Upload Preset الصحيح

#### اذهب إلى:
```
https://cloudinary.com/console
→ Settings
→ Upload
→ Upload presets
```

#### أنشئ preset جديد أو عدّل الموجود:

```
📝 Upload Preset Configuration:

Preset name: hackathon_pdfs

Signing Mode: Unsigned ✅

Folder: judge-invitations

Resource type: Raw ✅

Access control: 
  - Access mode: Public ✅ ⚠️ (مهم جداً!)
  - Delivery type: upload

Allowed formats: pdf

Max file size (bytes): 10485760 (10 MB)

Overwrite: No

Unique filename: Yes
```

#### في Advanced settings:
```
Type: upload
Resource type: raw
Access mode: public ✅
Delivery type: upload
```

---

### 3️⃣ تعديل الكود (مهم جداً!)

في `app/admin/judges/page.tsx`:

```typescript
const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  // ... validation code

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'hackathon_pdfs')
    formData.append('resource_type', 'raw') // ✅
    formData.append('access_mode', 'public') // ✅ مهم!

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, // ✅ raw/upload
      {
        method: 'POST',
        body: formData
      }
    )

    if (response.ok) {
      const data = await response.json()
      // الرابط يكون: .../raw/upload/v.../file.pdf ✅
      setInviteFormData({ ...inviteFormData, attachmentUrl: data.secure_url })
      showSuccess('تم رفع المرفق بنجاح!')
    }
  } catch (error) {
    // ...
  }
}
```

---

### 4️⃣ إعادة رفع الملفات القديمة

الملفات المرفوعة قبل التعديل **لن تعمل**. يجب إعادة رفعها.

**احذف الملفات القديمة من Cloudinary:**
```
https://cloudinary.com/console/media_library
→ ابحث عن الملفات
→ Delete
```

**أعد رفعها من النظام بعد التعديل.**

---

### 5️⃣ اختبار

بعد التعديل، الرابط يجب أن يكون:

```
https://res.cloudinary.com/djva3nfy5/raw/upload/v1234567890/judge-invitations/filename.pdf
```

وعند فتحه في المتصفح:
- ✅ **يفتح مباشرة** (لا يطلب تسجيل دخول)
- ✅ **200 OK** (وليس 401)

---

## ✅ Checklist:

- [ ] Cloudinary: Unsigned uploading = ON
- [ ] Upload Preset: hackathon_pdfs created
- [ ] Preset: Signing Mode = Unsigned
- [ ] Preset: Resource type = Raw
- [ ] Preset: Access mode = **Public** ⚠️
- [ ] Code: resource_type = 'raw'
- [ ] Code: access_mode = 'public'
- [ ] Code: URL = .../raw/upload
- [ ] Delete old files
- [ ] Re-upload with new settings

---

## إذا ما زالت المشكلة موجودة:

### حل بديل: استخدام Signed URLs

إذا Cloudinary يرفض unsigned uploads:

```typescript
// في الـ API (server-side)
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// رفع من السيرفر
const result = await cloudinary.uploader.upload(fileDataUri, {
  resource_type: 'raw',
  folder: 'judge-invitations',
  access_mode: 'public', // ⚠️ مهم
})

// الرابط يكون public
const pdfUrl = result.secure_url
```

---

**بعد هذه الخطوات، PDF يفتح عند الجميع بدون 401!** ✅
