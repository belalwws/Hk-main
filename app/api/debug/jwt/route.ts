import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// GET /api/debug/jwt - Test JWT verification
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG-JWT] Testing JWT verification...')
    
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value
    console.log('🔍 [DEBUG-JWT] Token found:', token ? 'YES' : 'NO')
    
    if (!token) {
      return NextResponse.json({ 
        error: 'No token found in cookies',
        cookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value.substring(0, 20) + '...']))
      }, { status: 401 })
    }

    console.log('🔑 [DEBUG-JWT] Token length:', token.length)
    console.log('🔑 [DEBUG-JWT] Token first 20 chars:', token.substring(0, 20))

    // Test JWT verification
    try {
      const payload = await verifyToken(token)
      console.log('✅ [DEBUG-JWT] Token verification successful')
      
      return NextResponse.json({
        success: true,
        message: 'JWT verification successful',
        payload: {
          userId: payload?.userId,
          email: payload?.email,
          role: payload?.role,
          name: payload?.name
        },
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
        }
      })
    } catch (error) {
      console.error('❌ [DEBUG-JWT] Token verification failed:', error)
      return NextResponse.json({ 
        error: 'Token verification failed',
        details: error.message,
        stack: error.stack
      }, { status: 401 })
    }

  } catch (error) {
    console.error('❌ [DEBUG-JWT] General error:', error)
    return NextResponse.json({ 
      error: 'General error in JWT test',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
