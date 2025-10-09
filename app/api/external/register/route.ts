import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// CORS headers for external API access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false',
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

// POST /api/external/register - Register participant via external API
export async function POST(request: NextRequest) {
  try {
    // Verify API Key
    const apiKey = request.headers.get('X-API-Key')
    const validApiKey = process.env.EXTERNAL_API_KEY || 'hackathon-api-key-2025'

    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid API Key' },
        { status: 401, headers: corsHeaders }
      )
    }

    const body = await request.json()
    const {
      hackathonId,
      ...formData
    } = body

    console.log('📝 External registration request:', { hackathonId, formData })

    // Validate required fields
    if (!hackathonId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: hackathonId'
        },
        { status: 400, headers: corsHeaders }
      )
    }

    // Extract standard fields
    const name = formData.name || formData.fullName || formData.الاسم
    const email = formData.email || formData.البريد_الإلكتروني
    const phone = formData.phone || formData.رقم_الهاتف || formData.الجوال
    const university = formData.university || formData.organization || formData.المؤسسة || formData.الجامعة
    const preferredRole = formData.preferredRole || formData.الدور_المفضل

    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name and email are required'
        },
        { status: 400, headers: corsHeaders }
      )
    }

    // Verify hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json(
        { success: false, error: 'Hackathon not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    })

    // If user doesn't exist, create one
    if (!user) {
      const hashedPassword = await bcrypt.hash('external-user-' + Date.now(), 10)

      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'participant',
          phone: phone || null,
          university: university || null,
          preferredRole: preferredRole || null
        }
      })

      console.log('✅ New user created:', user.email)
    } else {
      console.log('👤 Existing user found:', user.email)
    }

    // Check if already registered for this hackathon
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        userId: user.id,
        hackathonId: hackathonId
      }
    })

    if (existingParticipant) {
      return NextResponse.json(
        {
          success: false,
          error: 'User already registered for this hackathon',
          participant: {
            id: existingParticipant.id,
            status: existingParticipant.status
          }
        },
        { status: 409, headers: corsHeaders }
      )
    }

    // Prepare custom fields (exclude standard fields)
    const standardFields = ['name', 'fullName', 'الاسم', 'email', 'البريد_الإلكتروني', 'phone', 'رقم_الهاتف', 'الجوال', 'university', 'organization', 'المؤسسة', 'الجامعة', 'preferredRole', 'الدور_المفضل', 'hackathonId']
    const customFields: any = {}

    Object.keys(formData).forEach(key => {
      if (!standardFields.includes(key)) {
        customFields[key] = formData[key]
      }
    })

    // Create participant
    const participant = await prisma.participant.create({
      data: {
        userId: user.id,
        hackathonId: hackathonId,
        status: 'pending',
        registeredAt: new Date(),
        customFields: customFields
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            organization: true,
            preferredRole: true
          }
        }
      }
    })

    console.log('✅ Participant registered successfully:', participant.id)

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      participant: {
        id: participant.id,
        name: participant.user.name,
        email: participant.user.email,
        phone: participant.user.phone,
        university: participant.user.university,
        preferredRole: participant.user.preferredRole,
        status: participant.status,
        registeredAt: participant.registeredAt,
        customFields: participant.customFields
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('❌ External registration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    )
  }
}

export const dynamic = 'force-dynamic'

