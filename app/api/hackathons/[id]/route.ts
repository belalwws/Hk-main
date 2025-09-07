import { NextRequest, NextResponse } from 'next/server'

// Lazy import prisma to avoid build-time errors
let prisma: any = null
async function getPrisma() {
  if (!prisma) {
    try {
      const { prisma: prismaClient } = await import('@/lib/prisma')
      prisma = prismaClient
    } catch (error) {
      console.error('Failed to import prisma:', error)
      return null
    }
  }
  return prisma
}

// GET /api/hackathons/[id] - Get hackathon details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'قاعدة البيانات غير متاحة' }, { status: 500 })
    }

    const resolvedParams = await params
    const hackathon = await prismaClient.hackathon.findUnique({
      where: { id: resolvedParams.id },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Format the response
    const response = {
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
      participantCount: hackathon._count.participants,
      createdAt: hackathon.createdAt.toISOString()
    }

    return NextResponse.json({ hackathon: response })

  } catch (error) {
    console.error('Error fetching hackathon:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
