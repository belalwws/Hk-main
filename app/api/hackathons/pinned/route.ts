import { NextResponse } from 'next/server'

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

// GET /api/hackathons/pinned - Get pinned hackathon for homepage
export async function GET() {
  try {
    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'تعذر تهيئة قاعدة البيانات' }, { status: 500 })
    }

    const pinnedHackathon = await prismaClient.hackathon.findFirst({
      where: { isPinned: true },
      include: {
        _count: {
          select: {
            participants: true
          }
        }
      }
    })

    if (!pinnedHackathon) {
      return NextResponse.json({ hackathon: null })
    }

    return NextResponse.json({ 
      hackathon: {
        ...pinnedHackathon,
        participantCount: pinnedHackathon._count.participants
      }
    })

  } catch (error) {
    console.error('Error fetching pinned hackathon:', error)
    return NextResponse.json({ error: 'خطأ في جلب الهاكاثون المثبت' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
