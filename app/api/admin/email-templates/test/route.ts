import { NextRequest, NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('📧 [test-email] Starting test email process...')

    // Allow both admin and supervisor
    const userRole = request.headers.get("x-user-role");
    console.log('🔍 [test-email] User role:', userRole)

    if (!["admin", "supervisor"].includes(userRole || "")) {
      console.error('❌ [test-email] Unauthorized access attempt')
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 });
    }

    const { templateKey, testEmail } = await request.json()
    console.log('📧 [test-email] Template key:', templateKey)
    console.log('📧 [test-email] Test email:', testEmail)

    if (!templateKey || !testEmail) {
      console.error('❌ [test-email] Missing required fields')
      return NextResponse.json(
        { success: false, error: 'مطلوب مفتاح القالب والبريد الإلكتروني' },
        { status: 400 }
      )
    }

    const template = await prisma.emailTemplate.findUnique({
      where: { templateKey }
    })

    if (!template) {
      console.error('❌ [test-email] Template not found:', templateKey)
      return NextResponse.json(
        { success: false, error: 'القالب غير موجود' },
        { status: 404 }
      )
    }

    console.log('✅ [test-email] Template found:', template.nameAr)

    // استبدال المتغيرات بقيم تجريبية
    let subject = template.subject
    let body = template.bodyHtml

    const testVariables: Record<string, string> = {
      participantName: 'أحمد محمد',
      participantEmail: testEmail,
      hackathonTitle: 'هاكاثون الابتكار 2024',
      registrationDate: new Date().toLocaleDateString('ar-EG'),
      teamRole: 'مطور',
      hackathonDate: '2024-12-01',
      hackathonLocation: 'الرياض',
      teamName: 'الفريق المبتكر',
      teamNumber: '1'
    }

    // استبدال المتغيرات
    Object.entries(testVariables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      subject = subject.replace(regex, value)
      body = body.replace(regex, value)
    })

    console.log('📧 [test-email] Sending email...')
    console.log('📧 [test-email] Subject:', subject)

    const result = await sendMail({
      to: testEmail,
      subject,
      html: body
    })

    console.log('✅ [test-email] Email result:', result)

    // Check if email was actually sent or mocked
    if (result.mocked || !result.actuallyMailed) {
      console.warn('⚠️ [test-email] Email was mocked (SMTP not configured)')
      return NextResponse.json({
        success: false,
        error: 'إعدادات البريد الإلكتروني غير مكتملة. يرجى التحقق من متغيرات البيئة (GMAIL_USER و GMAIL_PASS)',
        mocked: true
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `تم إرسال إيميل تجريبي إلى ${testEmail}`,
      messageId: result.messageId
    })
  } catch (error) {
    console.error('❌ [test-email] Error sending test email:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'فشل إرسال الإيميل التجريبي. تحقق من إعدادات البريد الإلكتروني.'
      },
      { status: 500 }
    )
  }
}
