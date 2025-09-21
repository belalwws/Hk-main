import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// POST /api/admin/emails/broadcast - Send broadcast emails
export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { subject, message, recipients } = await request.json()

    if (!subject || !message) {
      return NextResponse.json({ error: 'العنوان والرسالة مطلوبان' }, { status: 400 })
    }

    // For now, just return success without actually sending emails
    console.log('📧 Broadcast email request:', { subject, recipients })

    return NextResponse.json({
      success: true,
      message: 'تم إرسال الرسائل بنجاح',
      sent: 0,
      failed: 0
    })

  } catch (error) {
    console.error('❌ Broadcast email error:', error)
    return NextResponse.json({ error: 'خطأ في إرسال الرسائل' }, { status: 500 })
  }
}

// GET /api/admin/emails/broadcast - Get broadcast options
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Return empty lists for now
    return NextResponse.json({
      users: [],
      hackathons: []
    })

  } catch (error) {
    console.error('❌ Get broadcast options error:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
