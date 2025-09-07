const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Sample data for generating diverse users
const firstNames = [
  'أحمد', 'محمد', 'عبدالله', 'عبدالرحمن', 'علي', 'خالد', 'سعد', 'فهد', 'عبدالعزيز', 'يوسف',
  'فاطمة', 'عائشة', 'مريم', 'زينب', 'خديجة', 'سارة', 'نورا', 'ريم', 'هند', 'لينا',
  'Omar', 'Hassan', 'Youssef', 'Amr', 'Karim', 'Tarek', 'Mahmoud', 'Ibrahim', 'Mostafa', 'Adel',
  'Nour', 'Yasmin', 'Dina', 'Rana', 'Salma', 'Layla', 'Reem', 'Jana', 'Lara', 'Maya'
]

const lastNames = [
  'الأحمد', 'المحمد', 'العلي', 'الخالد', 'السعد', 'الفهد', 'العبدالله', 'اليوسف', 'الحسن', 'العثمان',
  'Ahmed', 'Mohamed', 'Ali', 'Hassan', 'Ibrahim', 'Mahmoud', 'Youssef', 'Omar', 'Karim', 'Adel',
  'الزهراني', 'القحطاني', 'الغامدي', 'العتيبي', 'الدوسري', 'الشهري', 'الحربي', 'المطيري', 'العنزي', 'الرشيد'
]

const cities = ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة', 'الطائف', 'تبوك', 'أبها', 'حائل', 'الخبر', 'القطيف', 'الجبيل']

const nationalities = ['سعودي', 'مصر', 'الأردن', 'لبنان', 'سوريا', 'العراق', 'فلسطين', 'الكويت', 'الإمارات', 'قطر', 'البحرين', 'عمان']

const roles = [
  'مطور واجهات أمامية', 'مطور واجهات خلفية', 'مطور تطبيقات موبايل', 'مصمم UI/UX', 'مصمم جرافيك',
  'محلل بيانات', 'مختص أمن سيبراني', 'مدير مشروع', 'قائد الفريق', 'مطور ذكاء اصطناعي',
  'مهندس DevOps', 'مختص تسويق رقمي', 'محلل أعمال', 'مطور ألعاب', 'مهندس شبكات'
]

const skills = [
  'JavaScript, React, Node.js', 'Python, Django, Flask', 'Java, Spring Boot', 'C#, .NET Core',
  'PHP, Laravel', 'Flutter, Dart', 'Swift, iOS Development', 'Kotlin, Android Development',
  'Vue.js, Nuxt.js', 'Angular, TypeScript', 'React Native', 'Unity, C#', 'Figma, Adobe XD',
  'Photoshop, Illustrator', 'SQL, MongoDB', 'AWS, Docker', 'Machine Learning, TensorFlow',
  'Cybersecurity, Penetration Testing', 'Blockchain, Solidity', 'Data Science, Pandas'
]

const experiences = [
  'خبرة 3 سنوات في تطوير المواقع', 'خبرة سنتين في تطوير التطبيقات', 'خبرة 5 سنوات في التصميم',
  'خبرة 4 سنوات في إدارة المشاريع', 'خبرة سنة في تحليل البيانات', 'خبرة 6 سنوات في الأمن السيبراني',
  'خبرة 2 سنة في الذكاء الاصطناعي', 'خبرة 3 سنوات في DevOps', 'خبرة سنة في تطوير الألعاب',
  'طالب جامعي - مبتدئ', 'خريج حديث', 'خبرة 7 سنوات في البرمجة'
]

const teamTypes = ['INDIVIDUAL', 'TEAM']

async function create50UsersAndRegister() {
  try {
    console.log('🚀 Starting creation of 50 users and registering them in hackathon...')
    
    const hackathonId = 'cmf615vsc0000fdvwnr1jfiwy'
    
    // Verify hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { id: true, title: true }
    })
    
    if (!hackathon) {
      console.error('❌ Hackathon not found!')
      return
    }
    
    console.log(`✅ Found hackathon: ${hackathon.title}`)
    
    const users = []
    const participants = []
    
    for (let i = 1; i <= 50; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const name = `${firstName} ${lastName}`
      const email = `user${i}.hackathon2024@gmail.com`
      const phone = `05${Math.floor(Math.random() * 90000000) + 10000000}`
      const city = cities[Math.floor(Math.random() * cities.length)]
      const nationality = nationalities[Math.floor(Math.random() * nationalities.length)]
      const preferredRole = roles[Math.floor(Math.random() * roles.length)]
      const skill = skills[Math.floor(Math.random() * skills.length)]
      const experience = experiences[Math.floor(Math.random() * experiences.length)]
      const teamType = teamTypes[Math.floor(Math.random() * teamTypes.length)]
      
      // Hash password
      const password = 'hackathon2024'
      const hashedPassword = await bcrypt.hash(password, 12)
      
      users.push({
        name,
        email,
        password_hash: hashedPassword,
        phone,
        city,
        nationality,
        skills: skill,
        experience,
        preferredRole,
        role: 'PARTICIPANT'
      })
      
      // Prepare participant data
      participants.push({
        email,
        hackathonId,
        teamType,
        teamRole: preferredRole,
        status: Math.random() > 0.7 ? 'PENDING' : (Math.random() > 0.5 ? 'APPROVED' : 'REJECTED')
      })
    }
    
    console.log('👤 Creating 50 users...')
    
    // Create users in batches
    const batchSize = 10
    const createdUsers = []
    
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      
      for (const userData of batch) {
        try {
          const user = await prisma.user.create({ data: userData })
          createdUsers.push(user)
          console.log(`✅ Created user ${createdUsers.length}/50: ${user.name} (${user.email})`)
        } catch (error) {
          console.error(`❌ Failed to create user ${userData.email}:`, error.message)
        }
      }
    }
    
    console.log(`\n🎯 Successfully created ${createdUsers.length} users`)
    
    // Now register them in the hackathon
    console.log('\n📝 Registering users in hackathon...')
    
    let registeredCount = 0
    
    for (let i = 0; i < participants.length && i < createdUsers.length; i++) {
      const user = createdUsers[i]
      const participantData = participants[i]
      
      try {
        const participant = await prisma.participant.create({
          data: {
            userId: user.id,
            hackathonId: participantData.hackathonId,
            teamType: participantData.teamType,
            teamRole: participantData.teamRole,
            status: participantData.status,
            registeredAt: new Date()
          }
        })
        
        registeredCount++
        console.log(`✅ Registered ${registeredCount}/50: ${user.name} - ${participantData.status}`)
        
      } catch (error) {
        console.error(`❌ Failed to register ${user.email}:`, error.message)
      }
    }
    
    // Get final statistics
    const totalUsers = await prisma.user.count()
    const totalParticipants = await prisma.participant.count({
      where: { hackathonId }
    })
    
    const statusCounts = await prisma.participant.groupBy({
      by: ['status'],
      where: { hackathonId },
      _count: { status: true }
    })
    
    console.log('\n📊 Final Statistics:')
    console.log(`👥 Total users in system: ${totalUsers}`)
    console.log(`🎯 Total participants in hackathon: ${totalParticipants}`)
    console.log('\n📈 Participant status breakdown:')
    statusCounts.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count.status}`)
    })
    
    console.log('\n🎉 Mission accomplished! 50 users created and registered!')
    console.log(`🔗 Check them at: http://localhost:3000/admin/hackathons/${hackathonId}`)
    
  } catch (error) {
    console.error('❌ Error in process:', error)
  } finally {
    await prisma.$disconnect()
  }
}

create50UsersAndRegister()
