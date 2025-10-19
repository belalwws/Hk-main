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
  customMessage: string
) {
  // Replace placeholders in custom message
  let messageContent = customMessage
    .replace(/\[الاسم الكامل\]/g, judgeName)
    .replace(/\[رابط التسجيل\]/g, registrationLink)
  
  // Convert line breaks to HTML
  messageContent = messageContent.replace(/\n/g, '<br>')
  
  return {
    subject: `🏆 دعوة خاصة للانضمام كعضو لجنة تحكيم`,
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      line-height: 1.6;
    }
    .email-wrapper {
      max-width: 650px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header {
      background: linear-gradient(135deg, #01645e 0%, #3ab666 50%, #c3e956 100%);
      padding: 50px 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 15s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.2); opacity: 0.8; }
    }
    .header-content {
      position: relative;
      z-index: 1;
    }
    .trophy-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      backdrop-filter: blur(10px);
      border: 3px solid rgba(255,255,255,0.3);
    }
    h1 {
      color: #ffffff;
      font-size: 32px;
      font-weight: 700;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .subtitle {
      color: rgba(255,255,255,0.95);
      font-size: 16px;
      margin-top: 10px;
    }
    .content {
      padding: 50px 40px;
      background: #ffffff;
    }
    .greeting {
      font-size: 24px;
      color: #01645e;
      font-weight: 600;
      margin-bottom: 25px;
      text-align: center;
    }
    .message-box {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-right: 5px solid #01645e;
      padding: 25px;
      border-radius: 12px;
      margin: 30px 0;
      font-size: 16px;
      color: #333;
      line-height: 1.8;
    }
    .cta-section {
      text-align: center;
      margin: 40px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #01645e 0%, #3ab666 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 18px 50px;
      border-radius: 50px;
      font-size: 18px;
      font-weight: 600;
      box-shadow: 0 10px 30px rgba(1,100,94,0.3);
      transition: all 0.3s ease;
      border: 3px solid transparent;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(1,100,94,0.4);
    }
    .features {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 40px 0;
    }
    .feature-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      padding: 20px;
      border-radius: 15px;
      text-align: center;
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;
    }
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      border-color: #3ab666;
    }
    .feature-icon {
      font-size: 35px;
      margin-bottom: 10px;
    }
    .feature-title {
      font-size: 16px;
      font-weight: 600;
      color: #01645e;
      margin-bottom: 5px;
    }
    .feature-desc {
      font-size: 13px;
      color: #666;
    }
    .divider {
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, #3ab666 50%, transparent 100%);
      margin: 40px 0;
    }
    .footer {
      background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
      padding: 35px 40px;
      text-align: center;
    }
    .footer-text {
      color: rgba(255,255,255,0.8);
      font-size: 14px;
      margin-bottom: 15px;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-icon {
      display: inline-block;
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      margin: 0 8px;
      line-height: 40px;
      text-decoration: none;
      font-size: 18px;
      transition: all 0.3s ease;
    }
    .social-icon:hover {
      background: #3ab666;
      transform: translateY(-3px);
    }
    .copyright {
      color: rgba(255,255,255,0.5);
      font-size: 12px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    @media only screen and (max-width: 600px) {
      .header { padding: 35px 20px; }
      h1 { font-size: 24px; }
      .content { padding: 30px 20px; }
      .features { grid-template-columns: 1fr; }
      .cta-button { padding: 15px 35px; font-size: 16px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div class="trophy-icon">🏆</div>
        <h1>دعوة خاصة للانضمام</h1>
        <p class="subtitle">لجنة تحكيم الهاكاثون</p>
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">مرحباً ${judgeName} 👋</p>
      
      <div class="message-box">
        ${messageContent}
      </div>

      <div class="divider"></div>

      <!-- Features Grid -->
      <div class="features">
        <div class="feature-card">
          <div class="feature-icon">⭐</div>
          <div class="feature-title">تجربة فريدة</div>
          <div class="feature-desc">شارك في تقييم أفضل المشاريع التقنية</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🤝</div>
          <div class="feature-title">بناء علاقات</div>
          <div class="feature-desc">تواصل مع خبراء ومبتكرين</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📈</div>
          <div class="feature-title">تطوير مهني</div>
          <div class="feature-desc">عزز خبرتك في التحكيم</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎓</div>
          <div class="feature-title">شهادة تقدير</div>
          <div class="feature-desc">احصل على شهادة معتمدة</div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- CTA Section -->
      <div class="cta-section">
        <a href="${registrationLink}" class="cta-button">
          🚀 ابدأ رحلة التحكيم الآن
        </a>
        <p style="color: #666; font-size: 13px; margin-top: 20px;">
          انقر على الزر أعلاه لإتمام عملية التسجيل
        </p>
      </div>

      <div style="background: #fff8e1; border-right: 4px solid #ffc107; padding: 20px; border-radius: 10px; margin-top: 30px;">
        <p style="color: #856404; font-size: 14px; margin: 0;">
          <strong>💡 ملاحظة هامة:</strong> رابط التسجيل صالح لفترة محدودة. ننصحك بالتسجيل في أقرب وقت ممكن.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">
        شكراً لثقتك في منصتنا 💚
      </p>
      <p class="footer-text">
        نتطلع لمساهماتك القيمة في نجاح الهاكاثون
      </p>
      
      <div class="social-links">
        <a href="#" class="social-icon">📧</a>
        <a href="#" class="social-icon">🌐</a>
        <a href="#" class="social-icon">💬</a>
      </div>

      <div class="copyright">
        <p>© 2025 نظام إدارة الهاكاثونات المتطور</p>
        <p style="margin-top: 8px; font-size: 11px;">
          تم إنشاء هذه الرسالة آلياً، يرجى عدم الرد عليها
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
    text: `
دعوة خاصة للانضمام كعضو لجنة تحكيم

مرحباً ${judgeName}،

${customMessage.replace(/\[الاسم الكامل\]/g, judgeName).replace(/\[رابط التسجيل\]/g, registrationLink)}

لإتمام التسجيل، يرجى زيارة الرابط التالي:
${registrationLink}

نتطلع لمشاركتك معنا!

---
© 2025 نظام إدارة الهاكاثونات
    `
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

    // Parse FormData instead of JSON
    const formData = await request.formData()
    const email = formData.get('email') as string
    const name = formData.get('name') as string
    const hackathonId = formData.get('hackathonId') as string
    const expiresInDays = parseInt(formData.get('expiresInDays') as string || '7')
    const registrationLink = formData.get('registrationLink') as string
    const emailMessage = formData.get('emailMessage') as string
    const attachmentFile = formData.get('attachment') as File | null

    console.log('📧 Creating judge invitation:', { email, name, hackathonId, hasAttachment: !!attachmentFile })

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

    // Send invitation email with PDF attachment
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
        emailMessage
      )

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
        console.log('📎 Adding PDF attachment:', attachmentFile.name)
      }

      await transporter.sendMail(mailOptions)

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

