import { type NextRequest, NextResponse } from "next/server"
import { generateToken } from "@/lib/auth"
import { comparePassword } from "@/lib/password"
import { validateRequest, loginSchema } from "@/lib/validation"
import { rateLimit } from "@/lib/rate-limit"
import { getAllParticipants } from "@/lib/participants-storage"

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request, 5, 300000) // 5 attempts per 5 minutes
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "تم تجاوز عدد محاولات تسجيل الدخول المسموحة" }, { status: 429 })
  }

  try {
    const body = await request.json()
    const validation = validateRequest(loginSchema, body)

    if (!validation.success) {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 })
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
        maxAge: 60 * 60 * 24,
      })
      return response
    }

    // Find user by email (DB first) using lazy prisma import
    let user: any = null
    try {
      const { prisma } = await import("@/lib/prisma")
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          adminActions: { include: { hackathon: true } },
          judgeAssignments: { include: { hackathon: true } },
          participations: { include: { hackathon: true } }
        }
      })
    } catch (_) {
      user = null
    }

    // Fallback to file-based participant store if no DB user found
    let fileParticipant: ReturnType<typeof getAllParticipants>[number] | null = null
    if (!user) {
      try {
        const participants = getAllParticipants()
        const found = participants.find(p => p.email.toLowerCase() === email.toLowerCase())
        if (found) {
          fileParticipant = found
        }
      } catch (_) {}
    }

    if (!user && !fileParticipant) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 })
    }

    const isValidPassword = user
      ? await comparePassword(password, user.password_hash)
      : await comparePassword(password, fileParticipant!.passwordHash)
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
      const isSuperAdmin = user.adminActions.some(admin => admin.hackathonId === null)
      permissions = {
        isSuperAdmin,
        canManageHackathons: isSuperAdmin,
        canManageUsers: isSuperAdmin,
        hackathonIds: user.adminActions.map(admin => admin.hackathonId).filter(Boolean)
      }
    } else if (user && user.role === 'JUDGE') {
      activeHackathons = user.judgeAssignments
        .filter(judge => judge.isActive && judge.hackathon.isActive)
        .map(judge => ({
          id: judge.hackathon.id,
          title: judge.hackathon.title
        }))
    } else if (user && user.role === 'PARTICIPANT') {
      activeHackathons = user.participations
        .filter(participation => participation.status === 'APPROVED' && participation.hackathon.isActive)
        .map(participation => ({
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
      maxAge: 60 * 60 * 24,
    })
    
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}
