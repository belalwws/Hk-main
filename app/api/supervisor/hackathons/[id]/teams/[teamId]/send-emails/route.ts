import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// Email transporter configuration
function getTransporter() {
  const gmailUser = process.env.GMAIL_USER || process.env.MAIL_USER
  const gmailPass = process.env.GMAIL_PASS || process.env.MAIL_PASS

  if (!gmailUser || !gmailPass) {
    throw new Error('Gmail credentials not configured')
  }

  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass
    }
  })
}

// POST /api/supervisor/hackathons/[id]/teams/[teamId]/send-emails - Send emails to all team members
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId, teamId } = params
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    // Verify supervisor is assigned to this hackathon
    if (userRole === "supervisor") {
      const supervisor = await prisma.supervisor.findFirst({
        where: {
          userId: userId!,
          hackathonId: hackathonId,
          isActive: true
        }
      })

      if (!supervisor) {
        return NextResponse.json({ 
          error: "غير مصرح - لست مشرفاً على هذا الهاكاثون" 
        }, { status: 403 })
      }

      // Check permissions
      const permissions = supervisor.permissions as any
      if (permissions && permissions.canSendMessages === false) {
        return NextResponse.json({ 
          error: "ليس لديك صلاحية إرسال الرسائل" 
        }, { status: 403 })
      }
    }

    // Get team with members and hackathon info
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        hackathonId: hackathonId
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                preferredRole: true
              }
            }
          }
        },
        hackathon: {
          select: {
            title: true
          }
        }
      }
    })

    if (!team) {
      return NextResponse.json({ error: 'الفريق غير موجود' }, { status: 404 })
    }

    if (team.participants.length === 0) {
      return NextResponse.json({ error: 'لا يوجد أعضاء في هذا الفريق' }, { status: 400 })
    }

    // Prepare team members list
    const teamMembersList = team.participants.map((member: any) => 
      `${member.user.name} (${member.user.preferredRole || 'مطور'})`
    ).join('\n')

    // Send emails to all team members
    const transporter = getTransporter()
    let emailsSent = 0
    const emailPromises = team.participants.map(async (member: any) => {
      try {
        await transporter.sendMail({
          from: process.env.MAIL_FROM || 'هاكاثون الابتكار التقني <racein668@gmail.com>',
          to: member.user.email,
          subject: `📋 تفاصيل فريقك - ${team.name} - ${team.hackathon.title}`,
          html: getTeamEmailContent(
            member.user.name,
            team.hackathon.title,
            team.name,
            teamMembersList
          )
        })
        emailsSent++
        console.log(`📧 Email sent to ${member.user.email}`)
      } catch (error) {
        console.error(`❌ Failed to send email to ${member.user.email}:`, error)
      }
    })

    await Promise.all(emailPromises)

    return NextResponse.json({
      message: `تم إرسال الإيميلات بنجاح`,
      emailsSent
    })

  } catch (error) {
    console.error('Error sending team emails:', error)
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف'

    // Check if it's a mailer configuration error
    const mailUser = process.env.MAIL_USER || process.env.GMAIL_USER
    const mailPass = process.env.MAIL_PASS || process.env.GMAIL_PASS

    if (errorMessage.includes('MAIL_USER') || errorMessage.includes('MAIL_PASS') || errorMessage.includes('GMAIL') || !mailUser || !mailPass) {
      return NextResponse.json({
        error: 'البريد الإلكتروني غير مُعد بشكل صحيح. يرجى التحقق من إعدادات Gmail في ملف .env',
        details: 'MAIL_USER/GMAIL_USER و MAIL_PASS/GMAIL_PASS مطلوبان',
        mailerConfigured: false,
        hasMailUser: !!mailUser,
        hasMailPass: !!mailPass
      }, { status: 500 })
    }

    return NextResponse.json({
      error: 'خطأ في إرسال الإيميلات',
      details: errorMessage
    }, { status: 500 })
  }
}

// Email template for team information
function getTeamEmailContent(
  userName: string,
  hackathonTitle: string,
  teamName: string,
  teamMembersList: string
): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تفاصيل فريقك</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">📋 تفاصيل فريقك</h1>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
        مرحباً <strong>${userName}</strong>،
      </p>

      <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 20px;">
        نود إعلامك بتفاصيل فريقك في <strong>${hackathonTitle}</strong>:
      </p>

      <div style="background-color: #f0f9ff; border-right: 4px solid #3ab666; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p style="margin: 0; color: #01645e; font-size: 18px;">
          <strong>اسم الفريق:</strong> ${teamName}
        </p>
      </div>

      <h3 style="color: #01645e; margin-top: 30px; margin-bottom: 15px;">👥 أعضاء الفريق:</h3>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-line; font-size: 14px; color: #333;">
${teamMembersList}
      </div>

      <div style="margin-top: 30px; padding: 20px; background-color: #fff8e1; border-radius: 5px; border-right: 4px solid #c3e956;">
        <p style="margin: 0; color: #8b7632; font-size: 14px;">
          💡 <strong>نصيحة:</strong> تواصل مع أعضاء فريقك لتنسيق العمل على المشروع!
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; color: #666; font-size: 14px;">
        بالتوفيق في الهاكاثون! 🚀
      </p>
      <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
        ${hackathonTitle}
      </p>
    </div>
  </div>
</body>
</html>
  `
}

