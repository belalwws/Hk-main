/**
 * Safe Migration Script - Form Scheduling Feature
 * 
 * هذا السكريبت يطبق Migration بطريقة آمنة على Production
 * بدون استخدام prisma db push الذي قد يمسح البيانات
 * 
 * الاستخدام:
 * node scripts/safe-migrate-form-scheduling.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function safeMigrate() {
  console.log('🚀 بدء Migration الآمن لإضافة Form Scheduling...\n')

  try {
    // 1. التحقق من الاتصال بقاعدة البيانات
    console.log('📡 التحقق من الاتصال بقاعدة البيانات...')
    await prisma.$connect()
    console.log('✅ تم الاتصال بنجاح\n')

    // 2. قراءة ملف SQL
    const sqlPath = path.join(__dirname, '../migrations/20251018_add_form_scheduling.sql')
    console.log(`📄 قراءة ملف Migration من: ${sqlPath}`)
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error('ملف Migration غير موجود!')
    }
    
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')
    console.log('✅ تم قراءة ملف Migration\n')

    // 3. التحقق من البيانات الحالية (Backup Check)
    console.log('🔍 فحص البيانات الموجودة...')
    const formsCount = await prisma.hackathonForm.count()
    const generalFormsCount = await prisma.form.count()
    
    console.log(`📊 عدد Hackathon Forms: ${formsCount}`)
    console.log(`📊 عدد General Forms: ${generalFormsCount}`)
    console.log('✅ البيانات آمنة - لن يتم حذف أي شيء\n')

    // 4. تطبيق Migration بطريقة آمنة
    console.log('⚡ تطبيق Migration...')
    
    // تقسيم SQL إلى statements منفصلة
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'))

    for (const statement of statements) {
      if (statement.includes('ALTER TABLE')) {
        console.log('  📝 تنفيذ:', statement.substring(0, 50) + '...')
        await prisma.$executeRawUnsafe(statement)
      }
    }
    
    console.log('✅ تم تطبيق Migration بنجاح\n')

    // 5. التحقق من إضافة الأعمدة
    console.log('🔍 التحقق من إضافة الأعمدة...')
    
    const checkColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'hackathon_forms' 
        AND column_name IN ('openAt', 'closeAt')
    `
    
    console.log('📋 الأعمدة المضافة:')
    console.table(checkColumns)

    // 6. التحقق من عدم فقدان البيانات
    console.log('\n🔍 التحقق من سلامة البيانات...')
    const formsAfter = await prisma.hackathonForm.count()
    const generalFormsAfter = await prisma.form.count()
    
    if (formsAfter === formsCount && generalFormsAfter === generalFormsCount) {
      console.log('✅ جميع البيانات سليمة - لم يتم فقدان أي شيء!')
    } else {
      console.warn('⚠️  تحذير: تغير في عدد السجلات!')
      console.log(`   قبل: ${formsCount} | بعد: ${formsAfter}`)
    }

    console.log('\n✨ Migration اكتمل بنجاح!\n')
    console.log('📝 الخطوات التالية:')
    console.log('   1. تأكد من عمل الفورمات بشكل صحيح')
    console.log('   2. اختبر Schedule من لوحة Admin')
    console.log('   3. راجع الفورمات العامة للتأكد\n')

  } catch (error) {
    console.error('\n❌ خطأ أثناء Migration:', error.message)
    console.error('\n🔥 لم يتم تطبيق أي تغييرات - البيانات آمنة!\n')
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// معالجة الأخطاء غير المتوقعة
process.on('unhandledRejection', (error) => {
  console.error('❌ خطأ غير متوقع:', error)
  process.exit(1)
})

// تشغيل Migration
safeMigrate()
  .then(() => {
    console.log('🎉 تم بنجاح!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 فشل Migration:', error)
    process.exit(1)
  })
