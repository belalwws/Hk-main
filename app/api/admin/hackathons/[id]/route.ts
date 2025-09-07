import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/admin/hackathons/[id] - Get specific hackathon
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const resolvedParams = await params
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: resolvedParams.id },
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
                nationality: true,
                preferredRole: true
              }
            }
          },
          orderBy: {
            registeredAt: 'desc'
          }
        },
        teams: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            participants: true,
            teams: true,
            judges: true
          }
        }
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Transform data for frontend
    const transformedHackathon = {
      id: hackathon.id,
      title: hackathon.title,
      description: hackathon.description,
      startDate: hackathon.startDate.toISOString(),
      endDate: hackathon.endDate.toISOString(),
      registrationDeadline: hackathon.registrationDeadline.toISOString(),
      maxParticipants: hackathon.maxParticipants,
      status: hackathon.status,
      prizes: hackathon.prizes,
      requirements: hackathon.requirements,
      categories: hackathon.categories,
      settings: hackathon.settings,
      createdAt: hackathon.createdAt.toISOString(),
      participants: hackathon.participants.map(p => ({
        id: p.id,
        userId: p.userId,
        user: p.user,
        teamId: p.teamId,
        teamName: p.teamName,
        projectTitle: p.projectTitle,
        projectDescription: p.projectDescription,
        githubRepo: p.githubRepo,
        teamRole: p.teamRole,
        status: p.status,
        registeredAt: p.registeredAt.toISOString(),
        approvedAt: p.approvedAt?.toISOString(),
        rejectedAt: p.rejectedAt?.toISOString()
      })),
      teams: hackathon.teams,
      stats: {
        totalParticipants: hackathon._count.participants,
        totalTeams: hackathon._count.teams,
        totalJudges: hackathon._count.judges,
        pendingParticipants: hackathon.participants.filter(p => p.status === 'PENDING').length,
        approvedParticipants: hackathon.participants.filter(p => p.status === 'APPROVED').length,
        rejectedParticipants: hackathon.participants.filter(p => p.status === 'REJECTED').length
      }
    }

    return NextResponse.json({ hackathon: transformedHackathon })

  } catch (error) {
    console.error('Error fetching hackathon details:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// PATCH /api/admin/hackathons/[id] - Update hackathon status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['DRAFT', 'OPEN', 'CLOSED', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ error: 'حالة غير صحيحة' }, { status: 400 })
    }

    const resolvedParams = await params
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Update hackathon status
    const updatedHackathon = await prisma.hackathon.update({
      where: { id: resolvedParams.id },
      data: { status }
    })

    return NextResponse.json({
      message: 'تم تحديث حالة الهاكاثون بنجاح',
      hackathon: updatedHackathon
    })

  } catch (error) {
    console.error('Error updating hackathon status:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// PUT /api/admin/hackathons/[id] - Update hackathon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      requirements,
      categories,
      startDate,
      endDate,
      registrationDeadline,
      maxParticipants,
      status,
      prizes,
      isActive,
      settings
    } = body

    // Validate required fields
    if (!title || !startDate || !endDate) {
      return NextResponse.json({ error: 'الحقول المطلوبة مفقودة' }, { status: 400 })
    }

    const resolvedParams = await params

    // Check if hackathon exists
    const existingHackathon = await prisma.hackathon.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingHackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Update hackathon
    const updatedHackathon = await prisma.hackathon.update({
      where: { id: resolvedParams.id },
      data: {
        title,
        description: description || '',
        requirements: requirements || [],
        categories: categories || [],
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : existingHackathon.registrationDeadline,
        maxParticipants: maxParticipants || existingHackathon.maxParticipants,
        status: status || existingHackathon.status,
        prizes: prizes || existingHackathon.prizes,
        isActive: isActive ?? existingHackathon.isActive,
        settings: settings || existingHackathon.settings
      },
      include: {
        _count: {
          select: {
            participants: true,
            teams: true,
            judges: true
          }
        }
      }
    })

    return NextResponse.json({
      id: updatedHackathon.id,
      title: updatedHackathon.title,
      description: updatedHackathon.description,
      startDate: updatedHackathon.startDate.toISOString(),
      endDate: updatedHackathon.endDate.toISOString(),
      isActive: updatedHackathon.isActive,
      participantCount: updatedHackathon._count.participants,
      teamCount: updatedHackathon._count.teams,
      judgeCount: updatedHackathon._count.judges
    })
  } catch (error) {
    console.error('Error updating hackathon:', error)
    return NextResponse.json({ error: 'خطأ في تحديث الهاكاثون' }, { status: 500 })
  }
}

// DELETE /api/admin/hackathons/[id] - Delete hackathon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const resolvedParams = await params

    // Check if hackathon exists
    const existingHackathon = await prisma.hackathon.findUnique({
      where: { id: resolvedParams.id },
      include: {
        _count: {
          select: {
            participants: true,
            teams: true,
            judges: true,
            scores: true
          }
        }
      }
    })

    if (!existingHackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Delete all related data first (foreign key constraints)
    const deletedCounts = {
      participants: 0,
      teams: 0,
      judges: 0,
      scores: 0
    }

    // Delete participants
    if (existingHackathon._count.participants > 0) {
      const deletedParticipants = await prisma.participant.deleteMany({
        where: { hackathonId: resolvedParams.id }
      })
      deletedCounts.participants = deletedParticipants.count
    }

    // Delete teams if they exist
    if (existingHackathon._count.teams > 0) {
      const deletedTeams = await prisma.team.deleteMany({
        where: { hackathonId: resolvedParams.id }
      })
      deletedCounts.teams = deletedTeams.count
    }

    // Delete judges if they exist
    if (existingHackathon._count.judges > 0) {
      const deletedJudges = await prisma.judge.deleteMany({
        where: { hackathonId: resolvedParams.id }
      })
      deletedCounts.judges = deletedJudges.count
    }

    // Delete scores if they exist
    if (existingHackathon._count.scores > 0) {
      const deletedScores = await prisma.score.deleteMany({
        where: { hackathonId: resolvedParams.id }
      })
      deletedCounts.scores = deletedScores.count
    }

    // Finally delete the hackathon
    await prisma.hackathon.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'تم حذف الهاكاثون بنجاح',
      deletedData: deletedCounts
    })
  } catch (error) {
    console.error('Error deleting hackathon:', error)
    return NextResponse.json({ error: 'خطأ في حذف الهاكاثون' }, { status: 500 })
  }
}
