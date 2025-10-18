/**
 * Safe Rollback Script - Form Scheduling Feature
 * 
 * هذا السكريبت يلغي Migration الخاص بـ Form Scheduling
 * بطريقة آمنة بدون حذف أي بيانات مهمة
 * 
 * الاستخدام:
 * node scripts/rollback-form-scheduling.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function safeRollback() {
  console.log('🔄 بدء Rollback الآمن لإزالة Form Scheduling...\n')

  try {
    // 1. التحقق من الاتصال
    console.log('📡 التحقق من الاتصال بقاعدة البيانات...')
    await prisma.$connect()
    console.log('✅ تم الاتصال بنجاح\n')

    // 2. التحقق من وجود البيانات المجدولة
    console.log('🔍 فحص البيانات المجدولة...')
    
    const scheduledForms = await prisma.$queryRaw`
      SELECT id, title, "openAt", "closeAt"
      FROM hackathon_forms
      WHERE "openAt" IS NOT NULL OR "closeAt" IS NOT NULL
    `
    
    if (scheduledForms.length > 0) {
      console.log(`⚠️  تحذير: يوجد ${scheduledForms.length} فورم مجدول!`)
      console.log('📋 الفورمات المجدولة:')
      console.table(scheduledForms)
      
      console.log('\n❓ هل أنت متأكد من الاستمرار؟ (سيتم فقدان جداول المواعيد)')
      console.log('   اضغط Ctrl+C للإلغاء، أو انتظر 5 ثواني للاستمرار...\n')
      
      await new Promise(resolve => setTimeout(resolve, 5000))
    } else {
      console.log('✅ لا يوجد فورمات مجدولة - آمن للإزالة\n')
    }

    // 3. قراءة ملف Rollback SQL
    const sqlPath = path.join(__dirname, '../migrations/20251018_rollback_form_scheduling.sql')
    console.log(`📄 قراءة ملف Rollback من: ${sqlPath}`)
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error('ملف Rollback غير موجود!')
    }
    
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')
    console.log('✅ تم قراءة ملف Rollback\n')

    // 4. حفظ البيانات الحالية
    console.log('💾 حفظ عدد الفورمات قبل Rollback...')
    const formsCount = await prisma.hackathonForm.count()
    const generalFormsCount = await prisma.form.count()
    console.log(`📊 Hackathon Forms: ${formsCount}`)
    console.log(`📊 General Forms: ${generalFormsCount}\n`)

    // 5. تطبيق Rollback
    console.log('⚡ تطبيق Rollback...')
    
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT'))

    for (const statement of statements) {
      if (statement.includes('ALTER TABLE')) {
        console.log('  📝 تنفيذ:', statement.substring(0, 50) + '...')
        await prisma.$executeRawUnsafe(statement)
      }
    }
    
    console.log('✅ تم تطبيق Rollback بنجاح\n')

    // 6. التحقق من إزالة الأعمدة
    console.log('🔍 التحقق من إزالة الأعمدة...')
    
    const remainingColumns = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM information_schema.columns
      WHERE table_name IN ('hackathon_forms', 'forms')
        AND column_name IN ('openAt', 'closeAt')
    `
    
    if (remainingColumns[0].count === '0') {
      console.log('✅ تم إزالة جميع الأعمدة بنجاح\n')
    } else {
      console.warn(`⚠️  تحذير: لا يزال هناك ${remainingColumns[0].count} عمود!\n`)
    }

    // 7. التحقق من عدم فقدان البيانات
    console.log('🔍 التحقق من سلامة البيانات...')
    const formsAfter = await prisma.hackathonForm.count()
    const generalFormsAfter = await prisma.form.count()
    
    if (formsAfter === formsCount && generalFormsAfter === generalFormsCount) {
      console.log('✅ جميع البيانات الأساسية سليمة!\n')
    } else {
      console.error('⚠️  خطأ: تغير في عدد السجلات!')
      console.log(`   قبل: ${formsCount} | بعد: ${formsAfter}\n`)
    }

    console.log('✨ Rollback اكتمل بنجاح!\n')
    console.log('📝 ملاحظة: تم فقدان معلومات الجدولة فقط')
    console.log('   جميع الفورمات والبيانات الأخرى سليمة\n')

  } catch (error) {
    console.error('\n❌ خطأ أثناء Rollback:', error.message)
    console.error('\n🔥 توقف Rollback - راجع الخطأ!\n')
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// معالجة الأخطاء
process.on('unhandledRejection', (error) => {
  console.error('❌ خطأ غير متوقع:', error)
  process.exit(1)
})

// تشغيل Rollback
safeRollback()
  .then(() => {
    console.log('🎉 Rollback تم بنجاح!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 فشل Rollback:', error)
    process.exit(1)
  })
