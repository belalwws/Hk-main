import { NextRequest, NextResponse } from 'next/server'

// GET /api/debug/simple - Simple test endpoint
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [SIMPLE-DEBUG] Simple test endpoint called')
    
    return NextResponse.json({
      success: true,
      message: 'Simple test endpoint working',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        RENDER: process.env.RENDER ? 'YES' : 'NO'
      }
    })
  } catch (error) {
    console.error('❌ [SIMPLE-DEBUG] Error:', error)
    return NextResponse.json({ 
      error: 'Simple test failed',
      details: error.message 
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
