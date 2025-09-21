import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Simple login API called')
    
    const body = await request.json()
    const { email, password } = body

    console.log('📝 Login attempt for:', email)

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'البريد الإلكتروني وكلمة المرور مطلوبان' 
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

    // Find user
    let user: any = null
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })
      console.log('🔍 User found:', user ? 'Yes' : 'No')
    } catch (error) {
      console.error('❌ Error finding user:', error)
      return NextResponse.json({ 
        error: 'خطأ في البحث عن المستخدم' 
      }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'بيانات الدخول غير صحيحة' 
      }, { status: 401 })
    }

    // Check password
    try {
      const isValidPassword = await bcrypt.compare(password, user.password)
      console.log('🔐 Password valid:', isValidPassword)
      
      if (!isValidPassword) {
        return NextResponse.json({ 
          error: 'بيانات الدخول غير صحيحة' 
        }, { status: 401 })
      }
    } catch (error) {
      console.error('❌ Password comparison failed:', error)
      return NextResponse.json({ 
        error: 'خطأ في التحقق من كلمة المرور' 
      }, { status: 500 })
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ 
        error: 'تم تعطيل حسابك من قبل الإدارة' 
      }, { status: 403 })
    }

    // Create JWT token
    try {
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      )

      console.log('✅ Login successful for:', user.email, 'Role:', user.role)

      // Create response
      const response = NextResponse.json({
        message: 'تم تسجيل الدخول بنجاح',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      })

      // Set cookie
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      })

      return response

    } catch (error) {
      console.error('❌ Token creation failed:', error)
      return NextResponse.json({ 
        error: 'خطأ في إنشاء جلسة المستخدم' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json({ 
      error: 'خطأ في تسجيل الدخول' 
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
