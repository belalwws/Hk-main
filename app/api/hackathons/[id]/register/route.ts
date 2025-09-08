import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'racein668@gmail.com',
    pass: process.env.GMAIL_PASS || 'gpbyxbbvrzfyluqt'
  }
})



// POST /api/hackathons/[id]/register - Register for a hackathon
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'جلسة غير صالحة' }, { status: 401 })
    }

    const hackathonId = params.id

    // Get hackathon details
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        _count: {
          select: {
            participants: true
          }
        }
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Check if hackathon is open for registration
    if (hackathon.status !== 'open') {
      return NextResponse.json({
        error: 'التسجيل غير متاح لهذا الهاكاثون حالياً'
      }, { status: 400 })
    }

    // Check registration deadline
    const now = new Date()
    const deadline = new Date(hackathon.registrationDeadline)

    if (now > deadline) {
      return NextResponse.json({
        error: 'انتهى موعد التسجيل لهذا الهاكاثون'
      }, { status: 400 })
    }

    // Check participant limit
    if (hackathon.maxParticipants && hackathon._count.participants >= hackathon.maxParticipants) {
      return NextResponse.json({
        error: 'تم الوصول للحد الأقصى من المشاركين'
      }, { status: 400 })
    }

    const body = await request.json()
    const { teamName, projectTitle, projectDescription, githubRepo, teamRole } = body

    // Validate required fields
    if (!teamRole) {
      return NextResponse.json({
        error: 'يجب اختيار دور في الفريق'
      }, { status: 400 })
    }

    try {
      // Check if user already registered for this hackathon
      const existingParticipation = await prisma.participant.findUnique({
        where: {
          userId_hackathonId: {
            userId: payload.userId,
            hackathonId: hackathonId
          }
        }
      })

      if (existingParticipation) {
        return NextResponse.json({
          error: 'أنت مسجل بالفعل في هذا الهاكاثون'
        }, { status: 400 })
      }

      // First, ensure user exists in the database
      let user = await prisma.user.findUnique({
        where: { id: payload.userId }
      })

      if (!user) {
        // Create user if doesn't exist
        user = await prisma.user.create({
          data: {
            id: payload.userId,
            email: payload.email,
            name: payload.name,
            role: 'PARTICIPANT', // Use correct enum value
            password_hash: 'temp_hash_' + Date.now() // Temporary hash for OAuth users
          }
        })
      }

      // Register user for hackathon
      const participation = await prisma.participant.create({
        data: {
          userId: payload.userId,
          hackathonId: hackathonId,
          teamName: teamName || null,
          projectTitle: projectTitle || null,
          projectDescription: projectDescription || null,
          githubRepo: githubRepo || null,
          teamRole: teamRole,
          status: 'pending',
          registeredAt: new Date()
        }
      })

      // Send confirmation email
      console.log(`📧 Sending registration confirmation email to ${payload.email}`)

      try {
        await transporter.sendMail({
          from: process.env.MAIL_FROM || 'هاكاثون الابتكار التقني <racein668@gmail.com>',
          to: payload.email,
          subject: `✅ تم تسجيلك في ${hackathon.title}!`,
          html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تأكيد التسجيل</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 50%, #c3e956 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎉 تم التسجيل بنجاح!</h1>
            <p style="margin: 10px 0 0 0;">${hackathon.title}</p>
        </div>
        <div style="padding: 30px;">
            <p>مرحباً <strong>${payload.name}</strong>,</p>
            <p>تم تسجيلك بنجاح في <strong>${hackathon.title}</strong>!</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #01645e; margin-top: 0;">تفاصيل التسجيل:</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin: 10px 0;"><strong>الدور المفضل:</strong> ${teamRole}</li>
                    <li style="margin: 10px 0;"><strong>اسم الفريق:</strong> ${teamName || 'غير محدد'}</li>
                    <li style="margin: 10px 0;"><strong>عنوان المشروع:</strong> ${projectTitle || 'غير محدد'}</li>
                    <li style="margin: 10px 0;"><strong>حالة التسجيل:</strong> <span style="color: #8b7632;">في انتظار المراجعة</span></li>
                </ul>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #3ab666; margin-top: 0;">تواريخ مهمة:</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin: 10px 0;"><strong>بداية الهاكاثون:</strong> ${new Date(hackathon.startDate).toLocaleDateString('ar-SA')}</li>
                    <li style="margin: 10px 0;"><strong>نهاية الهاكاثون:</strong> ${new Date(hackathon.endDate).toLocaleDateString('ar-SA')}</li>
                </ul>
            </div>
            
            <p>سيتم مراجعة طلبك وإرسال إشعار بالقبول أو الرفض قريباً.</p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0;">© 2024 هاكاثون الابتكار التقني. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>
          `
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the registration if email fails
      }

      return NextResponse.json({
        message: 'تم التسجيل بنجاح! سيتم مراجعة طلبك قريباً.',
        participation: {
          id: participation.id,
          hackathonId: participation.hackathonId,
          teamName: participation.teamName,
          projectTitle: participation.projectTitle,
          status: participation.status,
          registeredAt: participation.registeredAt
        }
      })

    } catch (registrationError) {
      console.error('Registration error:', registrationError)
      return NextResponse.json({
        error: 'حدث خطأ في التسجيل. يرجى المحاولة مرة أخرى.'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error registering for hackathon:', error)

    // Check for specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({
          error: 'أنت مسجل بالفعل في هذا الهاكاثون'
        }, { status: 400 })
      }

      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json({
          error: 'خطأ في البيانات. تأكد من صحة معرف الهاكاثون.'
        }, { status: 400 })
      }

      console.error('Detailed error:', error.message)
    }

    return NextResponse.json({
      error: 'خطأ في التسجيل للهاكاثون. يرجى المحاولة مرة أخرى.'
    }, { status: 500 })
  }
}
