import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 403 }
      )
    }

    // Check supervisor permissions
    if (userRole === "supervisor") {
      const supervisor = await prisma.supervisor.findFirst({
        where: {
          userId: userId!,
          OR: [
            { hackathonId: params.id },
            { hackathonId: null } // General supervisor
          ],
          isActive: true
        }
      })

      if (!supervisor) {
        return NextResponse.json(
          { error: "لست مشرفاً على هذا الهاكاثون" },
          { status: 403 }
        )
      }

      // Check permissions
      const permissions = supervisor.permissions as any
      if (permissions && permissions.canManageTeams === false) {
        return NextResponse.json(
          { error: "ليس لديك صلاحية عرض الفرق" },
          { status: 403 }
        )
      }
    }

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
                phone: true,
                city: true,
                nationality: true
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
        participantId: participant.id,
        user: {
          city: participant.user.city,
          nationality: participant.user.nationality
        }
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

// POST /api/supervisor/hackathons/[id]/teams - Create a new team
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 403 }
      )
    }

    // Check supervisor permissions
    if (userRole === "supervisor") {
      const supervisor = await prisma.supervisor.findFirst({
        where: {
          userId: userId!,
          OR: [
            { hackathonId: params.id },
            { hackathonId: null }
          ],
          isActive: true
        }
      })

      if (!supervisor) {
        return NextResponse.json(
          { error: "لست مشرفاً على هذا الهاكاثون" },
          { status: 403 }
        )
      }

      const permissions = supervisor.permissions as any
      if (permissions && permissions.canManageTeams === false) {
        return NextResponse.json(
          { error: "ليس لديك صلاحية إدارة الفرق" },
          { status: 403 }
        )
      }
    }

    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "اسم الفريق مطلوب" },
        { status: 400 }
      )
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        hackathonId: params.id,
        status: 'active'
      }
    })

    return NextResponse.json({
      message: `تم إنشاء ${team.name} بنجاح`,
      team
    })

  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء الفريق" },
      { status: 500 }
    )
  }
}
