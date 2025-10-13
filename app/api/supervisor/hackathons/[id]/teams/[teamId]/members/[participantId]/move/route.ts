import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/supervisor/hackathons/[id]/teams/[teamId]/members/[participantId]/move - Move member to another team
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; teamId: string; participantId: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId, teamId: sourceTeamId, participantId } = params
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    // Verify supervisor is assigned to this hackathon
    if (userRole === "supervisor") {
      const supervisor = await prisma.supervisor.findFirst({
        where: {
          userId: userId!,
          hackathonId: hackathonId,
          isActive: true
        }
      })

      if (!supervisor) {
        return NextResponse.json({ 
          error: "غير مصرح - لست مشرفاً على هذا الهاكاثون" 
        }, { status: 403 })
      }

      // Check permissions
      const permissions = supervisor.permissions as any
      if (permissions && permissions.canManageTeams === false) {
        return NextResponse.json({ 
          error: "ليس لديك صلاحية إدارة الفرق" 
        }, { status: 403 })
      }
    }

    const { targetTeamId } = await request.json()

    if (!targetTeamId) {
      return NextResponse.json({ error: 'معرف الفريق المستهدف مطلوب' }, { status: 400 })
    }

    // Check if participant exists and is in the source team
    const participant = await prisma.participant.findFirst({
      where: {
        id: participantId,
        hackathonId: hackathonId,
        teamId: sourceTeamId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'العضو غير موجود في الفريق المصدر' }, { status: 404 })
    }

    // Check if target team exists
    const targetTeam = await prisma.team.findFirst({
      where: {
        id: targetTeamId,
        hackathonId: hackathonId
      }
    })

    if (!targetTeam) {
      return NextResponse.json({ error: 'الفريق المستهدف غير موجود' }, { status: 404 })
    }

    // Get source team info
    const sourceTeam = await prisma.team.findUnique({
      where: { id: sourceTeamId }
    })

    // Move participant to target team
    await prisma.participant.update({
      where: {
        id: participantId
      },
      data: {
        teamId: targetTeamId
      }
    })

    return NextResponse.json({
      message: `تم نقل ${participant.user.name} من ${sourceTeam?.name} إلى ${targetTeam.name} بنجاح`,
      movedMember: {
        name: participant.user.name,
        email: participant.user.email,
        fromTeam: sourceTeam?.name,
        toTeam: targetTeam.name
      }
    })

  } catch (error) {
    console.error('Error moving member between teams:', error)
    return NextResponse.json({ error: 'خطأ في نقل العضو بين الفرق' }, { status: 500 })
  }
}

