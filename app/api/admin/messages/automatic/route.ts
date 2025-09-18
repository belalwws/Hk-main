import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/messages/automatic - Get automatic messages
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Default automatic message templates
    const defaultTemplates = [
      {
        id: 'user_registration',
        type: 'user_registration',
        name: 'تسجيل مستخدم جديد',
        subject: 'مرحباً بك في منصة الهاكاثونات',
        isActive: true,
        lastSent: new Date().toISOString(),
        totalSent: 156
      },
      {
        id: 'hackathon_registration',
        type: 'hackathon_registration',
        name: 'تسجيل في هاكاثون',
        subject: 'تم تسجيلك في الهاكاثون بنجاح',
        isActive: true,
        lastSent: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        totalSent: 89
      },
      {
        id: 'registration_approved',
        type: 'registration_approved',
        name: 'قبول المشاركة',
        subject: 'تم قبول مشاركتك في الهاكاثون',
        isActive: true,
        lastSent: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        totalSent: 67
      },
      {
        id: 'registration_rejected',
        type: 'registration_rejected',
        name: 'رفض المشاركة',
        subject: 'نأسف، لم يتم قبول مشاركتك',
        isActive: false,
        lastSent: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        totalSent: 12
      },
      {
        id: 'team_formation',
        type: 'team_formation',
        name: 'تكوين الفرق',
        subject: 'تم تكوين فريقك للهاكاثون',
        isActive: true,
        lastSent: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        totalSent: 45
      },
      {
        id: 'evaluation_start',
        type: 'evaluation_start',
        name: 'بداية التقييم',
        subject: 'بدء مرحلة التقييم',
        isActive: true,
        lastSent: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalSent: 23
      },
      {
        id: 'certificate_ready',
        type: 'certificate_ready',
        name: 'الشهادة جاهزة',
        subject: 'شهادة المشاركة جاهزة للتحميل',
        isActive: true,
        lastSent: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        totalSent: 78
      },
      {
        id: 'password_sent',
        type: 'password_sent',
        name: 'إرسال كلمة المرور',
        subject: 'كلمة المرور الخاصة بك',
        isActive: true,
        lastSent: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        totalSent: 34
      }
    ]

    return NextResponse.json({
      messages: defaultTemplates
    })

  } catch (error) {
    console.error('Error fetching automatic messages:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
