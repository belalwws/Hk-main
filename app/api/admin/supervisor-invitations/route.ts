import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// GET - Get all supervisor invitations
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const invitations = await prisma.supervisorInvitation.findMany({
      include: {
        hackathon: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ invitations })

  } catch (error) {
    console.error("Error fetching supervisor invitations:", error)
    return NextResponse.json({ 
      error: "حدث خطأ في جلب الدعوات" 
    }, { status: 500 })
  }
}

// POST - Create new supervisor invitation
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { email, name, hackathonId, department, permissions } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: 'المستخدم موجود بالفعل. يمكنك تعيينه مباشرة من قائمة المستخدمين' 
      }, { status: 400 })
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.supervisorInvitation.findFirst({
      where: {
        email,
        status: 'pending'
      }
    })

    if (existingInvitation) {
      return NextResponse.json({ 
        error: 'توجد دعوة معلقة لهذا البريد الإلكتروني بالفعل' 
      }, { status: 400 })
    }

    // Generate unique token
    const invitationToken = crypto.randomBytes(32).toString('hex')

    // Create invitation
    const invitation = await prisma.supervisorInvitation.create({
      data: {
        email,
        name: name || null,
        hackathonId: hackathonId || null,
        department: department || null,
        permissions: permissions || null,
        token: invitationToken,
        status: 'pending'
      },
      include: {
        hackathon: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    })

    // TODO: Send invitation email
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/supervisor/accept-invitation?token=${invitationToken}`
    
    console.log('Supervisor Invitation URL:', invitationUrl)
    console.log('Send email to:', email)

    return NextResponse.json({
      message: 'تم إرسال الدعوة بنجاح',
      invitation,
      invitationUrl // For testing
    })

  } catch (error) {
    console.error("Error creating supervisor invitation:", error)
    return NextResponse.json({ 
      error: "حدث خطأ في إنشاء الدعوة" 
    }, { status: 500 })
  }
}

// DELETE - Delete supervisor invitation
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('id')

    if (!invitationId) {
      return NextResponse.json({ error: 'معرف الدعوة مطلوب' }, { status: 400 })
    }

    // Delete the invitation
    await prisma.supervisorInvitation.delete({
      where: { id: invitationId }
    })

    return NextResponse.json({
      message: 'تم حذف الدعوة بنجاح'
    })

  } catch (error) {
    console.error("Error deleting supervisor invitation:", error)
    return NextResponse.json({ 
      error: "حدث خطأ في حذف الدعوة" 
    }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"

