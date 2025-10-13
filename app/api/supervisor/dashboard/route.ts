import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    console.log('📊 Fetching supervisor dashboard data for user:', userId)

    // Get all supervisor assignments for this user
    const supervisorAssignments = await prisma.supervisor.findMany({
      where: { userId: userId || '', isActive: true },
      include: {
        hackathon: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            status: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            city: true
          }
        }
      }
    })

    // Get the primary supervisor record (first one or general supervisor)
    const supervisor = supervisorAssignments.find(s => s.hackathonId === null) || supervisorAssignments[0]

    if (!supervisor || supervisorAssignments.length === 0) {
      console.log('⚠️ No supervisor found for user:', userId)

      return NextResponse.json({
        stats: {
          totalParticipants: 0,
          approvedParticipants: 0,
          pendingParticipants: 0,
          rejectedParticipants: 0,
          totalTeams: 0,
          activeTeams: 0,
          completedProjects: 0
        },
        recentActivity: [],
        supervisor: {
          id: 'temp',
          name: 'مشرف',
          email: '',
          phone: null,
          city: null,
          department: null,
          hackathons: [],
          permissions: null,
          isProfileComplete: false
        },
        message: 'لم يتم تعيينك كمشرف على أي هاكاثون بعد'
      })
    }

    // Build where clause based on supervisor's hackathons
    const hackathonIds = supervisorAssignments
      .map(s => s.hackathonId)
      .filter(id => id !== null) as string[]

    const whereClause: any = {}
    if (hackathonIds.length > 0) {
      whereClause.hackathonId = { in: hackathonIds }
    }

    // Get participants statistics
    const [
      totalParticipants,
      approvedParticipants,
      pendingParticipants,
      rejectedParticipants
    ] = await Promise.all([
      prisma.participant.count({ where: whereClause }),
      prisma.participant.count({ where: { ...whereClause, status: 'approved' } }),
      prisma.participant.count({ where: { ...whereClause, status: 'pending' } }),
      prisma.participant.count({ where: { ...whereClause, status: 'rejected' } })
    ])

    // Get teams statistics
    const [totalTeams, activeTeams] = await Promise.all([
      prisma.team.count({ where: whereClause }),
      prisma.team.count({ where: { ...whereClause, status: 'active' } })
    ])

    // Get completed projects (teams with project submissions)
    const completedProjects = await prisma.team.count({
      where: {
        ...whereClause,
        submissionUrl: { not: null }
      }
    })

    // Get recent activity (last 10 participants)
    const recentParticipants = await prisma.participant.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Get recent teams
    const recentTeams = await prisma.team.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Build recent activity
    const recentActivity = [
      ...recentParticipants.map(p => ({
        id: p.id,
        type: 'participant',
        message: `مشارك جديد: ${p.user.name}`,
        timestamp: getRelativeTime(p.createdAt),
        status: p.status === 'approved' ? 'success' as const : 
                p.status === 'pending' ? 'warning' as const : 
                'error' as const
      })),
      ...recentTeams.map(t => ({
        id: t.id,
        type: 'team',
        message: `فريق جديد: ${t.name}`,
        timestamp: getRelativeTime(t.createdAt),
        status: 'info' as const
      }))
    ].sort((a, b) => {
      // Sort by timestamp (most recent first)
      return 0 // Already sorted by createdAt desc
    }).slice(0, 10)

    // Check if profile is complete
    const isProfileComplete = !!(
      supervisor.user.name &&
      supervisor.user.email &&
      supervisor.user.phone &&
      supervisor.user.city &&
      supervisor.department
    )

    return NextResponse.json({
      stats: {
        totalParticipants,
        approvedParticipants,
        pendingParticipants,
        rejectedParticipants,
        totalTeams,
        activeTeams,
        completedProjects
      },
      recentActivity,
      supervisor: {
        id: supervisor.id,
        name: supervisor.user.name,
        email: supervisor.user.email,
        phone: supervisor.user.phone,
        city: supervisor.user.city,
        department: supervisor.department,
        hackathons: supervisorAssignments.map(s => s.hackathon).filter(h => h !== null),
        hackathon: supervisor.hackathon, // Keep for backward compatibility
        permissions: supervisor.permissions,
        isProfileComplete,
        assignmentCount: supervisorAssignments.length,
        isGeneralSupervisor: supervisorAssignments.some(s => s.hackathonId === null)
      }
    })

  } catch (error) {
    console.error("Error fetching supervisor dashboard:", error)
    return NextResponse.json({ 
      error: "حدث خطأ في جلب بيانات لوحة التحكم",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'الآن'
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  if (diffDays < 7) return `منذ ${diffDays} يوم`
  return date.toLocaleDateString('ar-EG')
}

