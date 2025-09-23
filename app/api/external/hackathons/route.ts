import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// CORS headers for external API access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
}

// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}

// GET /api/external/hackathons - Get list of active hackathons
export async function GET(request: NextRequest) {
  try {
    // Add CORS headers
    const response = new NextResponse()
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    // Get API key from headers
    const apiKey = request.headers.get('X-API-Key')
    if (!apiKey || apiKey !== process.env.EXTERNAL_API_KEY) {
      return NextResponse.json(
        { error: 'Invalid API key' }, 
        { status: 401, headers: corsHeaders }
      )
    }

    // Get active hackathons
    const hackathons = await prisma.hackathon.findMany({
      where: {
        status: 'active'
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        registrationDeadline: true,
        maxParticipants: true,
        _count: {
          select: {
            participants: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedHackathons = hackathons.map(hackathon => ({
      id: hackathon.id,
      title: hackathon.title,
      description: hackathon.description,
      startDate: hackathon.startDate,
      endDate: hackathon.endDate,
      registrationDeadline: hackathon.registrationDeadline,
      maxParticipants: hackathon.maxParticipants,
      currentParticipants: hackathon._count.participants,
      isRegistrationOpen: new Date() < new Date(hackathon.registrationDeadline || hackathon.startDate),
      spotsAvailable: hackathon.maxParticipants ? hackathon.maxParticipants - hackathon._count.participants : null
    }))

    return NextResponse.json({
      success: true,
      hackathons: formattedHackathons,
      total: formattedHackathons.length
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error fetching hackathons:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    )
  }
}
