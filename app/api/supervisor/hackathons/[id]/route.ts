import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const hackathonId = params.id

    // الصلاحيات الافتراضية (كاملة)
    let permissions = {
      canManageParticipants: true,
      canApproveParticipants: true,
      canRejectParticipants: true,
      canManageTeams: true,
      canMoveMembers: true,
      canRemoveMembers: true,
      canViewReports: true,
      canExportData: true,
      canSendMessages: true
    }

    // التحقق من صلاحيات المشرف
    if (userRole === "supervisor") {
      const supervisor = await prisma.supervisor.findFirst({
        where: {
          userId: userId || '',
          OR: [
            { hackathonId: hackathonId },
            { hackathonId: null } // مشرف عام
          ],
          isActive: true
        }
      })

      if (!supervisor) {
        return NextResponse.json({
          error: "غير مصرح لك بالوصول لهذا الهاكاثون"
        }, { status: 403 })
      }

      // استخدام الصلاحيات من قاعدة البيانات إذا كانت موجودة
      if (supervisor.permissions && typeof supervisor.permissions === 'object') {
        permissions = {
          ...permissions,
          ...(supervisor.permissions as any)
        }
      }
    }

    // جلب بيانات الهاكاثون
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
                city: true
              }
            }
          }
        }
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: "الهاكاثون غير موجود" }, { status: 404 })
    }

    // حساب الإحصائيات
    const stats = {
      totalParticipants: hackathon.participants.length,
      pendingParticipants: hackathon.participants.filter((p: any) => p.status === 'pending').length,
      approvedParticipants: hackathon.participants.filter((p: any) => p.status === 'approved').length,
      rejectedParticipants: hackathon.participants.filter((p: any) => p.status === 'rejected').length
    }

    return NextResponse.json({
      hackathon: {
        ...hackathon,
        stats
      },
      permissions
    })
  } catch (error) {
    console.error('Error fetching hackathon:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب بيانات الهاكاثون' },
      { status: 500 }
    )
  }
}
