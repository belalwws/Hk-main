#!/usr/bin/env node

/**
 * 🧪 اختبار نظام رفع الشهادات
 * يتحقق من جميع المكونات المطلوبة لعمل نظام الشهادات
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 اختبار نظام رفع الشهادات...\n')

// 1. فحص المجلدات المطلوبة
console.log('📁 فحص المجلدات...')
const requiredDirs = [
  'public/certificates',
  'app/api/admin/certificate-template',
  'app/api/admin/certificate-settings',
  'app/admin/certificate-settings'
]

let allDirsExist = true
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}`)
  } else {
    console.log(`❌ ${dir} - غير موجود`)
    allDirsExist = false
  }
})

// 2. فحص الملفات المطلوبة
console.log('\n📄 فحص الملفات المطلوبة...')
const requiredFiles = [
  'app/api/admin/certificate-template/route.ts',
  'app/api/admin/certificate-settings/route.ts',
  'app/admin/certificate-settings/page.tsx',
  'public/row-certificat.png'
]

let allFilesExist = true
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - غير موجود`)
    allFilesExist = false
  }
})

// 3. فحص محتوى الملفات
console.log('\n🔍 فحص محتوى الملفات...')

// فحص API endpoint للرفع
const uploadApiPath = 'app/api/admin/certificate-template/route.ts'
if (fs.existsSync(uploadApiPath)) {
  const content = fs.readFileSync(uploadApiPath, 'utf8')
  const checks = [
    { pattern: /certificateImage/, name: 'معالجة ملف الشهادة' },
    { pattern: /mkdir.*certificates/, name: 'إنشاء مجلد الشهادات' },
    { pattern: /writeFile/, name: 'حفظ الملف' },
    { pattern: /console\.log.*Upload/, name: 'تسجيل العمليات' }
  ]
  
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`)
    } else {
      console.log(`❌ ${check.name} - غير موجود`)
    }
  })
}

// فحص صفحة الإعدادات
const settingsPagePath = 'app/admin/certificate-settings/page.tsx'
if (fs.existsSync(settingsPagePath)) {
  const content = fs.readFileSync(settingsPagePath, 'utf8')
  const checks = [
    { pattern: /handleCertificateUpload/, name: 'دالة رفع الشهادة' },
    { pattern: /drawCertificate/, name: 'دالة رسم الشهادة' },
    { pattern: /handleCanvasClick/, name: 'دالة تحريك الاسم' },
    { pattern: /previewError/, name: 'معالجة الأخطاء' },
    { pattern: /loadCertificateImage/, name: 'تحميل الصورة' }
  ]
  
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`)
    } else {
      console.log(`❌ ${check.name} - غير موجود`)
    }
  })
}

// 4. فحص أذونات المجلدات
console.log('\n🔐 فحص أذونات المجلدات...')
try {
  const testFile = 'public/certificates/test-write.tmp'
  fs.writeFileSync(testFile, 'test')
  fs.unlinkSync(testFile)
  console.log('✅ مجلد الشهادات قابل للكتابة')
} catch (error) {
  console.log('❌ مجلد الشهادات غير قابل للكتابة:', error.message)
}

// 5. النتيجة النهائية
console.log('\n🎯 النتيجة النهائية:')
if (allDirsExist && allFilesExist) {
  console.log('✅ جميع المكونات موجودة وجاهزة!')
  console.log('🚀 يمكنك الآن اختبار رفع الشهادات على الموقع')
} else {
  console.log('❌ بعض المكونات مفقودة')
  console.log('🔧 يرجى التأكد من وجود جميع الملفات والمجلدات المطلوبة')
}

console.log('\n📋 خطوات الاختبار:')
console.log('1. افتح الموقع: https://hackathon-platform-601l.onrender.com/admin/certificate-settings')
console.log('2. جرب رفع صورة شهادة جديدة')
console.log('3. تأكد من ظهور المعاينة')
console.log('4. جرب تحريك الاسم بالنقر على الشهادة')
console.log('5. احفظ الإعدادات')

console.log('\n🛠️ في حالة وجود مشاكل:')
console.log('- تحقق من console المتصفح للأخطاء')
console.log('- تحقق من logs الخادم')
console.log('- تأكد من أن الملفات تم رفعها بنجاح')
