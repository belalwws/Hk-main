import { NextRequest, NextResponse } from 'next/server'
import { clearAllRateLimits, resetRateLimit } from '@/lib/rate-limit'

// POST /api/debug/reset-rate-limit - Reset rate limits (development only)
export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { action, path } = body

    if (action === 'clear-all') {
      const cleared = clearAllRateLimits()
      return NextResponse.json({ 
        success: true, 
        message: `Cleared all rate limits (${cleared} entries)`,
        action: 'clear-all'
      })
    } else if (action === 'reset-ip') {
      resetRateLimit(request, path)
      return NextResponse.json({ 
        success: true, 
        message: 'Rate limit reset for current IP',
        action: 'reset-ip',
        path: path || 'current'
      })
    } else {
      // Default: clear all
      const cleared = clearAllRateLimits()
      return NextResponse.json({ 
        success: true, 
        message: `Default action: cleared all rate limits (${cleared} entries)`,
        action: 'clear-all'
      })
    }

  } catch (error) {
    console.error('❌ Error resetting rate limit:', error)
    return NextResponse.json({ 
      error: 'Failed to reset rate limit',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// GET /api/debug/reset-rate-limit - Get rate limit status
export async function GET(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      message: 'Rate limit debug endpoint',
      environment: process.env.NODE_ENV,
      available_actions: [
        'POST with { "action": "clear-all" } - Clear all rate limits',
        'POST with { "action": "reset-ip", "path": "/api/login" } - Reset specific IP/path',
        'POST with {} - Default clear all'
      ]
    })

  } catch (error) {
    console.error('❌ Error getting rate limit status:', error)
    return NextResponse.json({ 
      error: 'Failed to get rate limit status',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
