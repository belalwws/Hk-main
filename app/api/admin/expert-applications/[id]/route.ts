import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// Email template for approved expert
function getExpertApprovalEmailContent(expertName: string, hackathonTitle: string, email: string, password: string) {
  return {
    subject: 'تم قبولك كخبير - ' + hackathonTitle,
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .header { background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.95; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 20px; font-weight: 600; color: #2d3748; margin-bottom: 20px; border-right: 4px solid #01645e; padding-right: 15px; }
    .message { font-size: 16px; line-height: 1.8; color: #4a5568; margin-bottom: 25px; }
    .credentials-box { background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border: 2px solid #01645e; border-radius: 12px; padding: 25px; margin: 25px 0; }
    .credentials-box h3 { margin: 0 0 15px; color: #01645e; font-size: 18px; }
    .credential-item { margin: 10px 0; padding: 12px; background: white; border-radius: 8px; display: flex; align-items: center; }
    .credential-label { font-weight: 600; color: #4a5568; margin-left: 10px; min-width: 120px; }
    .credential-value { color: #2d3748; font-family: 'Courier New', monospace; background: #f7fafc; padding: 5px 10px; border-radius: 4px; flex: 1; }
    .login-button { display: inline-block; background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 25px 0; box-shadow: 0 4px 15px rgba(1, 100, 94, 0.4); transition: transform 0.2s; }
    .login-button:hover { transform: translateY(-2px); }
    .instructions { background: #fffaf0; border-right: 4px solid #f6ad55; padding: 20px; border-radius: 8px; margin: 25px 0; }
    .instructions h4 { margin: 0 0 15px; color: #c05621; font-size: 16px; }
    .instructions ol { margin: 0; padding-right: 20px; color: #744210; line-height: 1.8; }
    .footer { background: #f7fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 مبروك! تم قبولك</h1>
      <p>كخبير في الهاكاثون</p>
    </div>
    
    <div class="content">
      <div class="greeting">سعادة / ${expertName}</div>
      <div class="greeting" style="font-size: 16px; border-right: none; padding-right: 0; margin-bottom: 30px;">
        الموضوع / دعوة للمشاركة كخبير
      </div>
      
      <p class="message">
        <strong>السلام عليكم ورحمة الله وبركاته،،</strong>
      </p>
      
      <p class="message">
        يسرنا إبلاغكم بأنه تم قبول طلبكم للمشاركة كخبير في <strong>${hackathonTitle}</strong>.
      </p>
      
      <p class="message">
        نثمن خبرتكم ومساهمتكم القيمة في تقديم الإرشاد والدعم الفني للفرق المشاركة، ونتطلع للعمل معكم لإنجاح هذا الحدث وتشجيع الإبداع والابتكار.
      </p>
      
      <div class="credentials-box">
        <h3>🔑 بيانات تسجيل الدخول</h3>
        <div class="credential-item">
          <span class="credential-label">البريد الإلكتروني:</span>
          <span class="credential-value">${email}</span>
        </div>
        <div class="credential-item">
          <span class="credential-label">كلمة المرور:</span>
          <span class="credential-value">${password}</span>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" class="login-button">
          🚀 الدخول إلى لوحة التحكم
        </a>
      </div>
      
      <div class="instructions">
        <h4>📋 الخطوات التالية:</h4>
        <ol>
          <li>قم بتسجيل الدخول باستخدام البيانات أعلاه</li>
          <li>يُنصح بتغيير كلمة المرور عند أول تسجيل دخول</li>
          <li>راجع الفرق المعينة لك لتقديم الدعم</li>
          <li>قدم الإرشاد والمشورة الفنية للفرق المشاركة</li>
          <li>في حال وجود أي استفسار، يمكنكم التواصل مع إدارة الهاكاثون</li>
        </ol>
      </div>
      
      <p class="message" style="margin-top: 30px;">
        نشكر لكم تعاونكم ونتمنى لكم تجربة مثمرة وممتعة.
      </p>
      
      <p class="message">
        <strong>مع أطيب التحيات،</strong><br>
        فريق إدارة الهاكاثون
      </p>
    </div>
    
    <div class="footer">
      <p><strong>ملاحظة مهمة:</strong> احتفظ بهذا البريد في مكان آمن للرجوع إليه عند الحاجة</p>
      <p style="margin-top: 15px; color: #a0aec0;">© 2025 نظام إدارة الهاكاثونات. جميع الحقوق محفوظة.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
سعادة / ${expertName}

الموضوع / دعوة للمشاركة كخبير

السلام عليكم ورحمة الله وبركاته،،

يسرنا إبلاغكم بأنه تم قبول طلبكم للمشاركة كخبير في ${hackathonTitle}.

بيانات تسجيل الدخول:
البريد الإلكتروني: ${email}
كلمة المرور: ${password}

رابط تسجيل الدخول: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login

الخطوات التالية:
1. قم بتسجيل الدخول باستخدام البيانات أعلاه
2. يُنصح بتغيير كلمة المرور عند أول تسجيل دخول
3. راجع الفرق المعينة لك لتقديم الدعم
4. قدم الإرشاد والمشورة الفنية للفرق المشاركة

نشكر لكم تعاونكم ونتمنى لكم تجربة مثمرة وممتعة.

مع أطيب التحيات،
فريق إدارة الهاكاثون
    `
  }
}

// PATCH /api/admin/expert-applications/[id] - Approve or reject application
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { action, reviewNotes, rejectionReason, password } = body

    console.log('🔄 Processing application:', { applicationId: params.id, action })

    // Get application
    const application = await prisma.expertApplication.findUnique({
      where: { id: params.id }
    })

    if (!application) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    if (application.status !== 'pending') {
      return NextResponse.json({ error: 'تم معالجة هذا الطلب بالفعل' }, { status: 400 })
    }

    if (action === 'approve') {
      // Approve and create expert account
      if (!password) {
        return NextResponse.json({ error: 'كلمة المرور مطلوبة' }, { status: 400 })
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: application.email }
      })

      if (existingUser) {
        return NextResponse.json({
          error: 'هذا البريد الإلكتروني مسجل بالفعل'
        }, { status: 400 })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Get hackathon details
      const hackathon = await prisma.hackathon.findUnique({
        where: { id: application.hackathonId },
        select: { title: true }
      })

      if (!hackathon) {
        return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
      }

      // Create user and expert in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            name: application.name,
            email: application.email,
            phone: application.phone,
            password: hashedPassword,
            role: 'expert'
          }
        })

        // Create expert record
        const expert = await tx.expert.create({
          data: {
            userId: user.id,
            hackathonId: application.hackathonId,
            isActive: true
          }
        })

        // Update application status
        const updatedApplication = await tx.expertApplication.update({
          where: { id: params.id },
          data: {
            status: 'approved',
            reviewedBy: payload.userId,
            reviewNotes,
            reviewedAt: new Date()
          }
        })

        return { user, expert, application: updatedApplication }
      })

      console.log('✅ Application approved and expert account created')

      // Send approval email with credentials
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER || process.env.EMAIL_USER,
            pass: process.env.GMAIL_PASS || process.env.EMAIL_PASS
          }
        })

        const emailContent = getExpertApprovalEmailContent(
          application.name,
          hackathon.title,
          application.email,
          password
        )

        await transporter.sendMail({
          from: `"${hackathon.title}" <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
          to: application.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        })

        console.log('✅ Approval email sent successfully to:', application.email)
      } catch (emailError) {
        console.error('❌ Error sending approval email:', emailError)
        // Don't fail the request if email fails
      }

      return NextResponse.json({
        message: 'تم قبول الطلب وإنشاء حساب الخبير بنجاح',
        application: result.application,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email
        }
      })

    } else if (action === 'reject') {
      // Reject application
      if (!rejectionReason) {
        return NextResponse.json({ error: 'سبب الرفض مطلوب' }, { status: 400 })
      }

      const updatedApplication = await prisma.expertApplication.update({
        where: { id: params.id },
        data: {
          status: 'rejected',
          reviewedBy: payload.userId,
          reviewNotes,
          rejectionReason,
          reviewedAt: new Date()
        }
      })

      console.log('✅ Application rejected')

      return NextResponse.json({
        message: 'تم رفض الطلب',
        application: updatedApplication
      })

    } else {
      return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Error processing application:', error)
    return NextResponse.json({
      error: 'خطأ في معالجة الطلب',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE /api/admin/expert-applications/[id] - Delete application
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    await prisma.expertApplication.delete({
      where: { id: params.id }
    })

    console.log('✅ Application deleted')

    return NextResponse.json({ message: 'تم حذف الطلب بنجاح' })

  } catch (error) {
    console.error('❌ Error deleting application:', error)
    return NextResponse.json({ error: 'خطأ في حذف الطلب' }, { status: 500 })
  }
}
