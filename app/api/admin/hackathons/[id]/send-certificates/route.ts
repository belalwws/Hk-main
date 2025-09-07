import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import nodemailer from 'nodemailer'
import { generateCertificateImage, CertificateData } from '@/lib/certificate-pdf'

const prisma = new PrismaClient()

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'racein668@gmail.com',
    pass: process.env.GMAIL_PASS || 'gpbyxbbvrzfyluqt'
  }
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح - الأدمن فقط' }, { status: 403 })
    }

    const hackathonId = params.id

    // Get hackathon details
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        teams: {
          include: {
            participants: {
              where: { status: 'APPROVED' },
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            },
            scores: {
              include: {
                criterion: true,
                judge: {
                  include: {
                    user: {
                      select: { name: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Calculate team rankings
    const teamsWithScores = hackathon.teams.map(team => {
      const totalScore = team.scores.reduce((sum, score) => sum + score.score, 0)
      const averageScore = team.scores.length > 0 ? totalScore / team.scores.length : 0
      
      return {
        ...team,
        totalScore,
        averageScore,
        evaluationsCount: team.scores.length
      }
    }).sort((a, b) => b.totalScore - a.totalScore)

    // Add rank to teams
    const rankedTeams = teamsWithScores.map((team, index) => ({
      ...team,
      rank: index + 1
    }))

    // جمع جميع المشاركين مع معلومات فرقهم
    const allParticipants = []
    for (const team of rankedTeams) {
      for (const participant of team.participants) {
        allParticipants.push({ participant, team })
      }
    }

    console.log(`📧 Preparing to send ${allParticipants.length} certificate emails...`)

    // إرسال الإيميلات بشكل متوازي
    const BATCH_SIZE = 3 // إرسال 3 إيميلات في نفس الوقت (أقل لأن الشهادات أكبر)
    let successCount = 0
    let failureCount = 0
    const results: any[] = []

    for (let i = 0; i < allParticipants.length; i += BATCH_SIZE) {
      const batch = allParticipants.slice(i, i + BATCH_SIZE)

      const emailPromises = batch.map(async ({ participant, team }) => {
        try {
          const isWinner = team.rank <= 3
          const emailSubject = isWinner
            ? `🏆 تهانينا! حصلت على ${team.rank === 1 ? 'المركز الأول' : team.rank === 2 ? 'المركز الثاني' : 'المركز الثالث'} في ${hackathon.title}`
            : `🎉 شكراً لمشاركتك في ${hackathon.title}`

          // إنشاء شهادة PDF
          console.log(`🎨 Generating certificate for ${participant.user.name}...`)
          const certificateData: CertificateData = {
            participantName: participant.user.name,
            hackathonTitle: hackathon.title,
            teamName: team.name,
            rank: team.rank,
            isWinner: isWinner,
            totalScore: team.totalScore,
            date: new Date().toLocaleDateString('ar-SA')
          }

          const certificateBuffer = await generateCertificateImage(certificateData)
          const certificateFileName = `certificate-${participant.user.name.replace(/\s+/g, '-')}-${hackathon.title.replace(/\s+/g, '-')}.png`

          const emailHtml = generateCertificateEmailWithAttachment(
            participant.user.name,
            hackathon.title,
            team.name,
            team.rank,
            isWinner,
            team.totalScore
          )

          await transporter.sendMail({
            from: process.env.MAIL_FROM || 'هاكاثون الابتكار التقني <racein668@gmail.com>',
            to: participant.user.email,
            subject: emailSubject,
            html: emailHtml,
            attachments: [
              {
                filename: certificateFileName,
                content: certificateBuffer,
                contentType: 'image/png'
              }
            ]
          })

          console.log(`✅ Certificate email sent to ${participant.user.email}`)
          return {
            email: participant.user.email,
            name: participant.user.name,
            team: team.name,
            rank: team.rank,
            status: 'success'
          }
        } catch (error) {
          console.error(`❌ Failed to send email to ${participant.user.email}:`, error)
          return {
            email: participant.user.email,
            name: participant.user.name,
            team: team.name,
            rank: team.rank,
            status: 'failed',
            error: error.message
          }
        }
      })

      // انتظار إرسال جميع إيميلات هذه المجموعة
      const batchResults = await Promise.all(emailPromises)

      // حساب النتائج وإضافتها للمصفوفة
      batchResults.forEach(result => {
        results.push(result)
        if (result.status === 'success') {
          successCount++
        } else {
          failureCount++
        }
      })

      // انتظار قصير بين المجموعات
      if (i + BATCH_SIZE < allParticipants.length) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // انتظار ثانيتين للشهادات
      }
    }

    console.log(`📊 Certificate results: ${successCount} successful, ${failureCount} failed`)

    return NextResponse.json({
      message: `تم إرسال ${successCount} إيميل بنجاح، فشل في إرسال ${failureCount} إيميل`,
      successCount,
      failureCount,
      results
    })

  } catch (error) {
    console.error('Error sending certificates:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

function generateCertificateEmailWithAttachment(
  participantName: string,
  hackathonTitle: string,
  teamName: string,
  rank: number,
  isWinner: boolean,
  totalScore: number
): string {
  const currentDate = new Date().toLocaleDateString('ar-SA')

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>شهادة تقدير - ${hackathonTitle}</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 0 30px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 50%, #c3e956 100%); color: white; padding: 40px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px; font-weight: bold;">
                ${isWinner ? '🏆 تهانينا بالفوز!' : '🎉 شكراً لمشاركتك!'}
            </h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">
                ${hackathonTitle}
            </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #01645e; margin: 0 0 10px 0; font-size: 28px;">
                    ${participantName}
                </h2>
                <p style="color: #8b7632; font-size: 16px; margin: 0;">
                    عضو في فريق: <strong>${teamName}</strong>
                </p>
            </div>

            ${isWinner ? `
            <div style="background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; border: 2px solid #d4af37;">
                <h3 style="margin: 0; color: #8b7632; font-size: 24px;">
                    🏆 ${rank === 1 ? 'المركز الأول' : rank === 2 ? 'المركز الثاني' : 'المركز الثالث'}
                </h3>
                <p style="margin: 10px 0 0 0; color: #8b7632; font-size: 16px;">
                    النتيجة النهائية: <strong>${totalScore} نقطة</strong>
                </p>
            </div>
            ` : `
            <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; border: 2px solid #3ab666;">
                <h3 style="margin: 0; color: #01645e; font-size: 20px;">
                    🎯 مشاركة متميزة
                </h3>
                <p style="margin: 10px 0 0 0; color: #01645e; font-size: 16px;">
                    شكراً لك على جهودك وإبداعك في الهاكاثون
                </p>
            </div>
            `}

            <!-- Certificate Attachment Notice -->
            <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; border: 2px solid #01645e;">
                <h3 style="margin: 0 0 15px 0; color: #01645e; font-size: 20px;">
                    📎 شهادتك مرفقة مع هذا الإيميل
                </h3>
                <p style="margin: 0; color: #8b7632; font-size: 16px; line-height: 1.6;">
                    ستجد شهادة التقدير الخاصة بك مرفقة مع هذا الإيميل.<br>
                    يمكنك تحميلها وطباعتها ومشاركتها مع الآخرين.
                </p>
                <div style="margin-top: 15px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #ddd;">
                    <p style="margin: 0; color: #01645e; font-weight: bold;">
                        📄 اسم الملف: certificate-${participantName.replace(/\s+/g, '-')}-${hackathonTitle.replace(/\s+/g, '-')}.png
                    </p>
                </div>
            </div>

            <!-- Message -->
            <div style="text-align: center; margin: 30px 0;">
                <p style="color: #8b7632; font-size: 16px; line-height: 1.8; margin: 0;">
                    ${isWinner
                        ? 'نفخر بإنجازك المتميز ونتطلع لرؤية المزيد من إبداعاتك في المستقبل.'
                        : 'مشاركتك كانت قيمة ومؤثرة. نتطلع لرؤيتك في فعالياتنا القادمة.'
                    }
                </p>
            </div>

            <!-- Stats -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 25px 0;">
                <h4 style="margin: 0 0 15px 0; color: #01645e; text-align: center;">📊 إحصائيات مشاركتك</h4>
                <div style="display: flex; justify-content: space-around; text-align: center; flex-wrap: wrap;">
                    <div style="margin: 10px;">
                        <strong style="color: #01645e; font-size: 18px;">${teamName}</strong>
                        <p style="margin: 5px 0 0 0; color: #8b7632; font-size: 14px;">اسم الفريق</p>
                    </div>
                    <div style="margin: 10px;">
                        <strong style="color: #01645e; font-size: 18px;">${rank}</strong>
                        <p style="margin: 5px 0 0 0; color: #8b7632; font-size: 14px;">الترتيب النهائي</p>
                    </div>
                    <div style="margin: 10px;">
                        <strong style="color: #01645e; font-size: 18px;">${currentDate}</strong>
                        <p style="margin: 5px 0 0 0; color: #8b7632; font-size: 14px;">تاريخ الشهادة</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #8b7632; font-size: 14px;">
                © 2024 هاكاثون الابتكار التقني. جميع الحقوق محفوظة.
            </p>
            <p style="margin: 5px 0 0 0; color: #8b7632; font-size: 12px;">
                تم إرسال هذه الشهادة تلقائياً من منصة الهاكاثون
            </p>
        </div>
    </div>
</body>
</html>
  `
}

function generateCertificateEmail(
  participantName: string,
  hackathonTitle: string,
  teamName: string,
  rank: number,
  isWinner: boolean,
  totalScore: number,
  participantId: string
): string {
  const currentDate = new Date().toLocaleDateString('ar-SA')
  
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>شهادة تقدير - ${hackathonTitle}</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 0 30px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 50%, #c3e956 100%); color: white; padding: 40px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px; font-weight: bold;">
                ${isWinner ? '🏆 تهانينا!' : '🎉 شكراً لمشاركتك!'}
            </h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">
                ${hackathonTitle}
            </p>
        </div>

        <!-- Certificate Content -->
        <div style="padding: 40px; text-align: center;">
            <!-- Certificate Title -->
            <div style="margin-bottom: 30px;">
                <h2 style="color: #01645e; font-size: 28px; margin-bottom: 10px; font-weight: bold;">
                    شهادة شكر و تقدير
                </h2>
                <div style="width: 100px; height: 4px; background: linear-gradient(to right, #c3e956, #3ab666); margin: 0 auto; border-radius: 2px;"></div>
            </div>

            <!-- Main Content -->
            <div style="margin-bottom: 30px; max-width: 600px; margin-left: auto; margin-right: auto;">
                <p style="font-size: 18px; color: #01645e; line-height: 1.8; margin-bottom: 20px;">
                    يتشرف رئيس اللجنة المنظمة لهاكاثون الابتكار في الخدمات الحكومية
                    <br>بتقديم جزيل الشكر و التقدير إلى:
                </p>
                
                <div style="background: linear-gradient(135deg, #c3e956/20, #3ab666/20); padding: 20px; border-radius: 15px; margin: 20px 0; border: 2px solid #3ab666/30;">
                    <h3 style="color: #c3a635; font-size: 24px; margin: 0; font-weight: bold;">
                        ${participantName}
                    </h3>
                    <p style="color: #01645e; margin: 5px 0 0 0; font-size: 16px;">
                        عضو في ${teamName}
                    </p>
                </div>

                ${isWinner ? `
                <div style="background: linear-gradient(135deg, #ffd700/20, #ff8c00/20); padding: 20px; border-radius: 15px; margin: 20px 0; border: 2px solid #ffd700;">
                    <h3 style="color: #ff8c00; font-size: 22px; margin: 0 0 10px 0; font-weight: bold;">
                        🏆 ${rank === 1 ? 'المركز الأول' : rank === 2 ? 'المركز الثاني' : rank === 3 ? 'المركز الثالث' : `المركز ${rank}`}
                    </h3>
                    <p style="color: #01645e; margin: 0; font-size: 16px;">
                        النتيجة النهائية: ${totalScore.toFixed(2)} نقطة
                    </p>
                </div>
                ` : ''}

                <p style="font-size: 16px; color: #01645e; line-height: 1.8; margin-top: 20px;">
                    وذلك تقديراً لعطائكم المتميز ومساهمتكم الفاعلة في إنجاح فعاليات الهاكاثون.
                    لقد أظهرتم روح الفريق الواحد، وساهمتم في جهودكم في تيسير مهام التنظيم،
                    مما انعكس إيجاباً على جودة التجربة للمشاركين والحضور.
                </p>
            </div>

            <!-- Date -->
            <div style="margin-bottom: 30px;">
                <p style="color: #01645e; font-size: 16px; margin: 0;">
                    حررت بتاريخ: ${currentDate}
                </p>
            </div>

            <!-- Certificate Link -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/certificate/${participantId}"
                   style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(1, 100, 94, 0.3);">
                    🏆 عرض الشهادة الرقمية
                </a>
                <p style="color: #8b7632; font-size: 14px; margin: 10px 0 0 0;">
                    يمكنك عرض وتحميل ومشاركة شهادتك من الرابط أعلاه
                </p>
            </div>

            <!-- Signature Section -->
            <div style="display: flex; justify-content: space-between; align-items: end; margin-top: 40px; padding-top: 20px; border-top: 2px solid #3ab666/30;">
                <div style="text-align: right;">
                    <p style="color: #01645e; font-weight: bold; margin: 0 0 5px 0;">رئيس اللجنة التنظيمية</p>
                    <p style="color: #8b7632; margin: 0;">م. محمد صقر</p>
                </div>

                <div style="text-align: center;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #01645e, #3ab666); border-radius: 10px; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                        شعار
                    </div>
                    <p style="color: #8b7632; font-size: 12px; margin: 0;">هاكاثون الابتكار</p>
                    <p style="color: #8b7632; font-size: 12px; margin: 0;">في الخدمات الحكومية</p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #8b7632; font-size: 14px;">
                © 2024 هاكاثون الابتكار التقني. جميع الحقوق محفوظة.
            </p>
            <p style="margin: 5px 0 0 0; color: #8b7632; font-size: 12px;">
                تم إرسال هذه الشهادة تلقائياً من منصة الهاكاثون
            </p>
        </div>
    </div>
</body>
</html>
  `
}
