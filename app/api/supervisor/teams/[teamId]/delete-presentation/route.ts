import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { deleteFromCloudinary } from '@/lib/cloudinary'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const params = await context.params
    
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 403 })
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
    if (payload.role === 'supervisor') {
      const supervisorAssignment = await prisma.supervisor.findFirst({
        where: {
          userId: payload.userId,
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

    // Delete file from Cloudinary if it's a Cloudinary URL
    if (team.ideaFile.includes('cloudinary.com')) {
      try {
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.pdf
        const urlParts = team.ideaFile.split('/')
        const fileWithExt = urlParts[urlParts.length - 1]
        const publicId = `presentations/${fileWithExt.split('.')[0]}`
        
        await deleteFromCloudinary(publicId, 'raw')
        console.log('✅ Deleted from Cloudinary:', publicId)
      } catch (error) {
        console.error('⚠️ Error deleting from Cloudinary:', error)
        // Continue even if Cloudinary deletion fails
      }
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

