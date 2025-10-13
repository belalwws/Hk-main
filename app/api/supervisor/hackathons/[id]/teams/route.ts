import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      )
    }

    const session = JSON.parse(sessionCookie.value)
    const userId = session.userId

    // Get supervisor
    const supervisor = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        supervisorAssignments: {
          where: {
            hackathonId: params.id
          }
        }
      }
    })

    if (!supervisor || supervisor.role !== 'supervisor') {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 403 }
      )
    }

    // Check permissions - if supervisor is assigned, check if permissions are disabled
    // Otherwise, grant full access by default (like admin)
    if (supervisor.supervisorAssignments.length > 0) {
      const assignment = supervisor.supervisorAssignments[0]
      const permissions = assignment.permissions as any
      // Check if explicitly disabled
      if (permissions && permissions.canManageTeams === false) {
        return NextResponse.json(
          { error: "ليس لديك صلاحية عرض الفرق" },
          { status: 403 }
        )
      }
    }
    // If not assigned, still allow access (full permissions by default)

    // Get hackathon
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id }
    })

    if (!hackathon) {
      return NextResponse.json(
        { error: "الهاكاثون غير موجود" },
        { status: 404 }
      )
    }

    // Get teams with members
    const teams = await prisma.team.findMany({
      where: {
        hackathonId: params.id
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format teams data
    const formattedTeams = teams.map((team: any) => ({
      id: team.id,
      name: team.name,
      status: team.status,
      submissionUrl: team.submissionUrl,
      presentationUrl: team.presentationUrl,
      demoUrl: team.demoUrl,
      githubUrl: team.githubUrl,
      createdAt: team.createdAt,
      members: team.participants.map((participant: any) => ({
        id: participant.user.id,
        name: participant.user.name,
        email: participant.user.email,
        phone: participant.user.phone,
        participantId: participant.id
      }))
    }))

    return NextResponse.json({
      teams: formattedTeams,
      hackathon: {
        id: hackathon.id,
        title: hackathon.title,
        status: hackathon.status
      }
    })

  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json(
      { error: "حدث خطأ في جلب الفرق" },
      { status: 500 }
    )
  }
}
