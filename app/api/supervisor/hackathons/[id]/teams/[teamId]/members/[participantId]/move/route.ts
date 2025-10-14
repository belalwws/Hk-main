import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
})

// POST /api/supervisor/hackathons/[id]/teams/[teamId]/members/[participantId]/move - Move member to another team
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; teamId: string; participantId: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId, teamId: sourceTeamId, participantId } = params
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
      if (permissions && permissions.canManageTeams === false) {
        return NextResponse.json({ 
          error: "ليس لديك صلاحية إدارة الفرق" 
        }, { status: 403 })
      }
    }

    const { targetTeamId } = await request.json()

    if (!targetTeamId) {
      return NextResponse.json({ error: 'معرف الفريق المستهدف مطلوب' }, { status: 400 })
    }

    // Check if participant exists and is in the source team
    const participant = await prisma.participant.findFirst({
      where: {
        id: participantId,
        hackathonId: hackathonId,
        teamId: sourceTeamId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'العضو غير موجود في الفريق المصدر' }, { status: 404 })
    }

    // Check if target team exists
    const targetTeam = await prisma.team.findFirst({
      where: {
        id: targetTeamId,
        hackathonId: hackathonId
      }
    })

    if (!targetTeam) {
      return NextResponse.json({ error: 'الفريق المستهدف غير موجود' }, { status: 404 })
    }

    // Get source team info
    const sourceTeam = await prisma.team.findUnique({
      where: { id: sourceTeamId }
    })

    // Move participant to target team
    await prisma.participant.update({
      where: {
        id: participantId
      },
      data: {
        teamId: targetTeamId
      }
    })

    // Get updated teams information for email notifications
    const [updatedSourceTeam, updatedTargetTeam] = await Promise.all([
      prisma.team.findUnique({
        where: { id: sourceTeamId },
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
            select: { title: true }
          }
        }
      }),
      prisma.team.findUnique({
        where: { id: targetTeamId },
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
            select: { title: true }
          }
        }
      })
    ])

    // Send email notifications to both teams
    if (updatedSourceTeam && updatedSourceTeam.participants.length > 0) {
      await sendTeamUpdateEmails(
        updatedSourceTeam,
        `تم نقل ${participant.user.name} من الفريق`
      )
    }

    if (updatedTargetTeam) {
      await sendTeamUpdateEmails(
        updatedTargetTeam,
        `تم إضافة ${participant.user.name} إلى الفريق`
      )
    }

    // Send special email to the moved participant
    if (updatedTargetTeam?.hackathon) {
      await sendMovedToTeamEmail(
        participant.user.email,
        participant.user.name,
        sourceTeam?.name || 'الفريق السابق',
        targetTeam.name,
        updatedTargetTeam.hackathon.title
      )
    }

    return NextResponse.json({
      message: `تم نقل ${participant.user.name} من ${sourceTeam?.name} إلى ${targetTeam.name} بنجاح وإرسال الإيميلات`,
      movedMember: {
        name: participant.user.name,
        email: participant.user.email,
        fromTeam: sourceTeam?.name,
        toTeam: targetTeam.name
      }
    })

  } catch (error) {
    console.error('Error moving member between teams:', error)
    return NextResponse.json({ error: 'خطأ في نقل العضو بين الفرق' }, { status: 500 })
  }
}

// Helper function to send team update emails
async function sendTeamUpdateEmails(team: any, changeMessage: string) {
  if (team.participants.length === 0) return

  const teamMembersList = team.participants.map((member: any) =>
    `${member.user.name} (${member.user.preferredRole || 'مطور'})`
  ).join('\n')

  const emailPromises = team.participants.map(async (member: any) => {
    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || 'هاكاثون الابتكار التقني <racein668@gmail.com>',
        to: member.user.email,
        subject: `🔄 تحديث في ${team.name} - ${team.hackathon.title}`,
        html: getTeamChangeEmailContent(
          member.user.name,
          team.hackathon.title,
          team.name,
          changeMessage,
          teamMembersList
        )
      })
      console.log(`📧 Team update email sent to ${member.user.email}`)
    } catch (error) {
      console.error(`❌ Failed to send email to ${member.user.email}:`, error)
    }
  })

  await Promise.all(emailPromises)
}

// Helper function to send email to moved participant
async function sendMovedToTeamEmail(
  email: string,
  name: string,
  fromTeamName: string,
  toTeamName: string,
  hackathonTitle: string
) {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'هاكاثون الابتكار التقني <racein668@gmail.com>',
      to: email,
      subject: `🎉 تم نقلك إلى ${toTeamName} - ${hackathonTitle}`,
      html: getMovedToTeamEmailContent(name, hackathonTitle, fromTeamName, toTeamName)
    })
    console.log(`📧 Move notification sent to ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send move email to ${email}:`, error)
  }
}

// Email template for team changes
function getTeamChangeEmailContent(
  userName: string,
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
  <title>تحديث الفريق</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🔄 تحديث في فريقك</h1>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
        مرحباً <strong>${userName}</strong>،
      </p>

      <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 20px;">
        نود إعلامك بتحديث في تشكيلة <strong>${teamName}</strong> في <strong>${hackathonTitle}</strong>:
      </p>

      <div style="background-color: #f0f9ff; border-right: 4px solid #3ab666; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p style="margin: 0; color: #01645e; font-size: 16px;">
          <strong>التحديث:</strong> ${changeMessage}
        </p>
      </div>

      <h3 style="color: #01645e; margin-top: 30px; margin-bottom: 15px;">👥 أعضاء الفريق الحاليون:</h3>
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

// Email template for moved participant
function getMovedToTeamEmailContent(
  userName: string,
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
  <title>تم نقلك إلى فريق جديد</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3ab666 0%, #c3e956 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🎉 مرحباً بك في فريقك الجديد!</h1>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
        عزيزي <strong>${userName}</strong>،
      </p>

      <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 20px;">
        تم نقلك من <strong>${fromTeamName}</strong> إلى <strong>${toTeamName}</strong> في <strong>${hackathonTitle}</strong>.
      </p>

      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e8f5e9 100%); padding: 20px; border-radius: 10px; margin: 25px 0;">
        <div style="text-align: center; margin-bottom: 15px;">
          <span style="font-size: 40px;">🔄</span>
        </div>
        <div style="display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap;">
          <div style="text-align: center; padding: 10px;">
            <div style="color: #666; font-size: 14px; margin-bottom: 5px;">من</div>
            <div style="color: #01645e; font-size: 18px; font-weight: bold;">${fromTeamName}</div>
          </div>
          <div style="font-size: 30px; color: #3ab666;">→</div>
          <div style="text-align: center; padding: 10px;">
            <div style="color: #666; font-size: 14px; margin-bottom: 5px;">إلى</div>
            <div style="color: #3ab666; font-size: 18px; font-weight: bold;">${toTeamName}</div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px; padding: 20px; background-color: #fff3e0; border-radius: 5px; border-right: 4px solid #ff9800;">
        <p style="margin: 0; color: #e65100; font-size: 14px;">
          📌 <strong>مهم:</strong> تواصل مع أعضاء فريقك الجديد في أقرب وقت لتنسيق العمل على المشروع!
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; color: #666; font-size: 14px;">
        نتمنى لك التوفيق مع فريقك الجديد! 🚀
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
