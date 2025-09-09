import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/verify-session - Verify user session and return user data
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Verifying user session...')
    
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      console.log('❌ No auth token found')
      return NextResponse.json({ error: 'No token found' }, { status: 401 })
    }

    console.log('🔑 Token found, verifying...')
    
    // Verify token
    const payload = await verifyToken(token)
    
    if (!payload || !payload.userId) {
      console.log('❌ Invalid token payload')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    console.log('✅ Token verified for user:', payload.userId)
    
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
