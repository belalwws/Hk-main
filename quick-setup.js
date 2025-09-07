const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

async function quickSetup() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 إعداد سريع للنظام...');

    // 1. إنشاء Admin
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@hackathon.com',
        password_hash: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
        phone: '1234567890',
        city: 'الرياض',
        nationality: 'سعودي'
      }
    });

    // 2. إنشاء Judge
    const judgeUser = await prisma.user.create({
      data: {
        name: 'د. أحمد المحكم',
        email: 'judge2024@hackathon.com',
        password_hash: await bcrypt.hash('judge123', 10),
        role: 'JUDGE',
        phone: '0501234567',
        city: 'الرياض',
        nationality: 'سعودي'
      }
    });

    // 3. إنشاء هاكاثون
    const hackathon = await prisma.hackathon.create({
      data: {
        title: 'تصميم وبرمجة موقع الكتروني',
        description: 'هاكاثون لتطوير المواقع الإلكترونية المبتكرة',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-22'),
        registrationDeadline: new Date('2025-01-10'),
        maxParticipants: 100,
        status: 'OPEN',
        evaluationOpen: false,
        prizes: {
          first: '50000',
          second: '30000', 
          third: '20000'
        },
        categories: ['تطوير الويب', 'تصميم UI/UX', 'الذكاء الاصطناعي'],
        requirements: ['خبرة في البرمجة', 'العمل الجماعي'],
        isPinned: true,
        createdBy: admin.id
      }
    });

    // 4. ربط المحكم بالهاكاثون
    await prisma.judge.create({
      data: {
        userId: judgeUser.id,
        hackathonId: hackathon.id,
        isActive: true
      }
    });

    console.log('✅ تم الإعداد بنجاح!');
    console.log('📧 Admin: admin@hackathon.com / admin123');
    console.log('📧 Judge: judge2024@hackathon.com / judge123');
    console.log(`🎯 Hackathon ID: ${hackathon.id}`);

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickSetup();
