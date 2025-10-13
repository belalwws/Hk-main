import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
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

// POST /api/admin/certificates/send - Send certificate via email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, type } = body

    if (!id || !type || !['judge', 'supervisor'].includes(type)) {
      return NextResponse.json({ error: "بيانات غير كاملة" }, { status: 400 })
    }

    let record: any
    let certificateUrl: string | null = null
    let userName: string = ''
    let userEmail: string = ''
    let hackathonTitle: string = ''
    let roleTitle: string = ''

    // Get record based on type
    if (type === 'judge') {
      record = await prisma.judge.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          hackathon: {
            select: {
              title: true
            }
          }
        }
      })
      roleTitle = 'محكم'
    } else {
      record = await prisma.supervisor.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          hackathon: {
            select: {
              title: true
            }
          }
        }
      })
      roleTitle = 'مشرف'
    }

    if (!record) {
      return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 })
    }

    if (!record.certificateUrl) {
      return NextResponse.json({ error: "لم يتم رفع الشهادة بعد" }, { status: 400 })
    }

    certificateUrl = record.certificateUrl!
    userName = record.user.name
    userEmail = record.user.email
    hackathonTitle = record.hackathon?.title || 'الهاكاثون'

    // Send email with certificate
    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'هاكاثون الابتكار التقني <racein668@gmail.com>',
      to: userEmail,
      subject: `🏆 شهادة تقدير - ${hackathonTitle}`,
      html: getCertificateEmailContent(userName, hackathonTitle, roleTitle, certificateUrl)
    })

    // Update record
    const updateData = {
      certificateSent: true,
      certificateSentAt: new Date()
    }

    if (type === 'judge') {
      await prisma.judge.update({
        where: { id },
        data: updateData
      })
    } else {
      await prisma.supervisor.update({
        where: { id },
        data: updateData
      })
    }

    return NextResponse.json({
      message: "تم إرسال الشهادة بنجاح"
    })
  } catch (error) {
    console.error("Error sending certificate:", error)
    return NextResponse.json({ error: "حدث خطأ في إرسال الشهادة" }, { status: 500 })
  }
}

function getCertificateEmailContent(
  userName: string,
  hackathonTitle: string,
  roleTitle: string,
  certificateUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>شهادة تقدير</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">🏆 شهادة تقدير</h1>
          <p style="color: #c3e956; margin: 15px 0 0 0; font-size: 18px;">تكريماً لجهودك المتميزة</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #01645e; margin: 0 0 20px 0; font-size: 28px; text-align: center;">
            ${userName}
          </h2>
          
          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-right: 4px solid #3ab666; padding: 25px; margin: 25px 0; border-radius: 10px; text-align: center;">
            <p style="color: #333; font-size: 18px; line-height: 1.8; margin: 0;">
              نتقدم لك بجزيل الشكر والتقدير على جهودك المتميزة كـ <strong style="color: #3ab666;">${roleTitle}</strong> في
              <strong style="color: #01645e;">${hackathonTitle}</strong>
            </p>
          </div>

          <p style="color: #666; line-height: 1.8; font-size: 16px; text-align: center; margin: 30px 0;">
            إن مساهمتك الفعّالة وتفانيك في العمل كانت له الأثر الكبير في إنجاح هذا الحدث
          </p>

          <!-- Certificate Image/Link -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${certificateUrl}" style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 18px;">
              📥 تحميل الشهادة
            </a>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <p style="color: #856404; margin: 0; text-align: center; font-size: 14px;">
              💡 يمكنك تحميل الشهادة والاحتفاظ بها أو مشاركتها على وسائل التواصل الاجتماعي
            </p>
          </div>

          <div style="background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%); border: 2px solid #3ab666; border-radius: 10px; padding: 20px; margin: 25px 0; text-align: center;">
            <p style="color: #01645e; margin: 0; font-weight: bold; font-size: 16px;">
              🌟 شكراً لك على مساهمتك القيمة
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">
            ${hackathonTitle}
          </p>
          <p style="color: #999; margin: 0; font-size: 12px;">
            تم إرسال هذا البريد تلقائياً، يرجى عدم الرد عليه
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
