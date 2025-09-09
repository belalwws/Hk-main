import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/forms - Get all forms
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching forms...')

    const forms = await prisma.form.findMany({
      include: {
        _count: {
          select: {
            responses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('✅ Forms fetched successfully:', forms.length)

    return NextResponse.json({
      forms,
      total: forms.length
    })

  } catch (error) {
    console.error('❌ Error fetching forms:', error)
    return NextResponse.json(
      { error: 'فشل في جلب النماذج' },
      { status: 500 }
    )
  }
}

// POST /api/admin/forms - Create new form
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Creating new form...')

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

    console.log('📝 Creating form with data:', { title, fieldsCount: fields.length, status })

    const form = await prisma.form.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        fields: fields,
        status: status || 'draft',
        isPublic: isPublic !== false,
        createdBy: userId
      },
      include: {
        _count: {
          select: {
            responses: true
          }
        }
      }
    })

    console.log('✅ Form created successfully:', form.id)

    return NextResponse.json({
      form,
      message: 'تم إنشاء النموذج بنجاح'
    })

  } catch (error) {
    console.error('❌ Error creating form:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء النموذج' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
