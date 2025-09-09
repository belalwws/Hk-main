const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createHackathonWithParticipants() {
  try {
    console.log('🚀 إنشاء هاكاثون جديد مع 15 مشارك...')

    // البحث عن أدمن موجود أو إنشاء واحد
    let admin = await prisma.user.findFirst({
      where: { email: 'admin@hackathon.gov.sa' }
    })

    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      admin = await prisma.user.create({
        data: {
          name: 'مدير النظام',
          email: 'admin@hackathon.gov.sa',
          password_hash: hashedPassword,
          role: 'admin'
        }
      })
    }

    // إنشاء الهاكاثون
    const hackathon = await prisma.hackathon.create({
      data: {
        title: 'هاكاثون تطوير التطبيقات المبتكرة 2025',
        description: 'مسابقة لتطوير تطبيقات مبتكرة تخدم المجتمع السعودي وتحل مشاكل حقيقية',
        startDate: new Date('2025-02-15T09:00:00Z'),
        endDate: new Date('2025-02-17T18:00:00Z'),
        registrationDeadline: new Date('2025-02-10T23:59:59Z'),
        maxParticipants: 100,
        status: 'open',
        requirements: 'خبرة في البرمجة، العمل الجماعي، الإبداع',
        createdBy: admin.id,
        settings: {
          allowTeams: true,
          maxTeamSize: 4,
          requiresApproval: true
        }
      }
    })

    console.log(`✅ تم إنشاء الهاكاثون: ${hackathon.title}`)
    console.log(`📅 تاريخ البداية: ${hackathon.startDate}`)
    console.log(`📅 تاريخ النهاية: ${hackathon.endDate}`)

    // بيانات المشاركين المتنوعة
    const participants = [
      {
        name: 'أحمد محمد العلي',
        email: 'ahmed.ali@gmail.com',
        phone: '+966501234567',
        city: 'الرياض',
        nationality: 'سعودي',
        skills: 'React, Node.js, MongoDB',
        experience: 'مطور فول ستاك مع 3 سنوات خبرة',
        preferredRole: 'مطور'
      },
      {
        name: 'فاطمة عبدالله الزهراني',
        email: 'fatima.zahrani@outlook.com',
        phone: '+966502345678',
        city: 'جدة',
        nationality: 'سعودية',
        skills: 'UI/UX Design, Figma, Adobe XD',
        experience: 'مصممة واجهات مع سنتين خبرة',
        preferredRole: 'مصمم'
      },
      {
        name: 'محمد سعد القحطاني',
        email: 'mohammed.qahtani@hotmail.com',
        phone: '+966503456789',
        city: 'الدمام',
        nationality: 'سعودي',
        skills: 'Python, Django, PostgreSQL',
        experience: 'مطور باك إند مع 4 سنوات خبرة',
        preferredRole: 'مطور'
      },
      {
        name: 'نورا خالد الشمري',
        email: 'nora.shamri@gmail.com',
        phone: '+966504567890',
        city: 'الرياض',
        nationality: 'سعودية',
        skills: 'Project Management, Agile, Scrum',
        experience: 'مديرة مشاريع مع 5 سنوات خبرة',
        preferredRole: 'قائد فريق'
      },
      {
        name: 'عبدالرحمن أحمد الغامدي',
        email: 'abdulrahman.ghamdi@yahoo.com',
        phone: '+966505678901',
        city: 'الطائف',
        nationality: 'سعودي',
        skills: 'Flutter, Dart, Firebase',
        experience: 'مطور تطبيقات موبايل مع سنتين خبرة',
        preferredRole: 'مطور'
      },
      {
        name: 'سارة عمر البقمي',
        email: 'sara.baqami@gmail.com',
        phone: '+966506789012',
        city: 'مكة المكرمة',
        nationality: 'سعودية',
        skills: 'Digital Marketing, SEO, Content Creation',
        experience: 'أخصائية تسويق رقمي مع 3 سنوات خبرة',
        preferredRole: 'تسويق'
      },
      {
        name: 'يوسف علي الحربي',
        email: 'youssef.harbi@outlook.com',
        phone: '+966507890123',
        city: 'المدينة المنورة',
        nationality: 'سعودي',
        skills: 'Java, Spring Boot, MySQL',
        experience: 'مطور جافا مع 6 سنوات خبرة',
        preferredRole: 'مطور'
      },
      {
        name: 'ريم محمد العتيبي',
        email: 'reem.otaibi@hotmail.com',
        phone: '+966508901234',
        city: 'جدة',
        nationality: 'سعودية',
        skills: 'Data Analysis, Python, Tableau',
        experience: 'محللة بيانات مع سنتين خبرة',
        preferredRole: 'محلل بيانات'
      },
      {
        name: 'خالد عبدالعزيز الدوسري',
        email: 'khalid.dosari@gmail.com',
        phone: '+966509012345',
        city: 'الخبر',
        nationality: 'سعودي',
        skills: 'DevOps, Docker, Kubernetes, AWS',
        experience: 'مهندس DevOps مع 4 سنوات خبرة',
        preferredRole: 'مطور'
      },
      {
        name: 'هند سالم الشهري',
        email: 'hind.shahri@yahoo.com',
        phone: '+966500123456',
        city: 'أبها',
        nationality: 'سعودية',
        skills: 'Graphic Design, Branding, Photoshop',
        experience: 'مصممة جرافيك مع 3 سنوات خبرة',
        preferredRole: 'مصمم'
      },
      {
        name: 'عمر فهد المطيري',
        email: 'omar.mutairi@outlook.com',
        phone: '+966501234568',
        city: 'حائل',
        nationality: 'سعودي',
        skills: 'Vue.js, Laravel, PHP',
        experience: 'مطور ويب مع سنتين خبرة',
        preferredRole: 'مطور'
      },
      {
        name: 'لينا أحمد الجهني',
        email: 'lina.juhani@gmail.com',
        phone: '+966502345679',
        city: 'ينبع',
        nationality: 'سعودية',
        skills: 'Business Analysis, Requirements Gathering',
        experience: 'محللة أعمال مع 4 سنوات خبرة',
        preferredRole: 'محلل أعمال'
      },
      {
        name: 'سلطان عبدالله الرشيد',
        email: 'sultan.rashid@hotmail.com',
        phone: '+966503456780',
        city: 'بريدة',
        nationality: 'سعودي',
        skills: 'Cybersecurity, Ethical Hacking, Network Security',
        experience: 'أخصائي أمن سيبراني مع 5 سنوات خبرة',
        preferredRole: 'أمن سيبراني'
      },
      {
        name: 'مريم خالد العنزي',
        email: 'mariam.anzi@gmail.com',
        phone: '+966504567891',
        city: 'تبوك',
        nationality: 'سعودية',
        skills: 'Machine Learning, TensorFlow, Python',
        experience: 'مهندسة ذكاء اصطناعي مع 3 سنوات خبرة',
        preferredRole: 'مطور'
      },
      {
        name: 'بندر سعود الفيصل',
        email: 'bandar.faisal@yahoo.com',
        phone: '+966505678902',
        city: 'الجوف',
        nationality: 'سعودي',
        skills: 'Blockchain, Solidity, Web3',
        experience: 'مطور بلوك تشين مع سنتين خبرة',
        preferredRole: 'مطور'
      }
    ]

    console.log('\n📝 إنشاء المشاركين...')

    for (let i = 0; i < participants.length; i++) {
      const participantData = participants[i]
      
      try {
        // إنشاء المستخدم
        const hashedPassword = await bcrypt.hash('password123', 10)
        
        const user = await prisma.user.create({
          data: {
            name: participantData.name,
            email: participantData.email,
            password_hash: hashedPassword,
            phone: participantData.phone,
            city: participantData.city,
            nationality: participantData.nationality,
            role: 'participant',
            skills: participantData.skills,
            experience: participantData.experience,
            preferredRole: participantData.preferredRole
          }
        })

        // إنشاء المشاركة
        const participant = await prisma.participant.create({
          data: {
            userId: user.id,
            hackathonId: hackathon.id,
            status: 'pending',
            registeredAt: new Date()
          }
        })

        console.log(`✅ ${i + 1}. تم إنشاء المشارك: ${participantData.name} - ${participantData.city}`)
        
      } catch (error) {
        console.log(`❌ خطأ في إنشاء المشارك ${participantData.name}:`, error.message)
      }
    }

    // إحصائيات نهائية
    const totalParticipants = await prisma.participant.count({
      where: { hackathonId: hackathon.id }
    })

    const pendingParticipants = await prisma.participant.count({
      where: { 
        hackathonId: hackathon.id,
        status: 'pending'
      }
    })

    console.log('\n📊 الإحصائيات النهائية:')
    console.log(`🎯 الهاكاثون: ${hackathon.title}`)
    console.log(`👥 إجمالي المشاركين: ${totalParticipants}`)
    console.log(`⏳ المشاركين في انتظار الموافقة: ${pendingParticipants}`)
    console.log(`🆔 معرف الهاكاثون: ${hackathon.id}`)

  } catch (error) {
    console.error('❌ خطأ في إنشاء الهاكاثون والمشاركين:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createHackathonWithParticipants()
