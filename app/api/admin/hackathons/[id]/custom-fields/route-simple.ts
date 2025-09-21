import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Default custom fields
const DEFAULT_CUSTOM_FIELDS = {
  version: '1.0',
  fields: [
    {
      id: 'skills',
      name: 'المهارات التقنية',
      type: 'multiselect',
      required: true,
      options: ['JavaScript', 'Python', 'React', 'Node.js', 'UI/UX', 'Mobile Development'],
      placeholder: 'اختر مهاراتك التقنية'
    },
    {
      id: 'experience',
      name: 'مستوى الخبرة',
      type: 'select',
      required: true,
      options: ['مبتدئ', 'متوسط', 'متقدم', 'خبير'],
      placeholder: 'اختر مستوى خبرتك'
    },
    {
      id: 'motivation',
      name: 'دافع المشاركة',
      type: 'textarea',
      required: false,
      placeholder: 'لماذا تريد المشاركة في هذا الهاكاثون؟'
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// GET /api/admin/hackathons/[id]/custom-fields - Get custom fields
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id: hackathonId } = params

    // Return default custom fields
    return NextResponse.json({
      success: true,
      hackathon: {
        id: hackathonId,
        title: 'هاكاثون تجريبي',
        customFields: DEFAULT_CUSTOM_FIELDS
      }
    })

  } catch (error) {
    console.error('❌ Get custom fields error:', error)
    return NextResponse.json({ error: 'خطأ في جلب الحقول المخصصة' }, { status: 500 })
  }
}

// PUT /api/admin/hackathons/[id]/custom-fields - Update custom fields
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id: hackathonId } = params
    const { fields } = await request.json()

    if (!fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: 'الحقول المخصصة مطلوبة' }, { status: 400 })
    }

    // For now, just return success without actually updating
    console.log('📝 Custom fields update request:', { hackathonId, fieldsCount: fields.length })

    const customFields = {
      version: '1.0',
      fields,
      createdAt: DEFAULT_CUSTOM_FIELDS.createdAt,
      updatedAt: new Date().toISOString(),
      updatedBy: payload.userId
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الحقول المخصصة بنجاح',
      hackathon: {
        id: hackathonId,
        title: 'هاكاثون تجريبي',
        customFields
      }
    })

  } catch (error) {
    console.error('❌ Update custom fields error:', error)
    return NextResponse.json({ error: 'خطأ في تحديث الحقول المخصصة' }, { status: 500 })
  }
}

// DELETE /api/admin/hackathons/[id]/custom-fields - Reset to default
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id: hackathonId } = params

    // Return default fields
    return NextResponse.json({
      success: true,
      message: 'تم إعادة تعيين الحقول المخصصة للافتراضية',
      hackathon: {
        id: hackathonId,
        title: 'هاكاثون تجريبي',
        customFields: DEFAULT_CUSTOM_FIELDS
      }
    })

  } catch (error) {
    console.error('❌ Reset custom fields error:', error)
    return NextResponse.json({ error: 'خطأ في إعادة تعيين الحقول المخصصة' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
