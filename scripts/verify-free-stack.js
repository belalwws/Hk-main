#!/usr/bin/env node

/**
 * Verify Free Stack Configuration
 * Checks if all services are configured correctly
 */

console.log('🔍 Verifying Free Stack Configuration...\n')

const checks = {
  database: false,
  cloudinary: false,
  resend: false,
  auth: false,
}

// Check Database
console.log('📊 Checking Database (Neon)...')
if (process.env.DATABASE_URL) {
  if (process.env.DATABASE_URL.includes('neon.tech')) {
    console.log('✅ Neon database configured')
    checks.database = true
  } else if (process.env.DATABASE_URL.includes('render.com')) {
    console.log('⚠️  Still using Render database')
    console.log('   → Migrate to Neon: https://neon.tech')
  } else {
    console.log('✅ Database URL configured')
    checks.database = true
  }
} else {
  console.log('❌ DATABASE_URL not set')
}

// Check Cloudinary
console.log('\n📁 Checking File Storage (Cloudinary)...')
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  console.log('✅ Cloudinary configured')
  console.log(`   Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`)
  checks.cloudinary = true
} else {
  console.log('❌ Cloudinary not configured')
  console.log('   Missing:')
  if (!process.env.CLOUDINARY_CLOUD_NAME) console.log('   - CLOUDINARY_CLOUD_NAME')
  if (!process.env.CLOUDINARY_API_KEY) console.log('   - CLOUDINARY_API_KEY')
  if (!process.env.CLOUDINARY_API_SECRET) console.log('   - CLOUDINARY_API_SECRET')
  console.log('   → Sign up: https://cloudinary.com')
}

// Check Resend
console.log('\n📧 Checking Email Service (Resend)...')
if (process.env.RESEND_API_KEY) {
  console.log('✅ Resend configured')
  checks.resend = true
} else {
  console.log('❌ RESEND_API_KEY not set')
  console.log('   → Sign up: https://resend.com')
}

// Check Auth
console.log('\n🔐 Checking Authentication...')
if (process.env.JWT_SECRET && process.env.NEXTAUTH_SECRET) {
  if (process.env.JWT_SECRET.length >= 32 && process.env.NEXTAUTH_SECRET.length >= 32) {
    console.log('✅ Auth secrets configured')
    checks.auth = true
  } else {
    console.log('⚠️  Auth secrets too short (minimum 32 characters)')
  }
} else {
  console.log('❌ Auth secrets not set')
  if (!process.env.JWT_SECRET) console.log('   - JWT_SECRET')
  if (!process.env.NEXTAUTH_SECRET) console.log('   - NEXTAUTH_SECRET')
}

// Summary
console.log('\n' + '='.repeat(50))
console.log('📋 Summary:')
console.log('='.repeat(50))

const total = Object.keys(checks).length
const passed = Object.values(checks).filter(Boolean).length

console.log(`✅ Passed: ${passed}/${total}`)
console.log(`❌ Failed: ${total - passed}/${total}`)

if (passed === total) {
  console.log('\n🎉 All checks passed! Ready to deploy on Vercel!')
  console.log('\nNext steps:')
  console.log('1. git add .')
  console.log('2. git commit -m "Configure free stack"')
  console.log('3. git push')
  console.log('4. Deploy on Vercel: https://vercel.com')
} else {
  console.log('\n⚠️  Some checks failed. Please configure missing services.')
  console.log('\nSee MIGRATION_TO_FREE_STACK.md for detailed instructions.')
}

console.log('\n' + '='.repeat(50))

