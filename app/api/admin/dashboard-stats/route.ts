import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/dashboard-stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // Get participants from database
    const participants = await prisma.participant.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        preferredRole: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate statistics
    const totalParticipants = participants.length
    const pendingParticipants = participants.filter(p => p.status === 'pending').length
    const approvedParticipants = participants.filter(p => p.status === 'approved').length
    const rejectedParticipants = participants.filter(p => p.status === 'rejected').length

    // Get recent participants (last 5)
    const recentParticipants = participants
      .slice(0, 5)
      .map(participant => ({
        id: participant.id,
        name: participant.name,
        email: participant.email,
        status: participant.status,
        registeredAt: participant.createdAt,
        preferredRole: participant.preferredRole
      }))

    const stats = {
      totalParticipants,
      pendingParticipants,
      approvedParticipants,
      rejectedParticipants,
      recentParticipants
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
