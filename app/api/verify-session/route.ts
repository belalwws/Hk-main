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

      // Clear the invalid token cookie
      const response = NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      response.cookies.set("auth-token", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
      })
      return response
    }

    console.log('✅ Token verified for user:', payload.userId, 'role:', payload.role)
    
    // Get prisma client
    console.log('🔍 [VERIFY-SESSION] Using direct prisma import')

    // Get user from database
    let user = null
    try {
      user = await prisma.user.findUnique({
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
      console.log('🔍 [VERIFY-SESSION] Database query result:', user ? 'User found' : 'User not found')
    } catch (dbError) {
      console.error('❌ [VERIFY-SESSION] Database query failed:', dbError)
      // Continue without database user - might be dev admin or file-based user
      user = null
    }

    // Handle special cases (dev admin, file-based users)
    if (!user) {
      console.log('🔍 [VERIFY-SESSION] User not found in database, checking special cases...')

      // Check if this is dev admin
      const DEV_ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL || 'admin@hackathon.gov.sa'
      if (payload.userId === 'dev-admin' && payload.email === DEV_ADMIN_EMAIL) {
        console.log('✅ [VERIFY-SESSION] Dev admin session verified')
        return NextResponse.json({
          user: {
            id: 'dev-admin',
            name: 'Dev Admin',
            email: DEV_ADMIN_EMAIL,
            role: 'admin',
            isActive: true,
            phone: null,
            university: null,
            major: null,
            graduationYear: null,
            city: null,
            nationality: null,
            skills: null,
            experience: null,
            preferredRole: null,
            profileImage: null,
            createdAt: new Date().toISOString()
          }
        })
      }

      // File-based storage removed - using database only

      console.log('❌ [VERIFY-SESSION] User not found in any storage')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.isActive) {
      console.log('❌ [VERIFY-SESSION] User account is inactive')
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
    console.error('❌ [VERIFY-SESSION] Session verification failed:', error)
    console.error('❌ [VERIFY-SESSION] Error stack:', error.stack)
    console.error('❌ [VERIFY-SESSION] Error type:', typeof error)
    console.error('❌ [VERIFY-SESSION] Error constructor:', error.constructor.name)
    
    return NextResponse.json({ 
      error: 'Session verification failed',
      details: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      type: typeof error,
      constructor: error.constructor.name
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
