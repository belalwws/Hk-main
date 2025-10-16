import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { sendTemplatedEmail } from '@/lib/mailer'
import crypto from 'crypto'

// POST /api/admin/participants/[id]/send-upload-link - إرسال رابط رفع العرض التقديمي
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: participantId } = await params
    
    // التحقق من صلاحيات المستخدم
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    console.log('📧 [send-upload-link] Sending upload link for participant:', participantId)

    // جلب بيانات المشارك
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        team: {
          select: {
            id: true,
            name: true
          }
        },
        hackathon: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'المشارك غير موجود' }, { status: 404 })
    }

    if (!participant.team) {
      return NextResponse.json({ error: 'المشارك غير مضاف لفريق بعد' }, { status: 400 })
    }

    if (participant.status !== 'approved') {
      return NextResponse.json({ error: 'المشارك غير مقبول بعد' }, { status: 400 })
    }

    // التحقق من وجود token سابق غير مستخدم
    const existingToken = await prisma.uploadToken.findFirst({
      where: {
        participantId: participant.id,
        used: false,
        expiresAt: {
          gte: new Date()
        }
      }
    })

    let uploadToken

    if (existingToken) {
      // استخدام الـ token الموجود
      uploadToken = existingToken
      console.log('♻️ [send-upload-link] Using existing token:', uploadToken.token)
    } else {
      // إنشاء token جديد
      const tokenString = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 14) // صالح لمدة 14 يوم

      uploadToken = await prisma.uploadToken.create({
        data: {
          token: tokenString,
          participantId: participant.id,
          teamId: participant.team.id,
          hackathonId: participant.hackathon.id,
          expiresAt: expiresAt
        }
      })

      console.log('✅ [send-upload-link] Created new token:', uploadToken.token)
    }

    // إنشاء رابط الرفع
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const uploadLink = `${baseUrl}/upload-presentation?token=${uploadToken.token}`

    // تنسيق تاريخ الانتهاء
    const expiryDate = new Date(uploadToken.expiresAt).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // إرسال الإيميل باستخدام نظام القوالب
    try {
      await sendTemplatedEmail(
        'upload_link',
        participant.user.email,
        {
          participantName: participant.user.name,
          hackathonTitle: participant.hackathon.title,
          teamName: participant.team.name,
          uploadLink: uploadLink,
          expiryDate: expiryDate
        }
      )
      console.log('✅ [send-upload-link] Email sent successfully to:', participant.user.email)
    } catch (emailError) {
      console.warn('⚠️ [send-upload-link] Email not sent:', emailError)
      return NextResponse.json({
        message: 'تم إنشاء الرابط بنجاح (لم يتم إرسال الإيميل)',
        uploadLink: uploadLink,
        token: uploadToken.token,
        expiresAt: uploadToken.expiresAt,
        emailSent: false
      })
    }

    return NextResponse.json({
      message: 'تم إرسال رابط رفع العرض التقديمي بنجاح',
      uploadLink: uploadLink,
      token: uploadToken.token,
      expiresAt: uploadToken.expiresAt,
      emailSent: true
    })

  } catch (error) {
    console.error('❌ [send-upload-link] Error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إرسال الرابط' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

