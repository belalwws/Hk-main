import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// GET /api/admin/messages/stats - Get messages statistics
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Mock statistics - in real implementation, these would come from database
    const stats = {
      totalAutoMessages: 8,
      activeAutoMessages: 7,
      totalCustomMessages: 4,
      totalEmailsSent: 2847
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching message stats:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
