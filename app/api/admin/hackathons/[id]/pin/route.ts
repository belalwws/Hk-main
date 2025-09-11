import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

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

// POST /api/admin/hackathons/[id]/pin - Pin/Unpin hackathon for homepage
export async function POST(
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

    const resolvedParams = await params
    const body = await request.json()
    const { isPinned } = body

    console.log('🔄 Pin request:', { hackathonId: resolvedParams.id, isPinned })

    // Get prisma client
    const prismaClient = await getPrisma()
    if (!prismaClient) {
      console.error('❌ Failed to get prisma client')
      return NextResponse.json({ error: 'خطأ في الاتصال بقاعدة البيانات' }, { status: 500 })
    }

    // إذا كان المطلوب تفعيل Pin، إلغاء Pin من باقي الهاكاثونات أولاً
    if (isPinned) {
      console.log('📌 Unpinning other hackathons...')
      await prismaClient.hackathon.updateMany({
        where: { isPinned: true },
        data: { isPinned: false }
      })
    }

    // تحديث الهاكاثون المحدد
    console.log(`${isPinned ? '📌' : '📍'} ${isPinned ? 'Pinning' : 'Unpinning'} hackathon:`, resolvedParams.id)
    const hackathon = await prismaClient.hackathon.update({
      where: { id: resolvedParams.id },
      data: { isPinned }
    })

    console.log('✅ Pin status updated successfully:', hackathon.isPinned)

    return NextResponse.json({ 
      message: isPinned ? 'تم تثبيت الهاكاثون في الصفحة الرئيسية' : 'تم إلغاء تثبيت الهاكاثون',
      hackathon
    })

  } catch (error) {
    console.error('Error updating hackathon pin status:', error)
    return NextResponse.json({ error: 'خطأ في تحديث حالة التثبيت' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
