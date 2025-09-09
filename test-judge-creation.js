const { PrismaClient, UserRole } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testJudgeCreation() {
  try {
    console.log('🧪 Testing judge creation...')

    // Get a hackathon ID
    const hackathon = await prisma.hackathon.findFirst()
    if (!hackathon) {
      console.log('❌ No hackathon found!')
      return
    }

    console.log(`📋 Using hackathon: ${hackathon.title}`)

    // Test data
    const testJudge = {
      name: 'Test Judge',
      email: 'test.judge@example.com',
      phone: '1234567890',
      password: 'test123',
      hackathonId: hackathon.id
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testJudge.email }
    })

    if (existingUser) {
      console.log('⚠️ Test user already exists, deleting...')
      await prisma.judge.deleteMany({
        where: { userId: existingUser.id }
      })
      await prisma.user.delete({
        where: { id: existingUser.id }
      })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(testJudge.password, 12)

    // Create user and judge in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: testJudge.name,
          email: testJudge.email,
          password_hash: passwordHash,
          phone: testJudge.phone,
          role: UserRole.judge
        }
      })

      console.log(`✅ Created user with role: ${user.role}`)

      // Create judge assignment
      const judge = await tx.judge.create({
        data: {
          userId: user.id,
          hackathonId: testJudge.hackathonId,
          isActive: true
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true
            }
          },
          hackathon: {
            select: {
              id: true,
              title: true
            }
          }
        }
      })

      return { user, judge }
    })

    console.log('🎉 Judge created successfully!')
    console.log(`👤 User: ${result.user.name} (${result.user.email}) - Role: ${result.user.role}`)
    console.log(`⚖️ Judge: Active: ${result.judge.isActive}, Hackathon: ${result.judge.hackathon.title}`)

  } catch (error) {
    console.error('❌ Error creating test judge:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testJudgeCreation()
