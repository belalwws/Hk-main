import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// GET /api/admin/judges - Get all judges
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    console.log('📋 Fetching all judges...')

    const judges = await prisma.judge.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true
          }
        },
        hackathon: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    })

    console.log(`✅ Found ${judges.length} judges`)

    return NextResponse.json({
      judges,
      total: judges.length,
      active: judges.filter(j => j.isActive).length,
      inactive: judges.filter(j => !j.isActive).length
    })

  } catch (error) {
    console.error('❌ Error fetching judges:', error)
    return NextResponse.json({ error: 'خطأ في جلب المحكمين' }, { status: 500 })
  }
}

// POST /api/admin/judges - Create new judge
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, password, hackathonId } = body

    console.log('🔨 Creating new judge:', { name, email, hackathonId })

    // Validate required fields
    if (!name || !email || !password || !hackathonId) {
      return NextResponse.json({
        error: 'الاسم والإيميل وكلمة المرور والهاكاثون مطلوبة'
      }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({
        error: 'هذا الإيميل مستخدم بالفعل'
      }, { status: 400 })
    }

    // Check if hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json({
        error: 'الهاكاثون غير موجود'
      }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user and judge in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password_hash: passwordHash,
          phone: phone || null,
          role: 'JUDGE'
        }
      })

      // Create judge assignment
      const judge = await tx.judge.create({
        data: {
          userId: user.id,
          hackathonId,
          isActive: true
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true
            }
          },
          hackathon: {
            select: {
              id: true,
              title: true
            }
          }
        }
      })

      return { user, judge }
    })

    console.log('✅ Judge created successfully:', result.judge.id)

    return NextResponse.json({
      message: 'تم إنشاء المحكم بنجاح',
      judge: result.judge,
      credentials: {
        email,
        password // Return for admin to share with judge
      }
    })

  } catch (error) {
    console.error('❌ Error creating judge:', error)
    return NextResponse.json({ error: 'خطأ في إنشاء المحكم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'