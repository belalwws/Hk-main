import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/hackathons/[id]/teams - Get all teams for a hackathon
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params

    const teams = await prisma.team.findMany({
      where: {
        hackathonId: hackathonId
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                preferredRole: true
              }
            }
          }
        }
      },
      orderBy: {
        teamNumber: 'asc'
      }
    })

    return NextResponse.json({
      teams: teams.map(team => ({
        id: team.id,
        name: team.name,
        teamNumber: team.teamNumber,
        projectName: team.ideaTitle,
        createdAt: team.createdAt,
        participants: team.participants.map(participant => ({
          id: participant.id,
          registeredAt: participant.registeredAt,
          user: {
            name: participant.user.name,
            email: participant.user.email,
            preferredRole: participant.user.preferredRole || 'مطور'
          }
        }))
      }))
    })

  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ error: 'خطأ في جلب الفرق' }, { status: 500 })
  }
}

// DELETE /api/admin/hackathons/[id]/teams - Delete all teams for a hackathon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params

    // First, remove team assignments from participants
    await prisma.participant.updateMany({
      where: {
        hackathonId: hackathonId,
        teamId: { not: null }
      },
      data: {
        teamId: null
      }
    })

    // Then delete all teams
    const deletedTeams = await prisma.team.deleteMany({
      where: {
        hackathonId: hackathonId
      }
    })

    return NextResponse.json({
      message: `تم حذف ${deletedTeams.count} فريق بنجاح`,
      deletedCount: deletedTeams.count
    })

  } catch (error) {
    console.error('Error deleting teams:', error)
    return NextResponse.json({ error: 'خطأ في حذف الفرق' }, { status: 500 })
  }
}
