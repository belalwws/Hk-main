import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// CORS headers for external API access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
}

// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'racein668@gmail.com',
    pass: process.env.GMAIL_PASS || 'gpbyxbbvrzfyluqt'
  }
})

// POST /api/external/hackathons/[id]/register - Register for hackathon
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId } = params

    // Get API key from headers
    const apiKey = request.headers.get('X-API-Key')
    if (!apiKey || apiKey !== process.env.EXTERNAL_API_KEY) {
      return NextResponse.json(
        { error: 'Invalid API key' }, 
        { status: 401, headers: corsHeaders }
      )
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      university,
      major,
      graduationYear,
      preferredRole,
      experience,
      skills,
      portfolioUrl,
      linkedinUrl,
      githubUrl,
      motivation,
      source // من أين سمع عن الهاكاثون
    } = body

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Check if hackathon exists and is active
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    })

    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' }, 
        { status: 404, headers: corsHeaders }
      )
    }

    if (hackathon.status !== 'active') {
      return NextResponse.json(
        { error: 'Hackathon is not currently accepting registrations' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Check registration deadline
    const now = new Date()
    const deadline = new Date(hackathon.registrationDeadline || hackathon.startDate)
    if (now > deadline) {
      return NextResponse.json(
        { error: 'Registration deadline has passed' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Check if hackathon is full
    if (hackathon.maxParticipants && hackathon._count.participants >= hackathon.maxParticipants) {
      return NextResponse.json(
        { error: 'Hackathon is full' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    })

    // If user doesn't exist, create new user
    if (!user) {
      const hashedPassword = await bcryptjs.hash('temp123456', 10) // Temporary password
      
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          university,
          major,
          graduationYear: graduationYear ? parseInt(graduationYear) : null,
          preferredRole,
          experience,
          skills: skills ? skills.join(', ') : null,
          portfolioUrl,
          linkedinUrl,
          githubUrl,
          role: 'participant',
          isActive: true,
          emailVerified: false
        }
      })
    }

    // Check if user is already registered for this hackathon
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        userId: user.id,
        hackathonId: hackathonId
      }
    })

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'User is already registered for this hackathon' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Register user for hackathon
    const participant = await prisma.participant.create({
      data: {
        userId: user.id,
        hackathonId: hackathonId,
        motivation,
        source: source || 'external_api',
        registrationDate: new Date()
      }
    })

    // Send confirmation email
    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || 'هاكاثون الابتكار التقني <racein668@gmail.com>',
        to: email,
        subject: `🎉 تأكيد التسجيل في ${hackathon.title}`,
        html: getRegistrationConfirmationEmail(name, hackathon.title, hackathon.startDate, hackathon.endDate)
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      data: {
        participantId: participant.id,
        hackathonTitle: hackathon.title,
        registrationDate: participant.registrationDate,
        hackathonStartDate: hackathon.startDate,
        hackathonEndDate: hackathon.endDate
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error registering for hackathon:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    )
  }
}

function getRegistrationConfirmationEmail(
  userName: string,
  hackathonTitle: string,
  startDate: string,
  endDate: string
): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تأكيد التسجيل</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 تم تأكيد التسجيل!</h1>
          <p style="color: #c3e956; margin: 10px 0 0 0; font-size: 18px;">مرحباً بك في الهاكاثون</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #01645e; margin: 0 0 20px 0; font-size: 24px;">مرحباً ${userName}! 👋</h2>
          
          <p style="color: #333; line-height: 1.8; font-size: 16px; margin-bottom: 25px;">
            تم تأكيد تسجيلك بنجاح في <strong style="color: #3ab666;">${hackathonTitle}</strong>
          </p>

          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-right: 4px solid #3ab666; padding: 25px; margin: 25px 0; border-radius: 10px;">
            <h3 style="color: #01645e; margin: 0 0 15px 0; font-size: 20px;">📅 تفاصيل الهاكاثون</h3>
            <p style="color: #666; margin: 5px 0; font-size: 16px;"><strong>تاريخ البداية:</strong> ${new Date(startDate).toLocaleDateString('ar-SA')}</p>
            <p style="color: #666; margin: 5px 0; font-size: 16px;"><strong>تاريخ النهاية:</strong> ${new Date(endDate).toLocaleDateString('ar-SA')}</p>
          </div>

          <h3 style="color: #01645e; margin: 30px 0 15px 0;">📋 الخطوات التالية:</h3>
          <ul style="color: #333; line-height: 1.8; padding-right: 20px;">
            <li style="margin-bottom: 10px;">ستصلك رسالة إلكترونية أخرى قبل بداية الهاكاثون بالتفاصيل</li>
            <li style="margin-bottom: 10px;">تأكد من تحضير أدواتك وأفكارك</li>
            <li style="margin-bottom: 10px;">ابدأ في تكوين فريقك أو انتظر التوزيع التلقائي</li>
            <li style="margin-bottom: 10px;">راجع قواعد ومعايير التقييم</li>
          </ul>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'https://hackathon-platform-601l.onrender.com'}/login" style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; transition: transform 0.3s;">
              🏠 دخول المنصة
            </a>
          </div>

          <div style="background: #e8f5e8; border: 1px solid #3ab666; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <p style="color: #01645e; margin: 0; font-weight: bold; text-align: center;">
              🚀 نتطلع لرؤية إبداعك في الهاكاثون!
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            هل تحتاج مساعدة؟ تواصل معنا على 
            <a href="mailto:support@hackathon.gov.sa" style="color: #3ab666;">support@hackathon.gov.sa</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
