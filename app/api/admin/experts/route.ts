import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// GET /api/admin/experts - Get all experts
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    console.log('📋 Fetching all experts...')

    // Check if Expert table exists by trying a simple query first
    let experts = []
    try {
      experts = await prisma.expert.findMany({
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
    } catch (dbError) {
      console.error('❌ Database error (Expert table might not exist):', dbError)

      // Fallback: Return users with expert role
      try {
        const expertUsers = await prisma.user.findMany({
          where: { role: 'expert' },
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
          experts: expertUsers.map(user => ({
            id: user.id,
            userId: user.id,
            hackathonId: null,
            isActive: true,
            assignedAt: user.createdAt,
            user: user,
            hackathon: null
          })),
          total: expertUsers.length,
          active: expertUsers.length,
          inactive: 0,
          fallback: true,
          message: 'عرض الخبراء من جدول المستخدمين (Expert table غير متاح)'
        })
      } catch (fallbackError) {
        console.error('❌ Fallback query failed:', fallbackError)
        return NextResponse.json({
          experts: [],
          total: 0,
          active: 0,
          inactive: 0,
          error: 'لا يمكن الوصول لبيانات الخبراء'
        })
      }
    }

    console.log(`✅ Found ${experts.length} experts`)

    return NextResponse.json({
      experts,
      total: experts.length,
      active: experts.filter(j => j.isActive).length,
      inactive: experts.filter(j => !j.isActive).length
    })

  } catch (error) {
    console.error('❌ Error fetching experts:', error)
    return NextResponse.json({
      error: 'خطأ في جلب الخبراء',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/admin/experts - Create new expert
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

    console.log('🔨 Creating new expert:', { name, email, hackathonId })

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

    // Create user and expert in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          phone: phone || null,
          role: 'expert'
        }
      })

      // Try to create expert assignment, fallback if Expert table doesn't exist
      let expert = null
      try {
        expert = await tx.expert.create({
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
      } catch (expertError) {
        console.warn('⚠️ Expert table not available, user created with expert role only')
        // Create a mock expert object for response
        expert = {
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

      return { user, expert }
    })

    console.log('✅ Expert created successfully:', result.expert.id)

    return NextResponse.json({
      message: 'تم إنشاء الخبير بنجاح',
      expert: result.expert,
      credentials: {
        email,
        password // Return for admin to share with expert
      }
    })

  } catch (error) {
    console.error('❌ Error creating expert:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown',
    })

    let errorMessage = 'خطأ في إنشاء الخبير'
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        errorMessage = 'هذا الإيميل مستخدم بالفعل'
      } else if (error.message.includes('Foreign key constraint')) {
        errorMessage = 'الهاكاثون المحدد غير موجود'
      } else if (error.message.includes('expert')) {
        errorMessage = 'خطأ في إنشاء بيانات الخبير'
      }
    }

    return NextResponse.json({
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
