import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { findUserById } from '@/lib/simple-db'

// GET /api/user/profile - Get current user profile
export async function GET(request: NextRequest) {
  console.log('🔍 [USER-PROFILE] Profile request received')
  
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      console.log('❌ [USER-PROFILE] No token found')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    console.log('🔍 [USER-PROFILE] Token found, verifying...')

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      console.log('❌ [USER-PROFILE] Invalid token')
      return NextResponse.json({ error: 'رمز المصادقة غير صالح' }, { status: 401 })
    }

    console.log('✅ [USER-PROFILE] Token verified for user:', payload.email)

    // Get user from database
    const user = await findUserById(payload.userId)

    if (!user) {
      console.log('❌ [USER-PROFILE] User not found in database')
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    console.log('✅ [USER-PROFILE] User found:', user.email)

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ [USER-PROFILE] User account is inactive')
      return NextResponse.json({ error: 'تم تعطيل حسابك من قبل الإدارة' }, { status: 403 })
    }

    // Return user profile with basic data
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
    console.error('❌ [USER-PROFILE] Error:', error)
    return NextResponse.json({ error: 'خطأ في جلب الملف الشخصي' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
