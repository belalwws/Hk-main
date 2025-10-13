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

    // Get supervisor with assignment
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

    // Get permissions - Default to full access (like admin)
    // Only restrict if explicitly disabled by admin
    let permissions = {
      canApprove: true,
      canReject: true,
      canMessage: true,
      canViewDetails: true,
      canExportData: true
    }

    // If supervisor has specific assignment, check for explicit restrictions
    if (supervisor.supervisorAssignments.length > 0) {
      const assignment = supervisor.supervisorAssignments[0]
      // Only override if explicitly set to false
      permissions = {
        canApprove: assignment.canApprove !== false,
        canReject: assignment.canReject !== false,
        canMessage: assignment.canMessage !== false,
        canViewDetails: assignment.canViewDetails !== false,
        canExportData: assignment.canExportData !== false
      }
    }

    // Get notification preferences (stored in user preferences or separate table)
    // For now, return default values
    const notifications = {
      emailOnNewParticipant: true,
      emailOnTeamUpdate: true,
      emailOnProjectSubmission: true,
      dailyDigest: false
    }

    return NextResponse.json({
      hackathon: {
        id: hackathon.id,
        title: hackathon.title,
        status: hackathon.status
      },
      permissions,
      notifications
    })

  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "حدث خطأ في جلب الإعدادات" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
      where: { id: userId }
    })

    if (!supervisor || supervisor.role !== 'supervisor') {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 403 }
      )
    }

    // Supervisors have full access by default, no need to check assignment

    const body = await request.json()
    const { notifications } = body

    // In a real implementation, save notifications to database
    // For now, just return success
    // You could create a SupervisorPreferences table to store these

    return NextResponse.json({
      success: true,
      message: "تم حفظ الإعدادات بنجاح"
    })

  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "حدث خطأ في حفظ الإعدادات" },
      { status: 500 }
    )
  }
}
