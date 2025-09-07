import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'لا يوجد رمز مصادقة' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    
    if (!payload) {
      return NextResponse.json({ error: 'رمز المصادقة غير صالح' }, { status: 401 })
    }

    // Return user data if token is valid
    return NextResponse.json({
      user: {
        id: payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role
      }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json({ error: 'خطأ في التحقق من الجلسة' }, { status: 500 })
  }
}
