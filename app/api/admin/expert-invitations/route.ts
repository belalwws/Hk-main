import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// Email template for expert invitation
function getExpertInvitationEmailContent(
  expertName: string, 
  registrationLink: string, 
  customMessage: string
) {
  // Replace placeholders in custom message
  let messageContent = customMessage
    .replace(/\[الاسم الكامل\]/g, expertName)
    .replace(/\[رابط التسجيل\]/g, registrationLink)
  
  // Convert line breaks to HTML
  messageContent = messageContent.replace(/\n/g, '<br>')
  
  return {
    subject: `دعوة للمشاركة كخبير في الهاكاثون`,
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 650px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
    .content { padding: 30px; }
    .message { font-size: 16px; line-height: 1.8; color: #333; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 13px; border-radius: 0 0 12px 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">✨ دعوة للمشاركة كخبير</h1>
    </div>
    <div class="content">
      <div class="message">${messageContent}</div>
    </div>
    <div class="footer">
      <p>© 2025 نظام إدارة الهاكاثونات</p>
    </div>
  </div>
</body>
</html>
    `,
    text: customMessage.replace(/\[الاسم الكامل\]/g, expertName).replace(/\[رابط التسجيل\]/g, registrationLink)
  }
}

// GET /api/admin/expert-invitations - Get all expert invitations
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const invitations = await prisma.expertInvitation.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ invitations })

  } catch (error) {
    console.error('❌ Error fetching invitations:', error)
    return NextResponse.json({ error: 'خطأ في جلب الدعوات' }, { status: 500 })
  }
}

// POST /api/admin/expert-invitations - Create new expert invitation
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Parse FormData instead of JSON
    const formData = await request.formData()
    const email = formData.get('email') as string
    const name = formData.get('name') as string
    const hackathonId = formData.get('hackathonId') as string
    const expiresInDays = parseInt(formData.get('expiresInDays') as string || '7')
    const registrationLink = formData.get('registrationLink') as string
    const emailMessage = formData.get('emailMessage') as string
    const attachmentFile = formData.get('attachment') as File | null

    console.log('📧 Creating expert invitation:', { email, name, hackathonId, hasAttachment: !!attachmentFile })

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

    // ⚠️ تحذير فقط، لا نمنع الإرسال
    if (existingUser) {
      console.log('⚠️ Warning: Email already exists in system:', email)
      console.log('⚠️ User role:', existingUser.role)
      // نكمل العملية - يمكن إرسال دعوة حتى لو البريد موجود
    }

    // Check if there's already a pending invitation for this email and hackathon
    const existingInvitation = await prisma.expertInvitation.findFirst({
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
    const invitation = await prisma.expertInvitation.create({
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
    const invitationLink = `${baseUrl}/expert/register?token=${invitationToken}`

    console.log('✅ Expert invitation created successfully')
    console.log('🔗 Invitation link:', invitationLink)

    // Send invitation email with PDF attachment
    console.log('📧 Attempting to send email...')
    console.log('📧 Email config:', {
      service: 'gmail',
      user: process.env.GMAIL_USER || process.env.EMAIL_USER,
      hasPassword: !!(process.env.GMAIL_PASS || process.env.EMAIL_PASS)
    })
    
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER || process.env.EMAIL_USER,
          pass: process.env.GMAIL_PASS || process.env.EMAIL_PASS
        }
      })

      console.log('📧 Transporter created successfully')

      const emailContent = getExpertInvitationEmailContent(
        name,
        registrationLink,
        emailMessage
      )

      console.log('📧 Email content generated:', {
        subject: emailContent.subject,
        to: email,
        from: hackathon.title,
        messageLength: emailContent.html.length
      })

      // Prepare email options with hackathon name as sender
      const mailOptions: any = {
        from: `"${hackathon.title}" <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      }

      // Add PDF as attachment if provided
      if (attachmentFile) {
        const buffer = Buffer.from(await attachmentFile.arrayBuffer())
        mailOptions.attachments = [{
          filename: attachmentFile.name || 'invitation.pdf',
          content: buffer,
          contentType: 'application/pdf'
        }]
        console.log('📎 Adding PDF attachment:', attachmentFile.name, 'Size:', buffer.length, 'bytes')
      }

      console.log('📧 Sending email...')
      console.log('📧 Final mail options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        hasHtml: !!mailOptions.html,
        hasText: !!mailOptions.text,
        hasAttachments: !!mailOptions.attachments
      })
      
      const info = await transporter.sendMail(mailOptions)
      
      console.log('✅ ========================================')
      console.log('✅ EMAIL SENT SUCCESSFULLY!')
      console.log('✅ ========================================')
      console.log('✅ To:', email)
      console.log('✅ MessageId:', info.messageId)
      console.log('✅ Response:', info.response)
      console.log('✅ Accepted:', info.accepted)
      console.log('✅ Rejected:', info.rejected)
      console.log('✅ Envelope:', info.envelope)
      console.log('✅ ========================================')
      
      // ⚠️ IMPORTANT: Check if email was actually accepted
      if (info.rejected && info.rejected.length > 0) {
        console.warn('⚠️ WARNING: Some emails were REJECTED by the server!')
        console.warn('⚠️ Rejected addresses:', info.rejected)
      }
      
      if (info.accepted && info.accepted.length > 0) {
        console.log('✅ Email accepted by server for:', info.accepted)
      } else {
        console.warn('⚠️ WARNING: No emails were accepted!')
      }

    } catch (emailError) {
      console.error('❌ ========================================')
      console.error('❌ EMAIL SENDING FAILED!')
      console.error('❌ ========================================')
      console.error('❌ Error sending invitation email:', emailError)
      console.error('❌ Error details:', {
        name: emailError instanceof Error ? emailError.name : 'Unknown',
        message: emailError instanceof Error ? emailError.message : 'Unknown error',
        code: (emailError as any)?.code,
        responseCode: (emailError as any)?.responseCode,
        response: (emailError as any)?.response,
        stack: emailError instanceof Error ? emailError.stack : 'No stack trace'
      })
      console.error('❌ ========================================')
      // Don't fail the request if email fails - invitation is still created
      // But we should log it clearly for debugging
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
