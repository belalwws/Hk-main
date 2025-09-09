import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/forms/[id] - Get specific form
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Fetching form:', params.id)

    const form = await prisma.form.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            responses: true
          }
        }
      }
    })

    if (!form) {
      return NextResponse.json(
        { error: 'النموذج غير موجود' },
        { status: 404 }
      )
    }

    console.log('✅ Form fetched successfully:', form.title)

    return NextResponse.json({ form })

  } catch (error) {
    console.error('❌ Error fetching form:', error)
    return NextResponse.json(
      { error: 'فشل في جلب النموذج' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/forms/[id] - Update form
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Updating form:', params.id)

    // Get user from headers (set by middleware)
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')

    if (!userId || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, fields, status, isPublic } = body

    // Check if form exists
    const existingForm = await prisma.form.findUnique({
      where: { id: params.id }
    })

    if (!existingForm) {
      return NextResponse.json(
        { error: 'النموذج غير موجود' },
        { status: 404 }
      )
    }

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'عنوان النموذج مطلوب' },
        { status: 400 }
      )
    }

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json(
        { error: 'يجب إضافة حقل واحد على الأقل' },
        { status: 400 }
      )
    }

    // Validate fields
    for (const field of fields) {
      if (!field.label || !field.label.trim()) {
        return NextResponse.json(
          { error: 'جميع الحقول يجب أن تحتوي على تسمية' },
          { status: 400 }
        )
      }

      if (['select', 'radio', 'checkbox'].includes(field.type)) {
        if (!field.options || !Array.isArray(field.options) || field.options.length === 0) {
          return NextResponse.json(
            { error: `الحقل "${field.label}" يحتاج إلى خيارات` },
            { status: 400 }
          )
        }
      }
    }

    console.log('📝 Updating form with data:', { title, fieldsCount: fields.length, status })

    const form = await prisma.form.update({
      where: { id: params.id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        fields: fields,
        status: status || existingForm.status,
        isPublic: isPublic !== undefined ? isPublic : existingForm.isPublic
      },
      include: {
        _count: {
          select: {
            responses: true
          }
        }
      }
    })

    console.log('✅ Form updated successfully:', form.id)

    return NextResponse.json({
      form,
      message: 'تم تحديث النموذج بنجاح'
    })

  } catch (error) {
    console.error('❌ Error updating form:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث النموذج' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/forms/[id] - Delete form
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Deleting form:', params.id)

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
    const existingForm = await prisma.form.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            responses: true
          }
        }
      }
    })

    if (!existingForm) {
      return NextResponse.json(
        { error: 'النموذج غير موجود' },
        { status: 404 }
      )
    }

    console.log('🗑️ Deleting form and responses:', {
      formId: params.id,
      responsesCount: existingForm._count.responses
    })

    // Delete form (responses will be deleted automatically due to cascade)
    await prisma.form.delete({
      where: { id: params.id }
    })

    console.log('✅ Form deleted successfully')

    return NextResponse.json({
      message: 'تم حذف النموذج بنجاح'
    })

  } catch (error) {
    console.error('❌ Error deleting form:', error)
    return NextResponse.json(
      { error: 'فشل في حذف النموذج' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
