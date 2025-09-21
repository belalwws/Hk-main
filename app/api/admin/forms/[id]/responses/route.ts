import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// GET /api/admin/forms/[id]/responses - Get form responses
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params

    // Return empty responses for now
    return NextResponse.json({
      responses: [],
      total: 0,
      formId: id
    })

  } catch (error) {
    console.error('❌ Get form responses error:', error)
    return NextResponse.json({ error: 'خطأ في جلب الردود' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
