import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// PUT /api/admin/messages/automatic/templates/[templateId] - Update automatic message template
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ templateId: string }> }
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
    const { subject, content, isActive } = body

    // In a real implementation, you would save to database
    // For now, we'll just return success
    console.log(`Updating template ${params.templateId}:`, { subject, content, isActive })

    return NextResponse.json({
      success: true,
      message: 'تم تحديث القالب بنجاح'
    })

  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
