import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
// ✅ Removed nodemailer import - now using template system only

// Lazy import prisma to avoid build-time errors
let prisma: any = null
async function getPrisma() {
  if (!prisma) {
    try {
      const { prisma: prismaClient } = await import('@/lib/prisma')
      prisma = prismaClient
    } catch (error) {
      console.error('Failed to import prisma:', error)
      return null
    }
  }
  return prisma
}

// POST /api/auth/register - Register new user
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Registration API called')
    const body = await request.json()
    console.log('📝 Registration data received:', {
      name: body.name,
      email: body.email,
      hasPassword: !!body.password
    })

    const {
      name,
      email,
      password,
      phone,
      city,
      nationality,
      skills,
      experience,
      preferredRole
    } = body

    // Validate required fields
    if (!name || !email || !password) {
      console.log('❌ Missing required fields')
      return NextResponse.json({ error: 'الاسم والإيميل وكلمة المرور مطلوبة' }, { status: 400 })
    }

    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'تعذر تهيئة قاعدة البيانات' }, { status: 500 })
    }

    // Check if user already exists
    console.log('🔍 Checking if email exists:', email)
    const existingUser = await prismaClient.user.findUnique({
      where: { email }
    })

    console.log('📊 Existing user result:', existingUser ? 'Found' : 'Not found')

    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email)
      return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 })
    }

    // Hash password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    console.log('👤 Creating new user...')
    const user = await prismaClient.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        city: city || null,
        nationality: nationality || null,
        skills: skills || null,
        experience: experience || null,
        preferredRole: preferredRole || null,
        role: 'participant' as any
      }
    })

    console.log('✅ New user created successfully:', user.email, 'ID:', user.id)

    // Create JWT token for automatic login
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    // Send welcome email using template system
    try {
      console.log('📧 Attempting to send welcome email to:', user.email)
      const { sendTemplatedEmail } = await import('@/lib/mailer')

      await sendTemplatedEmail(
        'welcome',
        user.email,
        {
          participantName: user.name,
          participantEmail: user.email,
          registrationDate: new Date().toLocaleDateString('ar-SA'),
          organizerName: 'فريق المنصة',
          organizerEmail: process.env.MAIL_FROM || 'no-reply@hackathon.com'
        }
      )
      console.log('✅ Welcome email sent successfully to:', user.email)
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError)
      console.error('❌ Email error details:', emailError instanceof Error ? emailError.message : String(emailError))
      // Don't fail registration if email fails
    }

    // Create response with automatic login
    const response = NextResponse.json({
      message: 'تم التسجيل بنجاح وتم تسجيل الدخول تلقائياً',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      autoLogin: true
    })

    // Set HTTP-only cookie for authentication
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    })

    console.log('✅ Cookie set successfully for user:', user.email)

    return response

  } catch (error) {
    console.error('❌ Error in registration:', error)
    console.error('❌ Error details:', error instanceof Error ? error.message : String(error))
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ error: 'خطأ في التسجيل' }, { status: 500 })
  }
}

// ✅ Removed unused sendWelcomeEmail function - now using template system only

export const dynamic = 'force-dynamic'
