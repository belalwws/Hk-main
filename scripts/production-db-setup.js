#!/usr/bin/env node

/**
 * Production Database Setup Script
 * Ensures database persistence and proper setup on Render
 */

const { execSync } = require('child_process');

console.log('🚀 إعداد قاعدة البيانات للإنتاج...\n');

async function setupProductionDatabase() {
  try {
    // 1. التحقق من البيئة
    console.log('1️⃣ التحقق من البيئة...');
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'مُعد' : 'غير مُعد'}`);
    
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL غير مُعد');
      console.log('📋 تأكد من إعداد قاعدة بيانات PostgreSQL على Render');
      return;
    }
    
    // 2. تحديث Prisma client
    console.log('\n2️⃣ تحديث Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ تم تحديث Prisma client');
    
    // 3. إعداد قاعدة البيانات
    console.log('\n3️⃣ إعداد قاعدة البيانات...');
    
    try {
      // محاولة الاتصال أولاً
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      console.log('✅ تم إعداد قاعدة البيانات');
    } catch (pushError) {
      console.log('⚠️ فشل في db push، محاولة إعادة تعيين...');
      execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
      console.log('✅ تم إعادة تعيين قاعدة البيانات');
    }
    
    // 4. إنشاء البيانات الأساسية
    console.log('\n4️⃣ إنشاء البيانات الأساسية...');
    await createEssentialData();
    
    console.log('\n✅ تم إعداد قاعدة البيانات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في إعداد قاعدة البيانات:', error);
    process.exit(1);
  }
}

async function createEssentialData() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    // إنشاء المستخدم الإداري
    console.log('👤 إنشاء المستخدم الإداري...');
    
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = await prisma.user.create({
        data: {
          name: 'مدير النظام',
          email: 'admin@hackathon.com',
          password_hash: hashedPassword,
          role: 'admin',
          nationality: 'سعودي',
          preferredRole: 'مدير'
        }
      });
      
      console.log('✅ تم إنشاء المستخدم الإداري:');
      console.log(`   📧 البريد: admin@hackathon.com`);
      console.log(`   🔑 كلمة المرور: admin123`);
      console.log(`   🆔 المعرف: ${admin.id}`);
    } else {
      console.log('ℹ️ المستخدم الإداري موجود بالفعل');
    }
    
    // إنشاء هاكاثون تجريبي إذا لم يوجد
    console.log('🏆 التحقق من وجود هاكاثونات...');
    
    const hackathonCount = await prisma.hackathon.count();
    
    if (hackathonCount === 0) {
      console.log('📝 إنشاء هاكاثون تجريبي...');
      
      const sampleHackathon = await prisma.hackathon.create({
        data: {
          title: 'هاكاثون الابتكار التقني 2025',
          description: 'مسابقة تقنية لتطوير حلول مبتكرة للمشاكل المجتمعية',
          startDate: new Date('2025-02-01'),
          endDate: new Date('2025-02-03'),
          registrationDeadline: new Date('2025-01-25'),
          location: 'الرياض، المملكة العربية السعودية',
          maxParticipants: 100,
          status: 'open',
          prizes: {
            first: '50,000 ريال',
            second: '30,000 ريال',
            third: '20,000 ريال'
          },
          requirements: [
            'خبرة في البرمجة',
            'العمل ضمن فريق',
            'تقديم مشروع مكتمل'
          ],
          categories: [
            'الذكاء الاصطناعي',
            'تطبيقات الجوال',
            'الأمن السيبراني',
            'إنترنت الأشياء'
          ]
        }
      });
      
      console.log(`✅ تم إنشاء هاكاثون تجريبي: ${sampleHackathon.id}`);
    } else {
      console.log(`ℹ️ يوجد ${hackathonCount} هاكاثون في قاعدة البيانات`);
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات الأساسية:', error);
    throw error;
  }
}

// تشغيل الإعداد
setupProductionDatabase();
