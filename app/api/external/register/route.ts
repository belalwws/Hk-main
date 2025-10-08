import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST /api/external/register - Register participant via external API
export async function POST(request: NextRequest) {
  try {
    // Verify API Key
    const apiKey = request.headers.get('X-API-Key')
    const validApiKey = process.env.EXTERNAL_API_KEY || 'hackathon-api-key-2025'
    
    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid API Key' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      hackathonId,
      name,
      email,
      phone,
      organization,
      preferredRole,
      customFields
    } = body

    console.log('📝 External registration request:', { hackathonId, name, email })

    // Validate required fields
    if (!hackathonId || !name || !email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: hackathonId, name, email' 
        },
        { status: 400 }
      )
    }

    // Verify hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json(
        { success: false, error: 'Hackathon not found' },
        { status: 404 }
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
          organization: organization || null,
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
        { status: 409 }
      )
    }

    // Create participant
    const participant = await prisma.participant.create({
      data: {
        userId: user.id,
        hackathonId: hackathonId,
        status: 'pending',
        registeredAt: new Date(),
        customFields: customFields || {}
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
        organization: participant.user.organization,
        preferredRole: participant.user.preferredRole,
        status: participant.status,
        registeredAt: participant.registeredAt,
        customFields: participant.customFields
      }
    })

  } catch (error) {
    console.error('❌ External registration error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

