#!/usr/bin/env node

/**
 * Script to fix database persistence issues on Render
 * This ensures data survives deployments
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 إصلاح مشكلة استمرارية قاعدة البيانات...\n');

async function fixDatabasePersistence() {
  try {
    // 1. التحقق من وجود DATABASE_URL
    console.log('1️⃣ التحقق من إعدادات قاعدة البيانات...');
    
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL غير موجود');
      console.log('📋 يجب إعداد قاعدة بيانات PostgreSQL دائمة على Render');
      console.log('\n🔗 خطوات الإعداد:');
      console.log('1. اذهب إلى Render Dashboard');
      console.log('2. أنشئ PostgreSQL database جديد');
      console.log('3. انسخ DATABASE_URL وأضفه في Environment Variables');
      console.log('4. تأكد من أن Database Plan ليس Free (Free plans تُحذف البيانات)');
      return;
    }
    
    console.log('✅ DATABASE_URL موجود');
    
    // 2. التحقق من الاتصال بقاعدة البيانات
    console.log('\n2️⃣ التحقق من الاتصال بقاعدة البيانات...');
    
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      await prisma.$connect();
      console.log('✅ الاتصال بقاعدة البيانات نجح');
      
      // 3. التحقق من وجود الجداول
      console.log('\n3️⃣ التحقق من وجود الجداول...');
      
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      console.log(`📊 عدد الجداول الموجودة: ${tables.length}`);
      
      if (tables.length === 0) {
        console.log('⚠️ لا توجد جداول، سيتم إنشاؤها...');
        
        // 4. تشغيل Prisma migrations
        console.log('\n4️⃣ إنشاء الجداول...');
        execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
        console.log('✅ تم إنشاء الجداول');
        
        // 5. إنشاء المستخدم الإداري
        console.log('\n5️⃣ إنشاء المستخدم الإداري...');
        await createAdminUser(prisma);
        
      } else {
        console.log('✅ الجداول موجودة');
        
        // التحقق من وجود المستخدم الإداري
        const adminUser = await prisma.user.findFirst({
          where: { role: 'admin' }
        });
        
        if (!adminUser) {
          console.log('\n⚠️ لا يوجد مستخدم إداري، سيتم إنشاؤه...');
          await createAdminUser(prisma);
        } else {
          console.log('✅ المستخدم الإداري موجود');
        }
      }
      
      await prisma.$disconnect();
      
    } catch (dbError) {
      console.error('❌ خطأ في قاعدة البيانات:', dbError.message);
      
      if (dbError.message.includes('does not exist')) {
        console.log('\n🔧 محاولة إنشاء قاعدة البيانات...');
        execSync('npx prisma db push', { stdio: 'inherit' });
      }
    }
    
    // 6. إنشاء ملف التحقق من الاستمرارية
    console.log('\n6️⃣ إنشاء ملف التحقق من الاستمرارية...');
    createPersistenceCheck();
    
    console.log('\n✅ تم إصلاح مشكلة استمرارية قاعدة البيانات!');
    console.log('\n📋 للتأكد من الاستمرارية:');
    console.log('1. تأكد من أن Database Plan على Render ليس Free');
    console.log('2. استخدم PostgreSQL بدلاً من SQLite');
    console.log('3. تأكد من أن DATABASE_URL يشير لقاعدة بيانات دائمة');
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح قاعدة البيانات:', error);
  }
}

async function createAdminUser(prisma) {
  try {
    const bcrypt = require('bcryptjs');
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
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ المستخدم الإداري موجود بالفعل');
    } else {
      console.error('❌ خطأ في إنشاء المستخدم الإداري:', error);
    }
  }
}

function createPersistenceCheck() {
  const checkScript = `#!/usr/bin/env node

/**
 * Script to check database persistence after deployment
 */

const { PrismaClient } = require('@prisma/client');

async function checkPersistence() {
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    // Check if admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (adminUser) {
      console.log('✅ قاعدة البيانات مستمرة - المستخدم الإداري موجود');
      console.log(\`📧 البريد: \${adminUser.email}\`);
    } else {
      console.log('❌ قاعدة البيانات غير مستمرة - المستخدم الإداري مفقود');
    }
    
    // Check participants count
    const participantsCount = await prisma.participant.count();
    console.log(\`👥 عدد المشاركين: \${participantsCount}\`);
    
    // Check hackathons count
    const hackathonsCount = await prisma.hackathon.count();
    console.log(\`🏆 عدد الهاكاثونات: \${hackathonsCount}\`);
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ خطأ في التحقق من الاستمرارية:', error);
  }
}

checkPersistence();
`;

  fs.writeFileSync(path.join(__dirname, 'check-persistence.js'), checkScript);
  console.log('✅ تم إنشاء ملف التحقق من الاستمرارية');
}

// تشغيل الإصلاح
fixDatabasePersistence();
