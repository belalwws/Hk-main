# 🗂️ إعداد AWS S3 لتخزين الشهادات

## لماذا نحتاج AWS S3؟

**المشكلة**: Render يستخدم **ephemeral filesystem** - أي أن الملفات المرفوعة تُحذف عند إعادة تشغيل الخادم.

**الحل**: استخدام AWS S3 لتخزين الشهادات بشكل دائم.

## 📋 خطوات الإعداد

### 1. إنشاء حساب AWS (إذا لم يكن لديك)
- اذهب إلى [aws.amazon.com](https://aws.amazon.com)
- أنشئ حساب جديد أو سجل دخول

### 2. إنشاء S3 Bucket
1. اذهب إلى **S3 Console**
2. اضغط **Create bucket**
3. اختر اسم فريد مثل: `hackathon-certificates-2024`
4. اختر Region: `us-east-1` (أو الأقرب لك)
5. **Block Public Access**: قم بإلغاء تحديد جميع الخيارات
6. اضغط **Create bucket**

### 3. إعداد Bucket Policy
1. اذهب إلى الـ bucket الذي أنشأته
2. تبويب **Permissions**
3. **Bucket Policy** - أضف هذا:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::hackathon-certificates-2024/*"
        }
    ]
}
```

**⚠️ استبدل `hackathon-certificates-2024` باسم الـ bucket الخاص بك**

### 4. إنشاء IAM User
1. اذهب إلى **IAM Console**
2. **Users** → **Create user**
3. اسم المستخدم: `hackathon-s3-user`
4. **Attach policies directly**
5. أضف هذه الصلاحيات:
   - `AmazonS3FullAccess` (أو أنشئ policy مخصص)

### 5. إنشاء Access Keys
1. اذهب إلى المستخدم الذي أنشأته
2. تبويب **Security credentials**
3. **Create access key**
4. اختر **Application running outside AWS**
5. احفظ **Access Key ID** و **Secret Access Key**

### 6. إضافة المتغيرات في Render
في Render Dashboard → Environment Variables:

```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=hackathon-certificates-2024
```

## 🔧 كيف يعمل النظام؟

### التطوير المحلي:
- بدون AWS credentials → يحفظ في `/public/certificates/`
- مع AWS credentials → يرفع إلى S3

### الإنتاج (Render):
- مع AWS credentials → يرفع إلى S3 ✅
- بدون AWS credentials → يحفظ محلياً (سيُحذف عند إعادة التشغيل) ❌

## 💰 التكلفة

**AWS S3 Free Tier**:
- 5 GB تخزين مجاني
- 20,000 GET requests
- 2,000 PUT requests

**للاستخدام العادي**: أقل من $1 شهرياً

## 🧪 اختبار الإعداد

1. ارفع شهادة في النظام
2. تحقق من الرسائل في Console:
   - `🌐 Using S3 storage` ← يعمل بشكل صحيح
   - `💾 Using local storage` ← يحتاج إعداد AWS

3. تحقق من S3 Console أن الملف موجود

## 🔒 الأمان

- الـ bucket مفتوح للقراءة فقط
- المستخدم له صلاحيات S3 فقط
- Access Keys محمية في متغيرات البيئة

## 🚨 بديل مؤقت

إذا لم تريد إعداد AWS الآن، يمكنك:

1. **استخدام Cloudinary** (أسهل):
   ```bash
   npm install cloudinary
   ```

2. **استخدام Supabase Storage** (مجاني):
   ```bash
   npm install @supabase/supabase-js
   ```

3. **قبول أن الشهادات ستُحذف** عند إعادة تشغيل Render

---

**💡 نصيحة**: ابدأ بـ AWS S3 لأنه الأكثر استقراراً وموثوقية للإنتاج.
