import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Simple registration API called')
    
    const body = await request.json()
    console.log('📝 Registration data:', { 
      name: body.name, 
      email: body.email,
      hasPassword: !!body.password 
    })

    const { name, email, password, phone, city, nationality, preferredRole } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ 
        error: 'الاسم والإيميل وكلمة المرور مطلوبة' 
      }, { status: 400 })
    }

    // Try to connect to database
    let prisma: any = null
    try {
      const { prisma: prismaClient } = await import('@/lib/prisma')
      prisma = prismaClient
      console.log('✅ Prisma imported successfully')
    } catch (error) {
      console.error('❌ Failed to import Prisma:', error)
      return NextResponse.json({ 
        error: 'خطأ في الاتصال بقاعدة البيانات' 
      }, { status: 500 })
    }

    // Test database connection
    try {
      await prisma.$connect()
      console.log('✅ Database connected')
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      return NextResponse.json({ 
        error: 'فشل الاتصال بقاعدة البيانات' 
      }, { status: 500 })
    }

    // Check if user exists
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json({ 
          error: 'البريد الإلكتروني مستخدم بالفعل' 
        }, { status: 400 })
      }
      console.log('✅ Email is available')
    } catch (error) {
      console.error('❌ Error checking existing user:', error)
      return NextResponse.json({ 
        error: 'خطأ في التحقق من البريد الإلكتروني' 
      }, { status: 500 })
    }

    // Hash password
    let hashedPassword: string
    try {
      hashedPassword = await bcrypt.hash(password, 12)
      console.log('✅ Password hashed')
    } catch (error) {
      console.error('❌ Password hashing failed:', error)
      return NextResponse.json({ 
        error: 'خطأ في تشفير كلمة المرور' 
      }, { status: 500 })
    }

    // Create user
    try {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const user = await prisma.user.create({
        data: {
          id: userId,
          name,
          email,
          password: hashedPassword,
          phone: phone || null,
          city: city || null,
          nationality: nationality || null,
          preferredRole: preferredRole || null,
          role: 'participant',
          isActive: true
        }
      })

      console.log('✅ User created successfully:', user.email)

      return NextResponse.json({
        message: 'تم التسجيل بنجاح',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      })

    } catch (error) {
      console.error('❌ User creation failed:', error)
      return NextResponse.json({ 
        error: 'فشل في إنشاء المستخدم' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Registration error:', error)
    return NextResponse.json({ 
      error: 'خطأ في التسجيل' 
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
