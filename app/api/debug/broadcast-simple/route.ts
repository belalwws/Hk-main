import { NextRequest, NextResponse } from 'next/server'

// POST /api/debug/broadcast-simple - Simple broadcast test
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [BROADCAST-SIMPLE] Starting simple broadcast test...')
    
    const body = await request.json()
    console.log('🔍 [BROADCAST-SIMPLE] Request body:', body)
    
    // Test 1: Prisma import
    console.log('🔧 [BROADCAST-SIMPLE] Testing Prisma import...')
    let prisma: any = null
    try {
      const { prisma: prismaClient } = await import('@/lib/prisma')
      prisma = prismaClient
      console.log('✅ [BROADCAST-SIMPLE] Prisma imported successfully')
    } catch (error) {
      console.error('❌ [BROADCAST-SIMPLE] Prisma import failed:', error)
      return NextResponse.json({ 
        error: 'Prisma import failed',
        details: error.message
      }, { status: 500 })
    }

    // Test 2: Database query
    console.log('🔧 [BROADCAST-SIMPLE] Testing database query...')
    try {
      const userCount = await prisma.user.count()
      console.log('✅ [BROADCAST-SIMPLE] Database query successful, user count:', userCount)
    } catch (error) {
      console.error('❌ [BROADCAST-SIMPLE] Database query failed:', error)
      return NextResponse.json({ 
        error: 'Database query failed',
        details: error.message
      }, { status: 500 })
    }

    // Test 3: Mailer import
    console.log('🔧 [BROADCAST-SIMPLE] Testing mailer import...')
    try {
      const { sendMail } = await import('@/lib/mailer')
      console.log('✅ [BROADCAST-SIMPLE] Mailer imported successfully')
      
      // Test 4: Send test email
      console.log('🔧 [BROADCAST-SIMPLE] Testing email send...')
      const result = await sendMail({
        to: 'test@example.com',
        subject: 'Test Email from Broadcast Simple',
        html: 'This is a test email from broadcast simple test'
      })
      
      console.log('✅ [BROADCAST-SIMPLE] Email test result:', result)
      
      return NextResponse.json({
        success: true,
        message: 'Simple broadcast test successful',
        userCount,
        emailResult: result,
        tests: {
          prisma: 'PASS',
          database: 'PASS',
          mailer: 'PASS',
          email: 'PASS'
        }
      })
    } catch (error) {
      console.error('❌ [BROADCAST-SIMPLE] Mailer test failed:', error)
      return NextResponse.json({ 
        error: 'Mailer test failed',
        details: error.message,
        stack: error.stack
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ [BROADCAST-SIMPLE] General error:', error)
    return NextResponse.json({ 
      error: 'General error in simple broadcast test',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
