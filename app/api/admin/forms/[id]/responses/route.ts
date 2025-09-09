import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/forms/[id]/responses - Get form responses
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Fetching responses for form:', params.id)

    // Get user from headers (set by middleware)
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')

    if (!userId || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 403 }
      )
    }

    // Check if form exists
    const form = await prisma.form.findUnique({
      where: { id: params.id }
    })

    if (!form) {
      return NextResponse.json(
        { error: 'النموذج غير موجود' },
        { status: 404 }
      )
    }

    // Fetch responses
    const responses = await prisma.formResponse.findMany({
      where: { formId: params.id },
      orderBy: { submittedAt: 'desc' }
    })

    console.log('✅ Responses fetched successfully:', responses.length)

    return NextResponse.json({
      responses,
      total: responses.length
    })

  } catch (error) {
    console.error('❌ Error fetching responses:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الردود' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
