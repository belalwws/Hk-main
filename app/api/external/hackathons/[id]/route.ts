import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// CORS headers for external API access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
}

// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}

// GET /api/external/hackathons/[id] - Get hackathon details
export async function GET(
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

    // Get hackathon details
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        _count: {
          select: {
            participants: true,
            teams: true
          }
        }
      }
    })

    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' }, 
        { status: 404, headers: corsHeaders }
      )
    }

    // Get registration form if exists
    let registrationForm = null
    try {
      const form = await prisma.hackathonForm.findFirst({
        where: { hackathonId: hackathonId }
      })
      if (form) {
        registrationForm = {
          id: form.id,
          fields: form.formData ? JSON.parse(form.formData) : []
        }
      }
    } catch (error) {
      console.log('No custom form found, using default')
    }

    const formattedHackathon = {
      id: hackathon.id,
      title: hackathon.title,
      description: hackathon.description,
      startDate: hackathon.startDate,
      endDate: hackathon.endDate,
      registrationDeadline: hackathon.registrationDeadline,
      location: hackathon.location,
      maxParticipants: hackathon.maxParticipants,
      currentParticipants: hackathon._count.participants,
      currentTeams: hackathon._count.teams,
      status: hackathon.status,
      isRegistrationOpen: hackathon.status === 'active' && new Date() < new Date(hackathon.registrationDeadline || hackathon.startDate),
      spotsAvailable: hackathon.maxParticipants ? hackathon.maxParticipants - hackathon._count.participants : null,
      registrationForm: registrationForm,
      requirements: hackathon.requirements,
      prizes: hackathon.prizes,
      rules: hackathon.rules,
      schedule: hackathon.schedule,
      contactEmail: hackathon.contactEmail,
      websiteUrl: hackathon.websiteUrl,
      socialLinks: hackathon.socialLinks ? JSON.parse(hackathon.socialLinks) : null
    }

    return NextResponse.json({
      success: true,
      hackathon: formattedHackathon
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error fetching hackathon details:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    )
  }
}
