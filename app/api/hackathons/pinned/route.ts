import { NextResponse } from 'next/server'
import { getPinnedHackathon } from '@/lib/simple-db'

// GET /api/hackathons/pinned - Get pinned hackathon for homepage
export async function GET() {
  try {
    const pinnedHackathon = await getPinnedHackathon()

    if (!pinnedHackathon) {
      return NextResponse.json({ hackathon: null })
    }

    return NextResponse.json({
      hackathon: {
        ...pinnedHackathon,
        participantCount: 0 // Will be calculated later
      }
    })

  } catch (error) {
    console.error('Error fetching pinned hackathon:', error)
    return NextResponse.json({ error: 'خطأ في جلب الهاكاثون المثبت' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
