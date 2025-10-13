import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH /api/supervisor/participants/[id]/status - Update participant status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: participantId } = await params
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const body = await request.json()
    const { status, feedback } = body

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 })
    }

    // Get participant to verify hackathon
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        hackathon: { select: { id: true } }
      }
    })

    if (!participant) {
      return NextResponse.json({ error: "المشارك غير موجود" }, { status: 404 })
    }

    // Verify supervisor is assigned to this hackathon
    if (userRole === "supervisor") {
      const assignment = await prisma.supervisor.findFirst({
        where: {
          userId: userId!,
          hackathonId: participant.hackathon.id,
          isActive: true
        }
      })

      if (!assignment) {
        return NextResponse.json({ error: "غير مصرح - لست مشرفاً على هذا الهاكاثون" }, { status: 403 })
      }

      // Check permissions
      const permissions = assignment.permissions as any
      if (permissions) {
        if (!permissions.canManageParticipants) {
          return NextResponse.json({ error: "ليس لديك صلاحية إدارة المشاركين" }, { status: 403 })
        }

        if (status === 'approved' && permissions.canApproveParticipants === false) {
          return NextResponse.json({ error: "ليس لديك صلاحية قبول المشاركين" }, { status: 403 })
        }

        if (status === 'rejected' && permissions.canRejectParticipants === false) {
          return NextResponse.json({ error: "ليس لديك صلاحية رفض المشاركين" }, { status: 403 })
        }
      }
    }

    // Update participant status
    const updatedParticipant = await prisma.participant.update({
      where: { id: participantId },
      data: {
        status: status as any,
        feedback: feedback || null,
        updatedAt: new Date()
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

    return NextResponse.json({
      message: "تم تحديث حالة المشارك بنجاح",
      participant: updatedParticipant
    })

  } catch (error) {
    console.error("Error updating participant status:", error)
    return NextResponse.json({ 
      error: "حدث خطأ في تحديث حالة المشارك" 
    }, { status: 500 })
  }
}
