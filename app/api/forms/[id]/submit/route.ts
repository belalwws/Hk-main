import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { formData, userId } = await request.json()

    // Check if form exists and is published
    const form = await prisma.form.findUnique({
      where: { id: params.id }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    if (form.status !== 'published') {
      return NextResponse.json({ error: 'Form is not available' }, { status: 400 })
    }

    // Create form response
    const response = await prisma.formResponse.create({
      data: {
        formId: params.id,
        userId: userId || null,
        responses: formData,
        submittedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      responseId: response.id 
    })
  } catch (error) {
    console.error('Error submitting form:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
