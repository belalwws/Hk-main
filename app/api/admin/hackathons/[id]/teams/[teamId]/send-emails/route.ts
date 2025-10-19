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

// POST /api/admin/hackathons/[id]/teams/[teamId]/send-emails - Send emails to team members
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const params = await context.params
    const { teamId } = params
    
    // Get custom email content from request body (optional)
    let customSubject: string | undefined
    let customMessage: string | undefined
    let pdfLink: string | undefined
    let additionalNotes: string | undefined
    
    try {
      const body = await request.json()
      customSubject = body.customSubject
      customMessage = body.customMessage
      pdfLink = body.pdfLink
      additionalNotes = body.additionalNotes
    } catch (e) {
      // No body sent, use defaults
      console.log('📧 [send-emails] No custom content provided, using defaults')
    }

    // Get team with members and hackathon info
    const team = await prisma.team.findUnique({
      where: {
        id: teamId
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
      return NextResponse.json({ error: 'لا توجد أعضاء في الفريق' }, { status: 400 })
    }

    // Prepare team members list for email
    // By default, only show names. Roles are shown if explicitly set by user.
    const teamMembersList = team.participants.map(member => {
      const role = member.user.preferredRole
      return role ? `${member.user.name} (${role})` : member.user.name
    }).join('\n')

    // Send emails to all team members
    const emailPromises = team.participants.map(async (member) => {
      try {
        const emailSubject = customSubject || `📋 تفاصيل فريقك - ${team.name} - ${team.hackathon.title}`
        
        await transporter.sendMail({
          from: process.env.MAIL_FROM || 'هاكاثون الابتكار التقني <racein668@gmail.com>',
          to: member.user.email,
          subject: emailSubject,
          html: getTeamUpdateEmailContent(
            member.user.name,
            team.hackathon.title,
            team.name,
            member.user.preferredRole || 'مطور',
            teamMembersList,
            customMessage,
            pdfLink,
            additionalNotes
          )
        })

        console.log(`📧 Team update email sent to ${member.user.email}`)
        return { success: true, email: member.user.email }
      } catch (error) {
        console.error(`❌ Failed to send email to ${member.user.email}:`, error)
        return { success: false, email: member.user.email, error: (error as any).message }
      }
    })

    const emailResults = await Promise.all(emailPromises)
    const successfulEmails = emailResults.filter(r => r.success).length
    const failedEmails = emailResults.filter(r => !r.success).length

    console.log(`📊 Team email results: ${successfulEmails} successful, ${failedEmails} failed`)

    return NextResponse.json({
      message: `تم إرسال الإيميلات بنجاح`,
      emailsSent: successfulEmails,
      emailsFailed: failedEmails,
      teamName: team.name
    })

  } catch (error) {
    console.error('❌ Error sending team emails:', error)
    return NextResponse.json({ error: 'خطأ في إرسال الإيميلات' }, { status: 500 })
  }
}

function getTeamUpdateEmailContent(
  userName: string,
  hackathonTitle: string,
  teamName: string,
  userRole: string,
  teamMembers: string,
  customMessage?: string,
  pdfLink?: string,
  additionalNotes?: string
): string {
  const defaultMessage = `إليك المعلومات المحدثة عن فريقك في <strong style="color: #3ab666;">${hackathonTitle}</strong>`
  const message = customMessage || defaultMessage
  
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تفاصيل فريقك</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">📋 تفاصيل فريقك</h1>
          <p style="color: #c3e956; margin: 10px 0 0 0; font-size: 18px;">معلومات مهمة عن فريقك</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #01645e; margin: 0 0 20px 0; font-size: 24px;">مرحباً ${userName}! 👋</h2>
          
          <p style="color: #333; line-height: 1.8; font-size: 16px; margin-bottom: 25px;">
            ${message}
          </p>

          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-right: 4px solid #3ab666; padding: 25px; margin: 25px 0; border-radius: 10px;">
            <h3 style="color: #01645e; margin: 0 0 15px 0; font-size: 20px;">🏆 ${teamName}</h3>
            <p style="color: #666; margin: 0; font-size: 16px;">دورك في الفريق: <strong style="color: #3ab666;">${userRole}</strong></p>
          </div>

          <h3 style="color: #01645e; margin: 30px 0 15px 0;">👥 أعضاء فريقك:</h3>
          <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 15px 0;">
            <pre style="color: #333; margin: 0; font-family: inherit; white-space: pre-wrap; line-height: 1.6;">${teamMembers}</pre>
          </div>

          ${pdfLink ? `
          <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); border: 2px solid #ffc107; border-radius: 10px; padding: 20px; margin: 25px 0; text-align: center;">
            <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">📚 الكتيب الإرشادي</h3>
            <p style="color: #856404; margin: 0 0 15px 0; font-size: 14px;">يمكنك تحميل الكتيب الإرشادي الخاص بالهاكاثون من الرابط أدناه</p>
            <a href="${pdfLink}" style="background: #ffc107; color: #212529; padding: 12px 25px; text-decoration: none; border-radius: 20px; font-weight: bold; display: inline-block; transition: transform 0.3s;">
              📥 تحميل الكتيب الإرشادي (PDF)
            </a>
          </div>
          ` : ''}

          ${additionalNotes ? `
          <div style="background: #e3f2fd; border-right: 4px solid #2196f3; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #1565c0; margin: 0 0 10px 0; font-size: 16px;">💡 ملاحظات إضافية:</h3>
            <p style="color: #1976d2; margin: 0; line-height: 1.8; white-space: pre-wrap;">${additionalNotes}</p>
          </div>
          ` : ''}

          <h3 style="color: #01645e; margin: 30px 0 15px 0;">💡 نصائح للعمل الجماعي:</h3>
          <ul style="color: #333; line-height: 1.8; padding-right: 20px;">
            <li style="margin-bottom: 10px;">تواصلوا بانتظام وحددوا اجتماعات دورية</li>
            <li style="margin-bottom: 10px;">اتفقوا على أدوات التواصل والتطوير</li>
            <li style="margin-bottom: 10px;">قسموا المهام حسب خبرة كل عضو</li>
            <li style="margin-bottom: 10px;">ضعوا خطة زمنية واضحة للمشروع</li>
          </ul>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'https://hackathon-platform-601l.onrender.com'}/profile" style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; transition: transform 0.3s;">
              🏠 زيارة الملف الشخصي
            </a>
          </div>

          <div style="background: #e8f5e8; border: 1px solid #3ab666; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <p style="color: #01645e; margin: 0; font-weight: bold; text-align: center;">
              🚀 بالتوفيق لك ولفريقك في الهاكاثون!
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            هل تحتاج مساعدة؟ تواصل معنا على 
            <a href="mailto:support@hackathon.gov.sa" style="color: #3ab666;">support@hackathon.gov.sa</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
