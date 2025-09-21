import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getAllHackathons } from '@/lib/simple-db'

// GET /api/admin/hackathons - Get all hackathons for admin
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

    // Get all hackathons
    const hackathons = await getAllHackathons()

    const transformed = hackathons.map((h: any) => ({
      id: h.id,
      title: h.title,
      description: h.description ?? '',
      startDate: h.startDate,
      endDate: h.endDate,
      registrationDeadline: h.registrationDeadline,
      maxParticipants: h.maxParticipants,
      status: h.status,
      prizes: h.prizes,
      requirements: h.requirements ?? [],
      categories: h.categories ?? [],
      isPinned: h.isPinned,
      evaluationOpen: h.evaluationOpen,
      createdAt: h.createdAt,
      stats: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        teams: 0,
        judges: 0
      }
    }))

    return NextResponse.json({ hackathons: transformed })

  } catch (error) {
    console.error('Error fetching hackathons:', error)
    return NextResponse.json({ error: 'خطأ في جلب الهاكاثونات' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
