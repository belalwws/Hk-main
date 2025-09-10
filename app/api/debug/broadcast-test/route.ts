import { NextRequest, NextResponse } from 'next/server'

// POST /api/debug/broadcast-test - Test broadcast without auth
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [BROADCAST-TEST] Starting broadcast test...')
    
    const body = await request.json()
    console.log('🔍 [BROADCAST-TEST] Request body:', body)
    
    // Test Prisma import
    let prisma: any = null
    try {
      const { prisma: prismaClient } = await import('@/lib/prisma')
      prisma = prismaClient
      console.log('✅ [BROADCAST-TEST] Prisma client imported successfully')
    } catch (error) {
      console.error('❌ [BROADCAST-TEST] Failed to import Prisma:', error)
      return NextResponse.json({ 
        error: 'Failed to import Prisma client',
        details: error.message
      }, { status: 500 })
    }

    // Test database connection
    try {
      const userCount = await prisma.user.count()
      console.log('✅ [BROADCAST-TEST] Database connection successful, user count:', userCount)
    } catch (error) {
      console.error('❌ [BROADCAST-TEST] Database query failed:', error)
      return NextResponse.json({ 
        error: 'Database query failed',
        details: error.message
      }, { status: 500 })
    }

    // Test mailer import
    try {
      const { sendMail } = await import('@/lib/mailer')
      console.log('✅ [BROADCAST-TEST] Mailer imported successfully')
      
      // Test sending a simple email
      const result = await sendMail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: 'This is a test email'
      })
      
      console.log('✅ [BROADCAST-TEST] Email test result:', result)
      
      return NextResponse.json({
        success: true,
        message: 'Broadcast test successful',
        userCount,
        emailResult: result
      })
    } catch (error) {
      console.error('❌ [BROADCAST-TEST] Mailer test failed:', error)
      return NextResponse.json({ 
        error: 'Mailer test failed',
        details: error.message,
        stack: error.stack
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ [BROADCAST-TEST] General error:', error)
    return NextResponse.json({ 
      error: 'General error in broadcast test',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
