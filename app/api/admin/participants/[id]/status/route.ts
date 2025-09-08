import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const statusUpdateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'])
})

// PUT /api/admin/participants/[id]/status - Update participant status
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
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
    const validation = statusUpdateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'بيانات غير صحيحة',
        details: validation.error.errors 
      }, { status: 400 })
    }

    const { status } = validation.data

    // Check if participant exists
    const participant = await prisma.participant.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        hackathon: true
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'المشارك غير موجود' }, { status: 404 })
    }

    // Update participant status
    const updatedParticipant = await prisma.participant.update({
      where: { id: params.id },
      data: { status }
    })

    // TODO: Send email notification to participant about status change
    // if (status === 'approved') {
    //   // Send approval email
    // } else if (status === 'rejected') {
    //   // Send rejection email
    // }

    return NextResponse.json({
      message: `تم ${status === 'approved' ? 'قبول' : status === 'rejected' ? 'رفض' : 'تحديث'} المشارك بنجاح`,
      participant: {
        id: updatedParticipant.id,
        status: updatedParticipant.status
      }
    })

  } catch (error) {
    console.error('Error updating participant status:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
