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

    // Check if Judge table exists by trying a simple query first
    let judges = []
    try {
      judges = await prisma.judge.findMany({
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
          },
          _count: {
            select: {
              scores: true
            }
          }
        },
        orderBy: {
          assignedAt: 'desc'
        }
      })
    } catch (dbError) {
      console.error('❌ Database error (Judge table might not exist):', dbError)

      // Fallback: Return users with judge role
      try {
        const judgeUsers = await prisma.user.findMany({
          where: { role: 'judge' },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true
          }
        })

        return NextResponse.json({
          judges: judgeUsers.map(user => ({
            id: user.id,
            userId: user.id,
            hackathonId: null,
            isActive: true,
            assignedAt: user.createdAt,
            user: user,
            hackathon: null,
            _count: { scores: 0 }
          })),
          total: judgeUsers.length,
          active: judgeUsers.length,
          inactive: 0,
          fallback: true,
          message: 'عرض المحكمين من جدول المستخدمين (Judge table غير متاح)'
        })
      } catch (fallbackError) {
        console.error('❌ Fallback query failed:', fallbackError)
        return NextResponse.json({
          judges: [],
          total: 0,
          active: 0,
          inactive: 0,
          error: 'لا يمكن الوصول لبيانات المحكمين'
        })
      }
    }

    console.log(`✅ Found ${judges.length} judges`)

    return NextResponse.json({
      judges,
      total: judges.length,
      active: judges.filter(j => j.isActive).length,
      inactive: judges.filter(j => !j.isActive).length
    })

  } catch (error) {
    console.error('❌ Error fetching judges:', error)
    return NextResponse.json({
      error: 'خطأ في جلب المحكمين',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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
          password: passwordHash,
          phone: phone || null,
          role: 'judge'
        }
      })

      // Try to create judge assignment, fallback if Judge table doesn't exist
      let judge = null
      try {
        judge = await tx.judge.create({
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
      } catch (judgeError) {
        console.warn('⚠️ Judge table not available, user created with judge role only')
        // Create a mock judge object for response
        judge = {
          id: user.id,
          userId: user.id,
          hackathonId,
          isActive: true,
          assignedAt: new Date(),
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
          },
          hackathon: hackathon
        }
      }

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
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown',
    })

    let errorMessage = 'خطأ في إنشاء المحكم'
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        errorMessage = 'هذا الإيميل مستخدم بالفعل'
      } else if (error.message.includes('Foreign key constraint')) {
        errorMessage = 'الهاكاثون المحدد غير موجود'
      } else if (error.message.includes('judge')) {
        errorMessage = 'خطأ في إنشاء بيانات المحكم'
      }
    }

    return NextResponse.json({
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
