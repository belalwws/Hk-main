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

const transporter = getTransporter()

// POST /api/supervisor/hackathons/[id]/teams/confirm-transfers - Confirm all transfers and send emails
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId } = params
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
    }

    const { transfers } = await request.json()

    if (!transfers || !Array.isArray(transfers) || transfers.length === 0) {
      return NextResponse.json({ error: 'لا توجد انتقالات لتأكيدها' }, { status: 400 })
    }

    // Get hackathon details
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { title: true }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Collect all affected teams
    const affectedTeamIds = new Set<string>()
    const movedParticipants: any[] = []

    transfers.forEach((transfer: any) => {
      affectedTeamIds.add(transfer.fromTeamId)
      affectedTeamIds.add(transfer.toTeamId)
      movedParticipants.push({
        name: transfer.memberName,
        email: transfer.memberEmail,
        fromTeam: transfer.fromTeamName,
        toTeam: transfer.toTeamName
      })
    })

    // Get all affected teams with their current members
    const affectedTeams = await prisma.team.findMany({
      where: {
        id: { in: Array.from(affectedTeamIds) },
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
        }
      }
    })

    let emailsSent = 0
    const emailErrors: string[] = []

    // Send emails to moved participants
    for (const participant of movedParticipants) {
      try {
        await transporter.sendMail({
          from: process.env.MAIL_FROM || 'هاكاثون الابتكار التقني <racein668@gmail.com>',
          to: participant.email,
          subject: `🎉 تم نقلك إلى ${participant.toTeam} - ${hackathon.title}`,
          html: getMovedToTeamEmailContent(
            participant.name,
            hackathon.title,
            participant.fromTeam,
            participant.toTeam
          )
        })
        emailsSent++
        console.log(`📧 Move notification sent to ${participant.email}`)
      } catch (error) {
        console.error(`❌ Failed to send email to ${participant.email}:`, error)
        emailErrors.push(`${participant.email}: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`)
      }
    }

    // Send team update emails to all affected team members
    for (const team of affectedTeams) {
      if (team.participants.length === 0) continue

      const teamMembersList = team.participants.map((member: any) =>
        `${member.user.name} (${member.user.preferredRole || 'مطور'})`
      ).join('\n')

      // Find which transfers affected this team
      const teamTransfers = transfers.filter((t: any) => 
        t.fromTeamId === team.id || t.toTeamId === team.id
      )

      let changeMessage = ''
      if (teamTransfers.length > 0) {
        const changes = teamTransfers.map((t: any) => {
          if (t.fromTeamId === team.id) {
            return `تم نقل ${t.memberName} من الفريق`
          } else {
            return `تم إضافة ${t.memberName} إلى الفريق`
          }
        })
        changeMessage = changes.join('\n')
      }

      for (const member of team.participants) {
        try {
          await transporter.sendMail({
            from: process.env.MAIL_FROM || 'هاكاثون الابتكار التقني <racein668@gmail.com>',
            to: member.user.email,
            subject: `🔄 تحديث في ${team.name} - ${hackathon.title}`,
            html: getTeamChangeEmailContent(
              member.user.name,
              hackathon.title,
              team.name,
              changeMessage,
              teamMembersList
            )
          })
          emailsSent++
          console.log(`📧 Team update email sent to ${member.user.email}`)
        } catch (error) {
          console.error(`❌ Failed to send email to ${member.user.email}:`, error)
          emailErrors.push(`${member.user.email}: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`)
        }
      }
    }

    return NextResponse.json({
      message: `تم تأكيد ${transfers.length} عملية نقل وإرسال ${emailsSent} إيميل بنجاح`,
      emailsSent,
      transfersConfirmed: transfers.length,
      errors: emailErrors.length > 0 ? emailErrors : undefined
    })

  } catch (error) {
    console.error('Error confirming transfers:', error)
    return NextResponse.json({ error: 'خطأ في تأكيد الانتقالات' }, { status: 500 })
  }
}

// Email template for moved participant
function getMovedToTeamEmailContent(
  name: string,
  hackathonTitle: string,
  fromTeamName: string,
  toTeamName: string
): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            <span style="font-size: 40px;">🎉</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">تم نقلك إلى فريق جديد!</h1>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #667eea; margin-top: 0; font-size: 24px;">مرحباً ${name}! 👋</h2>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 20px 0;">
            نود إعلامك بأنه تم نقلك إلى فريق جديد في <strong>${hackathonTitle}</strong>
          </p>

          <!-- Transfer Details -->
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 15px; padding: 25px; margin: 30px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
              <div style="text-align: center; flex: 1;">
                <div style="color: white; font-size: 14px; opacity: 0.9; margin-bottom: 5px;">من</div>
                <div style="color: white; font-size: 18px; font-weight: bold;">${fromTeamName}</div>
              </div>
              <div style="color: white; font-size: 30px; margin: 0 20px;">→</div>
              <div style="text-align: center; flex: 1;">
                <div style="color: white; font-size: 14px; opacity: 0.9; margin-bottom: 5px;">إلى</div>
                <div style="color: white; font-size: 18px; font-weight: bold;">${toTeamName}</div>
              </div>
            </div>
          </div>

          <div style="background: #f7fafc; border-right: 4px solid #667eea; padding: 20px; border-radius: 10px; margin: 25px 0;">
            <p style="color: #2d3748; margin: 0; font-size: 15px; line-height: 1.6;">
              💡 <strong>ملاحظة:</strong> سيتم إرسال إيميل آخر يحتوي على تفاصيل فريقك الجديد وأسماء الأعضاء قريباً.
            </p>
          </div>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 25px 0;">
            نتمنى لك التوفيق مع فريقك الجديد! 🚀
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #718096; font-size: 14px; margin: 0;">
            مع أطيب التمنيات،<br>
            <strong style="color: #667eea;">فريق ${hackathonTitle}</strong>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Email template for team change notification
function getTeamChangeEmailContent(
  name: string,
  hackathonTitle: string,
  teamName: string,
  changeMessage: string,
  teamMembersList: string
): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            <span style="font-size: 40px;">🔄</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">تحديث في فريقك</h1>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #667eea; margin-top: 0; font-size: 24px;">مرحباً ${name}! 👋</h2>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 20px 0;">
            حدث تحديث في فريقك <strong>${teamName}</strong> في <strong>${hackathonTitle}</strong>
          </p>

          <!-- Change Message -->
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 15px; padding: 25px; margin: 30px 0;">
            <h3 style="color: white; margin: 0 0 15px 0; font-size: 18px;">📋 التغييرات:</h3>
            <div style="color: white; font-size: 15px; line-height: 1.8; white-space: pre-line;">${changeMessage}</div>
          </div>

          <!-- Team Members -->
          <div style="background: #f7fafc; border-radius: 15px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px;">👥 أعضاء الفريق الحاليون:</h3>
            <div style="color: #4a5568; font-size: 15px; line-height: 2; white-space: pre-line;">${teamMembersList}</div>
          </div>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 25px 0;">
            نتمنى لكم التوفيق والنجاح! 🚀
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #718096; font-size: 14px; margin: 0;">
            مع أطيب التمنيات،<br>
            <strong style="color: #667eea;">فريق ${hackathonTitle}</strong>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

