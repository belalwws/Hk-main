import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// GET /api/admin/hackathons/[id]/email-templates - Get email templates
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

    // Return empty templates for now
    return NextResponse.json({
      success: true,
      hackathon: {
        id: hackathonId,
        title: 'هاكاثون تجريبي',
        emailTemplates: {
          templates: {},
          version: '1.0'
        }
      }
    })

  } catch (error) {
    console.error('❌ Get email templates error:', error)
    return NextResponse.json({ error: 'خطأ في جلب قوالب الإيميلات' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
