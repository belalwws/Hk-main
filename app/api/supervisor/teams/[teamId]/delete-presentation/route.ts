import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const params = await context.params
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    // Get team
    const team = await prisma.team.findUnique({
      where: { id: params.teamId },
      include: {
        hackathon: true
      }
    })

    if (!team) {
      return NextResponse.json({ error: "الفريق غير موجود" }, { status: 404 })
    }

    // If supervisor, verify they have access to this hackathon
    if (userRole === "supervisor" && userId) {
      const supervisorAssignment = await prisma.supervisor.findFirst({
        where: {
          userId: userId,
          hackathonId: team.hackathonId,
          isActive: true
        }
      })

      if (!supervisorAssignment) {
        return NextResponse.json({ error: "غير مصرح بالوصول لهذا الهاكاثون" }, { status: 403 })
      }

      // Check permissions
      const permissions = supervisorAssignment.permissions as any
      if (!permissions?.canManageTeams) {
        return NextResponse.json({ error: "ليس لديك صلاحية إدارة الفرق" }, { status: 403 })
      }
    }

    if (!team.ideaFile) {
      return NextResponse.json({ error: "لا يوجد عرض تقديمي لحذفه" }, { status: 400 })
    }

    // Delete file from filesystem
    try {
      const filePath = join(process.cwd(), 'public', team.ideaFile)
      await unlink(filePath)
    } catch (error) {
      console.error('Error deleting file:', error)
      // Continue even if file deletion fails
    }

    // Update team in database
    await prisma.team.update({
      where: { id: params.teamId },
      data: {
        ideaFile: null,
        ideaTitle: null,
        ideaDescription: null
      }
    })

    return NextResponse.json({ message: 'تم حذف العرض التقديمي بنجاح' })

  } catch (error) {
    console.error('Error deleting presentation:', error)
    return NextResponse.json({ error: 'حدث خطأ في حذف العرض التقديمي' }, { status: 500 })
  }
}

