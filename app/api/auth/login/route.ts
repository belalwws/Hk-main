import { type NextRequest, NextResponse } from "next/server"
import { generateToken } from "@/lib/auth"
import { comparePassword } from "@/lib/password"
import { validateRequest, loginSchema } from "@/lib/validation"
import { rateLimit } from "@/lib/rate-limit"
import { findUserByEmail } from "@/lib/simple-db"

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request, 5, 300000) // 5 attempts per 5 minutes
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "تم تجاوز عدد محاولات تسجيل الدخول المسموحة" }, { status: 429 })
  }

  try {
    const body = await request.json()
    console.log('🔍 Login attempt with data:', { email: body.email, hasPassword: !!body.password, passwordLength: body.password?.length })

    const validation = validateRequest(loginSchema, body)

    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error)
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { email, password } = validation.data

    // Development admin fallback (when DB is not available)
    const DEV_ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL || 'admin@hackathon.gov.sa'
    const DEV_ADMIN_PASSWORD = process.env.DEV_ADMIN_PASSWORD || 'admin123'
    if (email.toLowerCase() === DEV_ADMIN_EMAIL.toLowerCase() && password === DEV_ADMIN_PASSWORD) {
      const token = await generateToken({
        userId: 'dev-admin',
        email: DEV_ADMIN_EMAIL,
        role: 'admin',
        name: 'Dev Admin',
      })
      const response = NextResponse.json({
        token,
        user: { id: 'dev-admin', name: 'Dev Admin', email: DEV_ADMIN_EMAIL, role: 'admin', permissions: {}, activeHackathons: [] }
      })
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days to match JWT expiration
      })
      return response
    }

    // Find user by email
    const user = await findUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 })
    }

    const isValidPassword = await comparePassword(password, user.password || '')
    if (!isValidPassword) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 })
    }

    if (user && !user.isActive) {
      return NextResponse.json({ error: "تم تعطيل حسابك من قبل الإدارة" }, { status: 403 })
    }

    // Determine user role and permissions
    let role = (user ? user.role.toLowerCase() : 'participant')
    let permissions = {}
    let activeHackathons = []

    if (user && user.role === 'admin') {
      // Check if super admin or hackathon admin
      const isSuperAdmin = user.adminActions.some((admin: any) => admin.hackathonId === null)
      permissions = {
        isSuperAdmin,
        canManageHackathons: isSuperAdmin,
        canManageUsers: isSuperAdmin,
        hackathonIds: user.adminActions.map((admin: any) => admin.hackathonId).filter(Boolean)
      }
    } else if (user && user.role === 'judge') {
      activeHackathons = user.judgeAssignments
        .filter((judge: any) => judge.isActive && judge.hackathon.isActive)
        .map((judge: any) => ({
          id: judge.hackathon.id,
          title: judge.hackathon.title
        }))
    } else if (user && user.role === 'participant') {
      activeHackathons = user.participations
        .filter((participation: any) => participation.status === 'approved' && participation.hackathon.isActive)
        .map((participation: any) => ({
          id: participation.hackathon.id,
          title: participation.hackathon.title
        }))
    }

    const token = await generateToken({
      userId: user ? user.id : fileParticipant!.id,
      email: user ? user.email : fileParticipant!.email,
      role: role as "admin" | "judge" | "participant",
      name: user ? user.name : fileParticipant!.name,
    })

    const response = NextResponse.json({
      token,
      user: {
        id: user ? user.id : fileParticipant!.id,
        name: user ? user.name : fileParticipant!.name,
        email: user ? user.email : fileParticipant!.email,
        role: role,
        permissions,
        activeHackathons
      },
    })
    
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days to match JWT expiration
    })
    
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}
