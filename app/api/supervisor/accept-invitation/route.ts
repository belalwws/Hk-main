import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { signToken } from "@/lib/auth"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password, confirmPassword } = body

    if (!token || !password || !confirmPassword) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "كلمات المرور غير متطابقة" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 })
    }

    // Find and validate invitation
    const invitation = await prisma.supervisorInvitation.findUnique({
      where: { token }
    })

    if (!invitation) {
      return NextResponse.json({ error: "رابط الدعوة غير صالح" }, { status: 400 })
    }

    if (invitation.status !== "pending") {
      return NextResponse.json({ error: "تم استخدام هذه الدعوة بالفعل" }, { status: 400 })
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "انتهت صلاحية رابط الدعوة" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "المستخدم موجود بالفعل" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and supervisor in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: invitation.name || "مشرف جديد",
          email: invitation.email,
          password: hashedPassword,
          role: "supervisor",
          isActive: true,
          emailVerified: true
        }
      })

      // Create supervisor record
      const supervisor = await tx.supervisor.create({
        data: {
          userId: user.id,
          hackathonId: invitation.hackathonId,
          permissions: invitation.permissions || {},
          department: invitation.department,
          isActive: true
        }
      })

      // Update invitation status
      await tx.supervisorInvitation.update({
        where: { id: invitation.id },
        data: {
          status: "accepted",
          acceptedAt: new Date()
        }
      })

      return { user, supervisor }
    })

    // Generate JWT token
    const authToken = await signToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role as "supervisor",
      name: result.user.name
    })

    // Set cookie
    const response = NextResponse.json({
      message: "تم قبول الدعوة بنجاح",
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      }
    })

    response.cookies.set("auth-token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response

  } catch (error) {
    console.error("Error accepting supervisor invitation:", error)
    return NextResponse.json({ error: "حدث خطأ في قبول الدعوة" }, { status: 500 })
  }
}

// Get invitation details by token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "رمز الدعوة مطلوب" }, { status: 400 })
    }

    const invitation = await prisma.supervisorInvitation.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        expiresAt: true,
        createdAt: true
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: "رابط الدعوة غير صالح" }, { status: 404 })
    }

    if (invitation.status !== "pending") {
      return NextResponse.json({ error: "تم استخدام هذه الدعوة بالفعل" }, { status: 400 })
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "انتهت صلاحية رابط الدعوة" }, { status: 400 })
    }

    return NextResponse.json({ invitation })

  } catch (error) {
    console.error("Error fetching invitation details:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب تفاصيل الدعوة" }, { status: 500 })
  }
}
