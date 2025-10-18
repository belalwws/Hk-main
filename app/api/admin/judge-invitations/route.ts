import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// Email template for judge invitation
function getJudgeInvitationEmailContent(
  judgeName: string, 
  registrationLink: string, 
  customMessage: string,
  attachmentUrl?: string
) {
  // Replace placeholders in custom message
  let messageContent = customMessage
    .replace(/\[الاسم الكامل\]/g, judgeName)
    .replace(/\[رابط التسجيل\]/g, registrationLink)
  
  // Convert line breaks to HTML
  messageContent = messageContent.replace(/\n/g, '<br>')
  
  return {
    subject: `دعوة للمشاركة كعضو لجنة تحكيم`,
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; }
    .container { max-width: 650px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .message { font-size: 16px; line-height: 1.8; color: #4a5568; white-space: pre-wrap; }
    .register-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 25px 0; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    .attachment-box { background: #f7fafc; border: 2px solid #667eea; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center; }
    .footer { background: #f7fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ دعوة للمشاركة</h1>
    </div>
    
    <div class="content">
      <div class="message">${messageContent}</div>
      
      ${attachmentUrl ? `
      <div class="attachment-box">
        <h3 style="color: #667eea; margin: 0 0 15px;">📎 مرفق إضافي</h3>
        <a href="${attachmentUrl}" style="color: #667eea; text-decoration: underline;">تحميل المرفق (PDF)</a>
      </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <p style="color: #a0aec0;">© 2025 نظام إدارة الهاكاثونات. جميع الحقوق محفوظة.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: customMessage.replace(/\[الاسم الكامل\]/g, judgeName).replace(/\[رابط التسجيل\]/g, registrationLink)
  }
}

// GET /api/admin/judge-invitations - Get all judge invitations
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const invitations = await prisma.judgeInvitation.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ invitations })

  } catch (error) {
    console.error('❌ Error fetching invitations:', error)
    return NextResponse.json({ error: 'خطأ في جلب الدعوات' }, { status: 500 })
  }
}

// POST /api/admin/judge-invitations - Create new judge invitation
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { email, name, hackathonId, expiresInDays = 7, registrationLink, attachmentUrl, emailMessage } = body

    console.log('📧 Creating judge invitation:', { email, name, hackathonId })

    // Validate required fields
    if (!email || !hackathonId || !name || !registrationLink || !emailMessage) {
      return NextResponse.json({
        error: 'البريد الإلكتروني، الاسم، الهاكاثون، رابط التسجيل، ونص الرسالة مطلوبة'
      }, { status: 400 })
    }

    // Check if email already exists as a user
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({
        error: 'هذا البريد الإلكتروني مسجل بالفعل في النظام'
      }, { status: 400 })
    }

    // Check if there's already a pending invitation for this email and hackathon
    const existingInvitation = await prisma.judgeInvitation.findFirst({
      where: {
        email,
        hackathonId,
        status: 'pending'
      }
    })

    if (existingInvitation) {
      return NextResponse.json({
        error: 'يوجد دعوة معلقة بالفعل لهذا البريد الإلكتروني'
      }, { status: 400 })
    }

    // Generate unique token
    const invitationToken = crypto.randomBytes(32).toString('hex')

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // Get hackathon details for email
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { title: true }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Create invitation
    const invitation = await prisma.judgeInvitation.create({
      data: {
        email,
        name: name || null,
        hackathonId,
        token: invitationToken,
        invitedBy: payload.userId,
        expiresAt
      }
    })

    // Generate invitation link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const invitationLink = `${baseUrl}/judge/register?token=${invitationToken}`

    console.log('✅ Judge invitation created successfully')
    console.log('🔗 Invitation link:', invitationLink)

    // Send invitation email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER || process.env.EMAIL_USER,
          pass: process.env.GMAIL_PASS || process.env.EMAIL_PASS
        }
      })

      const emailContent = getJudgeInvitationEmailContent(
        name,
        registrationLink,
        emailMessage,
        attachmentUrl
      )

      await transporter.sendMail({
        from: `"نظام إدارة الهاكاثونات" <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      })

      console.log('✅ Invitation email sent successfully to:', email)
    } catch (emailError) {
      console.error('❌ Error sending invitation email:', emailError)
      // Don't fail the request if email fails - invitation is still created
    }

    return NextResponse.json({
      message: 'تم إنشاء الدعوة بنجاح',
      invitation,
      invitationLink
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error creating invitation:', error)
    return NextResponse.json({
      error: 'خطأ في إنشاء الدعوة',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

