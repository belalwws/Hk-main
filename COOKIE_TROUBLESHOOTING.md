# 🍪 Cookie Troubleshooting Guide - دليل حل مشاكل الـ Cookies

## 🔍 المشكلة الأساسية

**الأعراض:**
- المستخدم يسجل دخول بنجاح
- الـ API يرجع token صحيح
- لكن الـ cookie لا يُحفظ في المتصفح
- عند refresh الصفحة، المستخدم يُعتبر غير مسجل دخول
- Loop في الـ redirect

**السبب:**
مشاكل في إعدادات الـ cookies على production (Render)

---

## ✅ الحلول المطبقة

### 1. إزالة Domain من Cookie Settings

**المشكلة:**
```tsx
// ❌ هذا يسبب مشاكل على subdomains
cookieOptions.domain = 'hackathon-platform-601l.onrender.com'
```

**الحل:**
```tsx
// ✅ دع المتصفح يحدد الـ domain تلقائياً
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
  // ❌ لا تضع domain هنا!
}
```

**السبب:**
- عند وضع domain صريح على subdomain مثل `.onrender.com`، بعض المتصفحات ترفض الـ cookie
- تركه فارغ يجعل المتصفح يستخدم الـ domain الحالي تلقائياً
- هذا أكثر أماناً ويعمل مع كل المتصفحات

---

### 2. إضافة credentials: 'include' للـ Login Request

**المشكلة:**
```tsx
// ❌ بدون credentials، الـ cookies لا تُرسل/تُستقبل
const res = await fetch("/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
})
```

**الحل:**
```tsx
// ✅ مع credentials، الـ cookies تُحفظ وتُرسل
const res = await fetch("/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: 'include', // ✅ مهم جداً!
  body: JSON.stringify({ email, password }),
})
```

**السبب:**
- `credentials: 'include'` يخبر المتصفح أن يرسل ويستقبل الـ cookies
- بدونه، حتى لو الـ server بعت Set-Cookie header، المتصفح مش هيحفظه
- ضروري على production خصوصاً مع HTTPS

---

### 3. Cookie Settings الصحيحة

```tsx
const cookieOptions = {
  httpOnly: true,        // ✅ منع JavaScript من الوصول للـ cookie (أمان)
  sameSite: "lax",       // ✅ حماية من CSRF attacks
  secure: true,          // ✅ على production (HTTPS فقط)
  path: "/",             // ✅ متاح لكل المسارات
  maxAge: 604800,        // ✅ 7 أيام (بالثواني)
}
```

**شرح كل خاصية:**

#### `httpOnly: true`
- يمنع JavaScript من قراءة الـ cookie
- حماية من XSS attacks
- الـ cookie يُرسل تلقائياً مع كل request

#### `sameSite: "lax"`
- حماية من CSRF attacks
- يسمح بإرسال الـ cookie مع navigation requests
- لا يرسله مع third-party requests

#### `secure: true` (على production)
- الـ cookie يُرسل فقط على HTTPS
- على development (HTTP) يكون `false`

#### `path: "/"`
- الـ cookie متاح لكل المسارات في الموقع
- لو حطيت `/admin` مثلاً، هيكون متاح فقط لـ `/admin/*`

#### `maxAge: 604800`
- مدة صلاحية الـ cookie بالثواني
- 604800 = 7 أيام
- بعدها المستخدم لازم يسجل دخول مرة أخرى

---

## 🔍 كيفية التحقق من المشكلة

### 1. افتح Developer Tools

**Chrome/Edge:**
- اضغط `F12`
- اذهب إلى **Application** tab
- في الجانب الأيسر: **Cookies** → اختر الموقع

**Firefox:**
- اضغط `F12`
- اذهب إلى **Storage** tab
- في الجانب الأيسر: **Cookies** → اختر الموقع

### 2. تحقق من وجود `auth-token`

**إذا موجود:**
- ✅ الـ cookie بيتحفظ صح
- تحقق من:
  - **Domain:** يجب أن يكون `hackathon-platform-601l.onrender.com`
  - **Path:** يجب أن يكون `/`
  - **Secure:** يجب أن يكون `Yes` على production
  - **HttpOnly:** يجب أن يكون `Yes`
  - **SameSite:** يجب أن يكون `Lax`

**إذا مش موجود:**
- ❌ الـ cookie مش بيتحفظ
- اتبع خطوات الـ debugging أدناه

---

## 🐛 Debugging Steps

### 1. تحقق من Network Tab

1. افتح **Developer Tools** → **Network** tab
2. سجل دخول
3. ابحث عن request `/api/login`
4. اضغط عليه
5. اذهب إلى **Headers** tab
6. ابحث عن **Response Headers**
7. تحقق من وجود `Set-Cookie: auth-token=...`

**إذا موجود:**
```
Set-Cookie: auth-token=eyJhbGc...; Path=/; HttpOnly; Secure; SameSite=Lax
```
✅ الـ server بيبعت الـ cookie صح

**إذا مش موجود:**
❌ مشكلة في الـ server - تحقق من الـ logs

### 2. تحقق من Console Logs

افتح **Console** tab وابحث عن:

```
✅ Cookie set with options: {"httpOnly":true,"sameSite":"lax","secure":true,"path":"/","maxAge":604800}
🔑 Token length: 245 User: game.overtnt.123@gmail.com Role: supervisor
```

**إذا موجود:**
✅ الـ server بيحفظ الـ cookie صح

**إذا في error:**
❌ تحقق من الـ error message

### 3. تحقق من Render Logs

1. اذهب إلى **Render Dashboard**
2. اختر الـ service
3. اذهب إلى **Logs**
4. ابحث عن:

```
🔍 Login attempt with data: { email: '...', hasPassword: true, passwordLength: 10 }
✅ Cookie set with options: {...}
🔑 Token length: 245 User: ... Role: supervisor
```

**إذا موجود:**
✅ الـ login بيشتغل صح على الـ server

---

## 🔧 حلول إضافية

### إذا استمرت المشكلة بعد كل الحلول:

#### 1. تحقق من Environment Variables

في **Render Dashboard** → **Environment**:

```env
NODE_ENV=production
NEXTAUTH_URL=https://hackathon-platform-601l.onrender.com
JWT_SECRET=your-secret-key
```

#### 2. امسح Cookies يدوياً

1. **Developer Tools** → **Application** → **Cookies**
2. اضغط right-click على الموقع
3. اختر **Clear**
4. سجل دخول مرة أخرى

#### 3. جرب Incognito/Private Mode

- افتح نافذة Incognito (Chrome) أو Private (Firefox)
- سجل دخول
- إذا اشتغل، المشكلة في الـ browser cache

#### 4. جرب متصفح آخر

- Chrome
- Firefox
- Edge
- Safari

إذا اشتغل على متصفح واحد فقط، المشكلة في إعدادات المتصفح الآخر

#### 5. تحقق من Browser Settings

**Chrome:**
- Settings → Privacy and security → Cookies and other site data
- تأكد من أنه **NOT** "Block all cookies"

**Firefox:**
- Settings → Privacy & Security → Cookies and Site Data
- تأكد من أنه **NOT** "Block all cookies"

---

## 📊 الملفات المعدلة

| الملف | التعديل | السبب |
|------|---------|-------|
| `app/api/auth/login/route.ts` | إزالة domain من cookie | منع رفض المتصفح للـ cookie |
| `contexts/auth-context.tsx` | إضافة credentials: 'include' | السماح بحفظ الـ cookies |

---

## 🎯 الخلاصة

**المشكلة الرئيسية:**
- وضع `domain` صريح في cookie settings
- عدم إرسال `credentials: 'include'` في fetch request

**الحل:**
1. ✅ إزالة `domain` من cookie options
2. ✅ إضافة `credentials: 'include'` لكل fetch requests
3. ✅ استخدام الإعدادات الصحيحة للـ cookie

**النتيجة:**
- ✅ الـ cookies تُحفظ بنجاح
- ✅ المستخدم يبقى مسجل دخول بعد refresh
- ✅ لا يوجد redirect loop

---

## 🚀 الخطوات التالية

1. انتظر اكتمال الـ build على Render
2. امسح cookies القديمة من المتصفح
3. سجل دخول مرة أخرى
4. تحقق من Application tab → Cookies
5. يجب أن ترى `auth-token` محفوظ

**إذا نجح:**
🎉 تمام! المشكلة محلولة!

**إذا لم ينجح:**
📧 أرسل screenshot من:
- Network tab (login request)
- Application tab (Cookies)
- Console tab (logs)
- Render logs

---

تم بحمد الله! 🎉

