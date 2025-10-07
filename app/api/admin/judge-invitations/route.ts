import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// GET /api/admin/judge-invitations - Get all judge invitations
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const invitations = await prisma.judgeInvitation.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ invitations })

  } catch (error) {
    console.error('❌ Error fetching invitations:', error)
    return NextResponse.json({ error: 'خطأ في جلب الدعوات' }, { status: 500 })
  }
}

// POST /api/admin/judge-invitations - Create new judge invitation
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { email, name, hackathonId, expiresInDays = 7 } = body

    console.log('📧 Creating judge invitation:', { email, name, hackathonId })

    // Validate required fields
    if (!email || !hackathonId) {
      return NextResponse.json({
        error: 'البريد الإلكتروني والهاكاثون مطلوبان'
      }, { status: 400 })
    }

    // Check if email already exists as a user
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({
        error: 'هذا البريد الإلكتروني مسجل بالفعل في النظام'
      }, { status: 400 })
    }

    // Check if there's already a pending invitation for this email and hackathon
    const existingInvitation = await prisma.judgeInvitation.findFirst({
      where: {
        email,
        hackathonId,
        status: 'pending'
      }
    })

    if (existingInvitation) {
      return NextResponse.json({
        error: 'يوجد دعوة معلقة بالفعل لهذا البريد الإلكتروني'
      }, { status: 400 })
    }

    // Generate unique token
    const invitationToken = crypto.randomBytes(32).toString('hex')

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // Create invitation
    const invitation = await prisma.judgeInvitation.create({
      data: {
        email,
        name: name || null,
        hackathonId,
        token: invitationToken,
        invitedBy: payload.userId,
        expiresAt
      }
    })

    // Generate invitation link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const invitationLink = `${baseUrl}/judge/register?token=${invitationToken}`

    console.log('✅ Judge invitation created successfully')
    console.log('🔗 Invitation link:', invitationLink)

    return NextResponse.json({
      message: 'تم إنشاء الدعوة بنجاح',
      invitation,
      invitationLink
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error creating invitation:', error)
    return NextResponse.json({
      error: 'خطأ في إنشاء الدعوة',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

