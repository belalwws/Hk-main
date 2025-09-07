import { NextRequest, NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing email functionality...')
    console.log('🔍 Environment variables:')
    console.log('🔍 GMAIL_USER:', process.env.GMAIL_USER ? 'SET' : 'NOT SET')
    console.log('🔍 GMAIL_PASS:', process.env.GMAIL_PASS ? 'SET' : 'NOT SET')

    const body = await request.json()
    const { to = 'racein668@gmail.com', subject = 'Test Email', message = 'This is a test email' } = body

    console.log('📧 Attempting to send test email to:', to)
    console.log('📧 Subject:', subject)
    console.log('📧 Message:', message)

    // Test email sending
    const result = await sendMail({
      to,
      subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #01645e;">🧪 Test Email</h2>
          <p>${message}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>From:</strong> Hackathon Platform</p>
        </div>
      `
    })

    console.log('✅ Email send result:', result)

    return NextResponse.json({
      success: true,
      message: result.mocked ? 'Email was mocked (not actually sent)' : 'Email sent successfully!',
      result,
      actuallyMailed: !result.mocked,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Email test failed:', error)

    return NextResponse.json({
      success: false,
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
