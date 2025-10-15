import { NextRequest, NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Allow both admin and supervisor
    const userRole = request.headers.get("x-user-role");
    if (!["admin", "supervisor"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 });
    }

    const { templateKey, testEmail } = await request.json()

    if (!templateKey || !testEmail) {
      return NextResponse.json(
        { success: false, error: 'Template key and test email are required' },
        { status: 400 }
      )
    }
    
    const template = await prisma.emailTemplate.findUnique({
      where: { templateKey }
    })
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }
    
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
    
    await sendMail({
      to: testEmail,
      subject,
      html: body
    })
    
    return NextResponse.json({
      success: true,
      message: `Test email sent to ${testEmail}`
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}
