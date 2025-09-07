import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { sendMail } from '@/lib/mailer'

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

// POST /api/admin/emails/broadcast - Send broadcast emails
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'تعذر تهيئة قاعدة البيانات' }, { status: 500 })
    }

    const body = await request.json()
    const { 
      subject,
      message,
      selectedUsers,
      selectedHackathon,
      includeHackathonDetails = false
    } = body

    if (!subject || !message || !selectedUsers || selectedUsers.length === 0) {
      return NextResponse.json({ error: 'البيانات المطلوبة مفقودة' }, { status: 400 })
    }

    // Get users data
    const users = await prismaClient.user.findMany({
      where: {
        id: { in: selectedUsers }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    // Get hackathon data if selected
    let hackathon = null
    if (selectedHackathon) {
      hackathon = await prismaClient.hackathon.findUnique({
        where: { id: selectedHackathon }
      })
    }

    // Send emails to all selected users
    const emailPromises = users.map(async (user) => {
      const emailSubject = subject
      
      let emailContent = `مرحباً ${user.name},

${message}

${includeHackathonDetails && hackathon ? `
تفاصيل الهاكاثون:
- العنوان: ${hackathon.title}
- الوصف: ${hackathon.description}
- تاريخ البداية: ${new Date(hackathon.startDate).toLocaleDateString('ar-SA')}
- تاريخ النهاية: ${new Date(hackathon.endDate).toLocaleDateString('ar-SA')}
- موعد انتهاء التسجيل: ${new Date(hackathon.registrationDeadline).toLocaleDateString('ar-SA')}

للتسجيل في الهاكاثون، يرجى زيارة:
${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/hackathons/${hackathon.id}/register
` : ''}

مع أطيب التحيات،
فريق هاكاثون الابتكار التقني`

      const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${emailSubject}</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 50%, #c3e956 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">📢 رسالة مهمة</h1>
            <p style="margin: 10px 0 0 0;">هاكاثون الابتكار التقني</p>
        </div>
        <div style="padding: 30px;">
            <p>مرحباً <strong>${user.name}</strong>,</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                ${message.split('\n').map(line => `<p style="margin: 10px 0;">${line}</p>`).join('')}
            </div>
            
            ${includeHackathonDetails && hackathon ? `
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #3ab666; margin-top: 0;">🎯 تفاصيل الهاكاثون:</h3>
                <ul style="margin: 0; padding-right: 20px;">
                    <li><strong>العنوان:</strong> ${hackathon.title}</li>
                    <li><strong>الوصف:</strong> ${hackathon.description}</li>
                    <li><strong>تاريخ البداية:</strong> ${new Date(hackathon.startDate).toLocaleDateString('ar-SA')}</li>
                    <li><strong>تاريخ النهاية:</strong> ${new Date(hackathon.endDate).toLocaleDateString('ar-SA')}</li>
                    <li><strong>موعد انتهاء التسجيل:</strong> ${new Date(hackathon.registrationDeadline).toLocaleDateString('ar-SA')}</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/hackathons/${hackathon.id}/register" 
                   style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    سجل الآن في الهاكاثون 🚀
                </a>
            </div>
            ` : ''}
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0;">© 2024 هاكاثون الابتكار التقني. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>
      `

      return sendMail({
        to: user.email,
        subject: emailSubject,
        text: emailContent,
        html: emailHtml
      })
    })

    // Wait for all emails to be sent
    await Promise.all(emailPromises)

    return NextResponse.json({ 
      message: `تم إرسال ${emailPromises.length} إيميل بنجاح`,
      sentCount: emailPromises.length
    })

  } catch (error) {
    console.error('Error sending broadcast emails:', error)
    return NextResponse.json({ error: 'خطأ في إرسال الإيميلات' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
