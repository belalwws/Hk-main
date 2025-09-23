import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import { sendEmail, getRegistrationConfirmationEmail as getConfirmationEmail } from '@/lib/email-utils'

const prisma = new PrismaClient()

// CORS headers for external API access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
}

// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}


// POST /api/external/hackathons/[id]/register - Register for hackathon
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId } = params

    // Get API key from headers
    const apiKey = request.headers.get('X-API-Key')
    if (!apiKey || apiKey !== process.env.EXTERNAL_API_KEY) {
      return NextResponse.json(
        { error: 'Invalid API key' }, 
        { status: 401, headers: corsHeaders }
      )
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      university,
      major,
      graduationYear,
      preferredRole,
      experience,
      skills,
      portfolioUrl,
      linkedinUrl,
      githubUrl,
      motivation,
      source // من أين سمع عن الهاكاثون
    } = body

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Check if hackathon exists and is active
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    })

    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' }, 
        { status: 404, headers: corsHeaders }
      )
    }

    if (hackathon.status !== 'open') {
      return NextResponse.json(
        { error: 'Hackathon is not currently accepting registrations' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Check registration deadline
    const now = new Date()
    const deadline = new Date(hackathon.registrationDeadline || hackathon.startDate)
    if (now > deadline) {
      return NextResponse.json(
        { error: 'Registration deadline has passed' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Check if hackathon is full
    if (hackathon.maxParticipants && hackathon._count.participants >= hackathon.maxParticipants) {
      return NextResponse.json(
        { error: 'Hackathon is full' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    })

    // If user doesn't exist, create new user
    if (!user) {
      const hashedPassword = await bcryptjs.hash('temp123456', 10) // Temporary password
      
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          university,
          major,
          graduationYear: graduationYear ? graduationYear.toString() : null,
          preferredRole,
          experience,
          skills: skills ? skills.join(', ') : null,
          portfolio: portfolioUrl,
          role: 'participant',
          isActive: true,
          emailVerified: false
        }
      })
    }

    // Check if user is already registered for this hackathon
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        userId: user.id,
        hackathonId: hackathonId
      }
    })

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'User is already registered for this hackathon' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Register user for hackathon
    const participant = await prisma.participant.create({
      data: {
        userId: user.id,
        hackathonId: hackathonId,
        motivation,
        additionalInfo: JSON.stringify({ source: source || 'external_api' })
      }
    })

    // Send confirmation email
    try {
      await sendEmail({
        to: email,
        subject: `🎉 تأكيد التسجيل في ${hackathon.title}`,
        html: getConfirmationEmail(name, hackathon.title, hackathon.startDate.toISOString(), hackathon.endDate.toISOString())
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      data: {
        participantId: participant.id,
        hackathonTitle: hackathon.title,
        registrationDate: participant.createdAt,
        hackathonStartDate: hackathon.startDate,
        hackathonEndDate: hackathon.endDate
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error registering for hackathon:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    )
  }
}

