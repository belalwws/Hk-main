import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

// CORS headers for external API access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false',
}

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
})

// Email template for registration confirmation
function getRegistrationConfirmationEmail(participantName: string, hackathonTitle: string) {
  return `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #333; direction: rtl; max-width: 600px; margin: 0 auto; background: white;">

  <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎉 تم تأكيد التسجيل</h1>
  </div>

  <div style="padding: 30px;">
    <p style="font-size: 16px; margin-bottom: 20px;">عزيزي/عزيزتي <strong>${participantName}</strong>،</p>

    <p style="font-size: 16px; margin-bottom: 20px;">السلام عليكم ورحمة الله وبركاته،</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      🎊 مرحباً بك في <strong>${hackathonTitle}</strong>!
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      تم تأكيد تسجيلك بنجاح في الهاكاثون. نحن متحمسون لمشاركتك معنا في هذه الرحلة المليئة بالإبداع والابتكار.
    </p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #01645e; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #01645e;">
        ✅ <strong>حالة التسجيل:</strong> مؤكد
      </p>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
        سيتم التواصل معك قريباً بتفاصيل أكثر حول الهاكاثون
      </p>
    </div>

    <p style="font-size: 16px; margin-bottom: 20px;">
      استعد لتجربة مميزة مليئة بالتعلم، التطوير، والتواصل مع المبدعين من جميع أنحاء المملكة.
    </p>

    <p style="font-size: 16px; margin-top: 30px;">مع خالص التقدير،</p>
    <p style="font-size: 16px; font-weight: bold; color: #01645e;">فريق ${hackathonTitle}</p>
  </div>
</div>`
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

// POST /api/external/register - Register participant via external API
export async function POST(request: NextRequest) {
  try {
    // Verify API Key
    const apiKey = request.headers.get('X-API-Key')
    const validApiKey = process.env.EXTERNAL_API_KEY || 'hackathon-api-key-2025'

    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid API Key' },
        { status: 401, headers: corsHeaders }
      )
    }

    const body = await request.json()
    const {
      hackathonId,
      ...formData
    } = body

    console.log('📝 External registration request:', { hackathonId, formData })

    // Validate required fields
    if (!hackathonId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: hackathonId'
        },
        { status: 400, headers: corsHeaders }
      )
    }

    // Extract standard fields
    const name = formData.name || formData.fullName || formData.الاسم
    const email = formData.email || formData.البريد_الإلكتروني
    const phone = formData.phone || formData.رقم_الهاتف || formData.الجوال
    const university = formData.university || formData.organization || formData.المؤسسة || formData.الجامعة
    const preferredRole = formData.preferredRole || formData.الدور_المفضل

    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name and email are required'
        },
        { status: 400, headers: corsHeaders }
      )
    }

    // Verify hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json(
        { success: false, error: 'Hackathon not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    })

    // If user doesn't exist, create one
    if (!user) {
      const hashedPassword = await bcrypt.hash('external-user-' + Date.now(), 10)

      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'participant',
          phone: phone || null,
          university: university || null,
          preferredRole: preferredRole || null
        }
      })

      console.log('✅ New user created:', user.email)
    } else {
      console.log('👤 Existing user found:', user.email)
    }

    // Check if already registered for this hackathon
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        userId: user.id,
        hackathonId: hackathonId
      }
    })

    if (existingParticipant) {
      return NextResponse.json(
        {
          success: false,
          error: 'User already registered for this hackathon',
          participant: {
            id: existingParticipant.id,
            status: existingParticipant.status
          }
        },
        { status: 409, headers: corsHeaders }
      )
    }

    // Prepare custom fields (exclude standard fields)
    const standardFields = ['name', 'fullName', 'الاسم', 'email', 'البريد_الإلكتروني', 'phone', 'رقم_الهاتف', 'الجوال', 'university', 'organization', 'المؤسسة', 'الجامعة', 'preferredRole', 'الدور_المفضل', 'hackathonId']
    const customFields: any = {}

    Object.keys(formData).forEach(key => {
      if (!standardFields.includes(key)) {
        customFields[key] = formData[key]
      }
    })

    // Create participant
    const participant = await prisma.participant.create({
      data: {
        userId: user.id,
        hackathonId: hackathonId,
        status: 'pending',
        registeredAt: new Date(),
        additionalInfo: Object.keys(customFields).length > 0 ? customFields : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            university: true,
            preferredRole: true
          }
        }
      }
    })

    console.log('✅ Participant registered successfully:', participant.id)

    // Send confirmation email
    try {
      const hackathon = await prisma.hackathon.findUnique({
        where: { id: hackathonId },
        select: { title: true }
      })

      if (hackathon && participant.user.email) {
        const emailHtml = getRegistrationConfirmationEmail(participant.user.name, hackathon.title)

        await transporter.sendMail({
          from: `"${hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,
          to: participant.user.email,
          subject: `تأكيد التسجيل – ${hackathon.title}`,
          html: emailHtml
        })

        console.log('📧 Confirmation email sent to:', participant.user.email)
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send confirmation email:', emailError)
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      participant: {
        id: participant.id,
        name: participant.user.name,
        email: participant.user.email,
        phone: participant.user.phone,
        university: participant.user.university,
        preferredRole: participant.user.preferredRole,
        status: participant.status,
        registeredAt: participant.registeredAt,
        additionalInfo: participant.additionalInfo
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('❌ External registration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    )
  }
}

export const dynamic = 'force-dynamic'

