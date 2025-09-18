import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// PUT /api/admin/messages/automatic/[messageId]/toggle - Toggle automatic message
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ messageId: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { isActive } = body

    // In a real implementation, you would save to database
    console.log(`Toggling message ${params.messageId} to ${isActive ? 'active' : 'inactive'}`)

    return NextResponse.json({
      success: true,
      message: `تم ${isActive ? 'تفعيل' : 'إلغاء'} الرسالة التلقائية`
    })

  } catch (error) {
    console.error('Error toggling message:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
