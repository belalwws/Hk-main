import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { findUserById } from '@/lib/simple-db'

// GET /api/auth/session - Verify user session and return user data
export async function GET(request: NextRequest) {
  console.log('🔍 [AUTH-SESSION] Session verification requested')
  
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      console.log('❌ [AUTH-SESSION] No token found in cookies')
      return NextResponse.json({ error: 'لا يوجد رمز مصادقة' }, { status: 401 })
    }

    console.log('🔍 [AUTH-SESSION] Token found, verifying...')
    
    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      console.log('❌ [AUTH-SESSION] Token verification failed')
      return NextResponse.json({ error: 'رمز المصادقة غير صالح' }, { status: 401 })
    }

    console.log('✅ [AUTH-SESSION] Token verified for user:', payload.email)

    // Get user from database
    const user = await findUserById(payload.userId)
    
    if (!user) {
      console.log('❌ [AUTH-SESSION] User not found in database')
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    console.log('✅ [AUTH-SESSION] User found:', user.email)

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ [AUTH-SESSION] User account is inactive')
      return NextResponse.json({ error: 'تم تعطيل حسابك من قبل الإدارة' }, { status: 403 })
    }

    // Return user data
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        phone: user.phone,
        city: user.city,
        nationality: user.nationality,
        skills: user.skills,
        experience: user.experience,
        preferredRole: user.preferredRole,
        createdAt: user.createdAt,
        // Basic empty arrays for now
        participations: [],
        teams: [],
        judgeAssignments: []
      }
    })

  } catch (error) {
    console.error('❌ [AUTH-SESSION] Error:', error)
    return NextResponse.json({ error: 'خطأ في التحقق من الجلسة' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
