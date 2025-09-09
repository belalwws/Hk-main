import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

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
        password_hash: hashedPassword,
        phone: phone || null,
        city: city || null,
        nationality: nationality || null,
        skills: skills || null,
        experience: experience || null,
        preferredRole: preferredRole || null,
        role: 'participant'
      }
    })

    console.log('✅ New user created successfully:', user.email, 'ID:', user.id)

    // Send welcome email
    try {
      console.log('📧 Attempting to send welcome email to:', user.email)
      await sendWelcomeEmail(user.email, user.name)
      console.log('✅ Welcome email sent successfully to:', user.email)
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError)
      console.error('❌ Email error details:', emailError instanceof Error ? emailError.message : String(emailError))
      // Don't fail registration if email fails
    }

    return NextResponse.json({ 
      message: 'تم التسجيل بنجاح',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error('❌ Error in registration:', error)
    console.error('❌ Error details:', error instanceof Error ? error.message : String(error))
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ error: 'خطأ في التسجيل' }, { status: 500 })
  }
}

// Send welcome email function
async function sendWelcomeEmail(email: string, name: string) {
  // Gmail credentials (hardcoded for now)
  const gmailUser = 'racein668@gmail.com'
  const gmailPass = 'gpbyxbbvrzfyluqt'

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass
    }
  })

  const emailSubject = 'مرحباً بك في منصة هاكاثون الابتكار التقني! 🎉'
  
  const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مرحباً بك في منصة الهاكاثونات</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 50%, #c3e956 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎉 مرحباً بك في منصة الهاكاثونات!</h1>
        </div>
        <div style="padding: 30px;">
            <p>مرحباً <strong>${name}</strong>,</p>
            
            <p>نرحب بك في <strong>منصة هاكاثون الابتكار التقني</strong>! 🚀</p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #3ab666; margin-top: 0;">✨ ما يمكنك فعله الآن:</h3>
                <ul style="margin: 0; padding-right: 20px;">
                    <li>🔍 استكشاف الهاكاثونات المتاحة</li>
                    <li>📝 التسجيل في الهاكاثونات التي تهمك</li>
                    <li>👥 التواصل مع المطورين والمبدعين</li>
                    <li>🏆 المشاركة في المسابقات والفوز بالجوائز</li>
                    <li>📚 تطوير مهاراتك التقنية</li>
                </ul>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #01645e; margin-top: 0;">🎯 نصائح للبداية:</h3>
                <p>1. <strong>أكمل ملفك الشخصي</strong> - أضف مهاراتك وخبراتك</p>
                <p>2. <strong>تصفح الهاكاثونات</strong> - ابحث عن المسابقات المناسبة لك</p>
                <p>3. <strong>انضم للمجتمع</strong> - تفاعل مع المطورين الآخرين</p>
                <p>4. <strong>ابدأ مشروعك</strong> - شارك في أول هاكاثون لك!</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}" 
                   style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">
                    🚀 ابدأ رحلتك الآن
                </a>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;"><strong>💡 نصيحة:</strong> تابع إيميلاتك للحصول على آخر الأخبار والهاكاثونات الجديدة!</p>
            </div>

            <p>إذا كان لديك أي أسئلة، لا تتردد في التواصل معنا.</p>
            
            <p>مع أطيب التحيات،<br>
            <strong>فريق منصة هاكاثون الابتكار التقني</strong></p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #666; font-size: 14px;">© 2024 منصة هاكاثون الابتكار التقني. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>
  `

  const emailText = `مرحباً ${name},

نرحب بك في منصة هاكاثون الابتكار التقني! 🚀

ما يمكنك فعله الآن:
- استكشاف الهاكاثونات المتاحة
- التسجيل في الهاكاثونات التي تهمك
- التواصل مع المطورين والمبدعين
- المشاركة في المسابقات والفوز بالجوائز

ابدأ رحلتك: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}

مع أطيب التحيات،
فريق منصة هاكاثون الابتكار التقني`

  await transporter.sendMail({
    from: `منصة هاكاثون الابتكار التقني <${gmailUser}>`,
    to: email,
    subject: emailSubject,
    text: emailText,
    html: emailHtml
  })
}

export const dynamic = 'force-dynamic'
