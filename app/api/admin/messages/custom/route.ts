import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendTemplatedEmail } from '@/lib/mailer'

// GET /api/admin/messages/custom - Get custom messages
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Mock data for custom messages
    const customMessages = [
      {
        id: '1',
        subject: 'تحديث مهم: تغيير موعد الهاكاثون',
        targetAudience: 'مشاركي هاكاثون الابتكار التقني',
        status: 'sent',
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        recipientCount: 156
      },
      {
        id: '2',
        subject: 'دعوة للمشاركة في ورشة عمل مجانية',
        targetAudience: 'جميع المستخدمين',
        status: 'sent',
        sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        recipientCount: 1247
      },
      {
        id: '3',
        subject: 'تذكير: انتهاء فترة التسجيل قريباً',
        targetAudience: 'المستخدمين غير المسجلين',
        status: 'scheduled',
        recipientCount: 89
      },
      {
        id: '4',
        subject: 'استطلاع رأي حول تجربتك في المنصة',
        targetAudience: 'المشاركين السابقين',
        status: 'draft',
        recipientCount: 234
      }
    ]

    return NextResponse.json({ messages: customMessages })

  } catch (error) {
    console.error('Error fetching custom messages:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// POST /api/admin/messages/custom - Create and send custom message
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const {
      subject,
      content,
      targetAudience,
      filters,
      action, // 'save' or 'send'
      scheduledFor,
      sendImmediately
    } = body

    // Validate required fields
    if (!subject?.trim() || !content?.trim()) {
      return NextResponse.json({ 
        error: 'العنوان والمحتوى مطلوبان' 
      }, { status: 400 })
    }

    // Get target users based on audience and filters
    let targetUsers: any[] = []

    try {
      if (targetAudience === 'all') {
        targetUsers = await prisma.user.findMany({
          select: { id: true, name: true, email: true }
        })
      } else if (targetAudience === 'hackathon_participants') {
        const whereClause: any = {}
        
        if (filters.hackathonId) {
          whereClause.hackathonId = filters.hackathonId
        }
        
        if (filters.status) {
          whereClause.status = filters.status
        }

        const userWhereClause: any = {}
        if (filters.nationality) {
          userWhereClause.nationality = filters.nationality
        }
        if (filters.city) {
          userWhereClause.city = filters.city
        }

        if (Object.keys(userWhereClause).length > 0) {
          whereClause.user = userWhereClause
        }

        const participants = await prisma.participant.findMany({
          where: whereClause,
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        })

        targetUsers = participants.map(p => p.user)
      } else if (targetAudience === 'judges') {
        const judges = await prisma.judge.findMany({
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        })
        targetUsers = judges.map(j => j.user)
      } else if (targetAudience === 'admins') {
        const admins = await prisma.admin.findMany({
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        })
        targetUsers = admins.map(a => a.user)
      }

      // Remove duplicates
      const uniqueUsers = targetUsers.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      )

      if (action === 'send' && sendImmediately) {
        // Send emails immediately
        let sentCount = 0
        const errors: string[] = []

        for (const user of uniqueUsers) {
          try {
            // Replace variables in content
            let personalizedContent = content
              .replace(/{name}/g, user.name || 'المستخدم')
              .replace(/{email}/g, user.email)

            let personalizedSubject = subject
              .replace(/{name}/g, user.name || 'المستخدم')

            await sendTemplatedEmail({
              to: user.email,
              subject: personalizedSubject,
              template: 'custom',
              variables: {
                name: user.name || 'المستخدم',
                email: user.email,
                content: personalizedContent,
                subject: personalizedSubject
              }
            })

            sentCount++
          } catch (emailError) {
            console.error(`Failed to send email to ${user.email}:`, emailError)
            errors.push(`فشل إرسال الرسالة إلى ${user.email}`)
          }
        }

        return NextResponse.json({
          success: true,
          sentCount,
          totalTargeted: uniqueUsers.length,
          errors: errors.length > 0 ? errors : undefined,
          message: `تم إرسال الرسالة بنجاح إلى ${sentCount} من أصل ${uniqueUsers.length} مستلم`
        })
      } else {
        // Save as draft or schedule
        return NextResponse.json({
          success: true,
          message: action === 'save' ? 'تم حفظ الرسالة كمسودة' : 'تم جدولة الرسالة',
          recipientCount: uniqueUsers.length
        })
      }

    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ 
        error: 'خطأ في قاعدة البيانات' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error creating custom message:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
