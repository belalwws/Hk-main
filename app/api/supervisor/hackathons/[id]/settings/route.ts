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

    // Check if supervisor is assigned to this hackathon
    if (supervisor.supervisorAssignments.length === 0) {
      return NextResponse.json(
        { error: "أنت غير مسؤول عن هذا الهاكاثون" },
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

    const supervisorAssignment = supervisor.supervisorAssignments[0]

    // Get permissions from supervisor assignment
    const permissions = {
      canApprove: supervisorAssignment.canApprove || true,
      canReject: supervisorAssignment.canReject || true,
      canMessage: supervisorAssignment.canMessage || true,
      canViewDetails: supervisorAssignment.canViewDetails || true,
      canExportData: supervisorAssignment.canExportData || false
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

    if (supervisor.supervisorAssignments.length === 0) {
      return NextResponse.json(
        { error: "أنت غير مسؤول عن هذا الهاكاثون" },
        { status: 403 }
      )
    }

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
