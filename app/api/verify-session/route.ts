import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/verify-session - Verify user session and return user data
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [VERIFY-SESSION] Starting verification...')
    console.log('🔍 [VERIFY-SESSION] Request URL:', request.url)
    console.log('🔍 [VERIFY-SESSION] Request headers:', Object.fromEntries(request.headers.entries()))

    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value
    console.log('🔍 [VERIFY-SESSION] All cookies:', Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value.substring(0, 20) + '...'])))

    if (!token) {
      console.log('❌ [VERIFY-SESSION] No auth token found in cookies')
      return NextResponse.json({ error: 'No token found' }, { status: 401 })
    }

    console.log('🔑 [VERIFY-SESSION] Token found, length:', token.length, 'first 20 chars:', token.substring(0, 20))

    // Verify token
    const payload = await verifyToken(token)

    if (!payload || !payload.userId) {
      console.log('❌ Invalid token payload:', payload)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    console.log('✅ Token verified for user:', payload.userId, 'role:', payload.role)
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        phone: true,
        university: true,
        major: true,
        graduationYear: true,
        city: true,
        nationality: true,
        skills: true,
        experience: true,
        preferredRole: true,
        profileImage: true,
        createdAt: true
      }
    })

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.isActive) {
      console.log('❌ User account is inactive')
      return NextResponse.json({ error: 'Account inactive' }, { status: 403 })
    }

    console.log('✅ User session verified successfully:', user.email)
    
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        phone: user.phone,
        university: user.university,
        major: user.major,
        graduationYear: user.graduationYear,
        city: user.city,
        nationality: user.nationality,
        skills: user.skills,
        experience: user.experience,
        preferredRole: user.preferredRole,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      }
    })

  } catch (error) {
    console.error('❌ Session verification failed:', error)
    return NextResponse.json({ 
      error: 'Session verification failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
