const crypto = require('crypto')

function generateJWTSecret() {
  // توليد مفتاح عشوائي قوي 64 بايت
  const secret = crypto.randomBytes(64).toString('hex')
  
  console.log('🔐 JWT Secret تم توليده بنجاح!')
  console.log('📋 انسخ هذا المفتاح واستخدمه في متغير JWT_SECRET:')
  console.log('')
  console.log('JWT_SECRET="' + secret + '"')
  console.log('')
  console.log('⚠️  احتفظ بهذا المفتاح في مكان آمن!')
  console.log('🚫 لا تشاركه مع أحد أو تضعه في الكود!')
  
  return secret
}

// تشغيل الدالة
generateJWTSecret()
