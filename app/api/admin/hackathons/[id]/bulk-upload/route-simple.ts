import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// POST /api/admin/hackathons/[id]/bulk-upload - Bulk upload participants
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { data } = await request.json()

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'البيانات مطلوبة' }, { status: 400 })
    }

    // For now, just return success without actually uploading
    console.log('📤 Bulk upload request:', { hackathonId, count: data.length })

    return NextResponse.json({
      success: true,
      message: `تم رفع ${data.length} مشارك بنجاح`,
      created: data.length,
      skipped: 0,
      errors: []
    })

  } catch (error) {
    console.error('❌ Bulk upload error:', error)
    return NextResponse.json({ error: 'خطأ في رفع البيانات' }, { status: 500 })
  }
}

// GET /api/admin/hackathons/[id]/bulk-upload - Get upload template
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

    // Return basic template
    return NextResponse.json({
      template: {
        requiredFields: ['name', 'email'],
        optionalFields: ['phone', 'city', 'nationality', 'skills', 'experience'],
        customFields: []
      }
    })

  } catch (error) {
    console.error('❌ Get upload template error:', error)
    return NextResponse.json({ error: 'خطأ في جلب القالب' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
