import { NextRequest, NextResponse } from 'next/server'

// GET /api/debug/database - Test database connection
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG-DB] Testing database connection...')
    
    // Test Prisma import
    let prisma: any = null
    try {
      const { prisma: prismaClient } = await import('@/lib/prisma')
      prisma = prismaClient
      console.log('✅ [DEBUG-DB] Prisma client imported successfully')
    } catch (error) {
      console.error('❌ [DEBUG-DB] Failed to import Prisma:', error)
      return NextResponse.json({ 
        error: 'Failed to import Prisma client',
        details: error.message,
        stack: error.stack
      }, { status: 500 })
    }

    // Test database connection
    try {
      const userCount = await prisma.user.count()
      console.log('✅ [DEBUG-DB] Database connection successful, user count:', userCount)
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        userCount,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET'
        }
      })
    } catch (error) {
      console.error('❌ [DEBUG-DB] Database query failed:', error)
      return NextResponse.json({ 
        error: 'Database query failed',
        details: error.message,
        stack: error.stack
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ [DEBUG-DB] General error:', error)
    return NextResponse.json({ 
      error: 'General error in database test',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
