import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// GET /api/admin/forms - Get all forms
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

    // Return empty forms list for now
    return NextResponse.json({
      forms: [],
      total: 0
    })

  } catch (error) {
    console.error('❌ Get forms error:', error)
    return NextResponse.json({ error: 'خطأ في جلب النماذج' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
