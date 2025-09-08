import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { HackathonStatus, ParticipantStatus } from '@prisma/client'

// GET /api/admin/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Lazy import prisma; if unavailable, return zeros
    let prisma: any
    try {
      prisma = (await import('@/lib/prisma')).prisma
    } catch (_) {
      prisma = null
    }

    if (!prisma) {
      return NextResponse.json({
        totalHackathons: 0,
        activeHackathons: 0,
        totalParticipants: 0,
        totalUsers: 0,
        totalTeams: 0,
        totalJudges: 0,
        recentHackathons: []
      })
    }

    // Get total hackathons count
    const totalHackathons = await prisma.hackathon.count()

    // Get active hackathons count
    const activeHackathons = await prisma.hackathon.count({
      where: { status: HackathonStatus.open as any }
    })

    // Get participants statistics
    const totalParticipants = await prisma.participant.count()
    const pendingParticipants = await prisma.participant.count({
      where: { status: ParticipantStatus.pending as any }
    })
    const approvedParticipants = await prisma.participant.count({
      where: { status: ParticipantStatus.approved as any }
    })
    const rejectedParticipants = await prisma.participant.count({
      where: { status: ParticipantStatus.rejected as any }
    })

    // Get users statistics
    const totalUsers = await prisma.user.count()

    // Get total teams count
    const totalTeams = await prisma.team.count()

    // Get total judges count
    const totalJudges = await prisma.judge.count()

    // Get recent hackathons (last 5)
    const recentHackathons = await prisma.hackathon.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            participants: true,
            teams: true
          }
        }
      }
    })

    // Transform recent hackathons data
    const transformedRecentHackathons = recentHackathons.map(hackathon => ({
      id: hackathon.id,
      title: hackathon.title,
      status: hackathon.status,
      participantCount: hackathon._count.participants,
      startDate: hackathon.startDate.toISOString()
    }))

    const dashboardStats = {
      totalHackathons,
      activeHackathons,
      totalParticipants,
      pendingParticipants,
      approvedParticipants,
      rejectedParticipants,
      totalUsers,
      totalTeams,
      totalJudges,
      recentHackathons: transformedRecentHackathons
    }

    return NextResponse.json(dashboardStats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
