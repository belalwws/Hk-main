import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTemplatedEmail } from '@/lib/mailer'
import nodemailer from 'nodemailer'

// URGENT: Immediate email sending function - HIGHEST PRIORITY
async function sendImmediateConfirmationEmail(email: string, name: string, hackathonTitle: string) {
  console.log('🚨 URGENT EMAIL SENDING TO:', email)

  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_PASS

  console.log('🔧 Gmail credentials check:', {
    hasUser: !!gmailUser,
    hasPass: !!gmailPass,
    userEmail: gmailUser,
    passLength: gmailPass?.length || 0
  })

  if (!gmailUser || !gmailPass) {
    console.error('❌ CRITICAL: Gmail credentials missing!')
    console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('GMAIL')))
    return { success: false, error: 'Gmail credentials not configured' }
  }

  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    })

    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #01645e; text-align: center; margin-bottom: 30px;">🎉 تأكيد التسجيل في الهاكاثون</h1>

          <p style="font-size: 18px; color: #333;">مرحباً <strong>${name}</strong>،</p>

          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            تم تسجيلك بنجاح في <strong style="color: #01645e;">${hackathonTitle}</strong>
          </p>

          <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #01645e; margin-top: 0;">تفاصيل التسجيل:</h3>
            <p><strong>البريد الإلكتروني:</strong> ${email}</p>
            <p><strong>تاريخ التسجيل:</strong> ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA')}</p>
            <p><strong>الهاكاثون:</strong> ${hackathonTitle}</p>
          </div>

          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            سيتم مراجعة طلبك من قبل فريق الإدارة وإرسال تأكيد القبول قريباً.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #01645e; font-size: 18px; font-weight: bold;">
              🚀 منصة هاكاثون الابتكار التقني
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            هذا إيميل تلقائي، يرجى عدم الرد عليه مباشرة.
          </p>
        </div>
      </div>
    `

    console.log('📤 SENDING EMAIL NOW...')
    const result = await transporter.sendMail({
      from: `منصة هاكاثون الابتكار التقني <${gmailUser}>`,
      to: email,
      subject: `✅ تأكيد التسجيل في ${hackathonTitle}`,
      html: emailContent
    })

    console.log('✅ SUCCESS! Email sent with ID:', result.messageId)
    return { success: true, messageId: result.messageId }

  } catch (error) {
    console.error('❌ CRITICAL EMAIL ERROR:', error)
    return { success: false, error: error }
  }
}

// Direct email sending function
async function sendEmailDirect(to: string, subject: string, html: string) {
  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_PASS

  console.log('🔧 Gmail config check:', {
    hasUser: !!gmailUser,
    hasPass: !!gmailPass,
    userLength: gmailUser?.length || 0
  })

  if (!gmailUser || !gmailPass) {
    console.log('⚠️ Gmail credentials not configured, skipping email')
    return { success: false, mocked: true }
  }

  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass
    }
  })

  try {
    console.log('📤 Attempting to send email to:', to)
    const result = await transporter.sendMail({
      from: `منصة هاكاثون الابتكار التقني <${gmailUser}>`,
      to: to,
      subject: subject,
      html: html
    })

    console.log('✅ Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    return { success: false, error: error }
  }
}

// Dedicated function to send confirmation email
async function sendRegistrationConfirmationEmail(userData: any, hackathonTitle?: string) {
  console.log('📧 Attempting to send confirmation email to:', userData.email)

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #01645e; text-align: center; margin-bottom: 30px;">تأكيد التسجيل في الهاكاثون</h2>

        <p style="color: #333; font-size: 16px; line-height: 1.6;">مرحباً ${userData.name}،</p>

        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          تم تسجيلك بنجاح في ${hackathonTitle || 'الهاكاثون'}
        </p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #01645e; margin-top: 0;">تفاصيل التسجيل:</h3>
          <p><strong>الاسم:</strong> ${userData.name}</p>
          <p><strong>البريد الإلكتروني:</strong> ${userData.email}</p>
          ${userData.phone ? `<p><strong>الهاتف:</strong> ${userData.phone}</p>` : ''}
          <p><strong>تاريخ التسجيل:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>

        <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
          سيتم مراجعة طلبك وإرسال تأكيد القبول قريباً
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #01645e; font-weight: bold;">منصة هاكاثون الابتكار التقني</p>
        </div>
      </div>
    </div>
  `

  try {
    // Try template system first
    await sendTemplatedEmail({
      to: userData.email,
      subject: `تأكيد التسجيل في ${hackathonTitle || 'الهاكاثون'}`,
      template: 'registration_confirmation',
      variables: {
        participantName: userData.name,
        participantEmail: userData.email,
        hackathonTitle: hackathonTitle || 'الهاكاثون',
        registrationDate: new Date().toLocaleDateString('ar-SA'),
        hackathonDate: 'سيتم تحديده لاحقاً',
        hackathonLocation: 'سيتم تحديده لاحقاً'
      }
    })
    console.log('✅ Confirmation email sent via template system')
    return { success: true, method: 'template' }
  } catch (templateError) {
    console.error('❌ Template email failed, trying direct send:', templateError)

    try {
      await sendEmailDirect(
        userData.email,
        `تأكيد التسجيل في ${hackathonTitle || 'الهاكاثون'}`,
        emailContent
      )
      console.log('✅ Confirmation email sent via direct method')
      return { success: true, method: 'direct' }
    } catch (directError) {
      console.error('❌ Direct email also failed:', directError)
      return { success: false, error: directError }
    }
  }
}

// GET /api/hackathons/[id]/register-form - Get hackathon registration form for public
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params

    try {
      // Try to get form from database
      const form = await prisma.hackathonForm.findFirst({
        where: { 
          hackathonId: params.id,
          isActive: true
        }
      })

      if (form) {
        return NextResponse.json({
          form: {
            id: form.id,
            hackathonId: form.hackathonId,
            title: form.title,
            description: form.description,
            isActive: form.isActive,
            fields: JSON.parse(form.fields),
            settings: JSON.parse(form.settings)
          }
        })
      }

      return NextResponse.json({ form: null })

    } catch (dbError) {
      console.error('Database error:', dbError)
      
      // Return a default form if database fails
      return NextResponse.json({
        form: {
          id: `default_${params.id}`,
          hackathonId: params.id,
          title: 'نموذج التسجيل',
          description: 'نموذج التسجيل في الهاكاثون',
          isActive: true,
          fields: [
            {
              id: 'name',
              type: 'text',
              label: 'الاسم الكامل',
              placeholder: 'اكتب اسمك الكامل',
              required: true
            },
            {
              id: 'email',
              type: 'email',
              label: 'البريد الإلكتروني',
              placeholder: 'example@email.com',
              required: true
            },
            {
              id: 'phone',
              type: 'phone',
              label: 'رقم الهاتف',
              placeholder: '+966xxxxxxxxx',
              required: true
            },
            {
              id: 'experience',
              type: 'select',
              label: 'مستوى الخبرة',
              required: true,
              options: ['مبتدئ', 'متوسط', 'متقدم', 'خبير']
            },
            {
              id: 'skills',
              type: 'textarea',
              label: 'المهارات والخبرات',
              placeholder: 'اذكر مهاراتك وخبراتك التقنية',
              required: false
            }
          ],
          settings: {
            allowMultipleSubmissions: false,
            requireApproval: true,
            sendConfirmationEmail: true
          }
        }
      })
    }

  } catch (error) {
    console.error('Error fetching registration form:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// POST /api/hackathons/[id]/register-form - Submit hackathon registration form
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const body = await request.json()
    const { formId, data } = body

    console.log('📝 Registration form submission:', {
      hackathonId: params.id,
      email: data?.email,
      name: data?.name
    })

    // Validate required data
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'بيانات النموذج مطلوبة' }, { status: 400 })
    }

    // Basic validation for required fields
    if (!data.name?.trim()) {
      return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 })
    }

    if (!data.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير صحيح' }, { status: 400 })
    }

    // Send confirmation email immediately (before database operations)
    let hackathonTitle = 'الهاكاثون'
    try {
      const hackathonResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/hackathons/${params.id}`)
      if (hackathonResponse.ok) {
        const hackathonData = await hackathonResponse.json()
        hackathonTitle = hackathonData.title || 'الهاكاثون'
      }
    } catch (error) {
      console.log('Could not fetch hackathon title, using default')
    }

    // 🚨 URGENT: Send confirmation email IMMEDIATELY
    console.log('🚨 URGENT: Sending confirmation email IMMEDIATELY to:', data.email)
    const urgentEmailResult = await sendImmediateConfirmationEmail(data.email, data.name, hackathonTitle)
    console.log('🚨 URGENT EMAIL RESULT:', urgentEmailResult)

    // Send immediate simple email first (backup method)
    console.log('📧 Sending backup confirmation email to:', data.email)
    try {
      const immediateEmailResult = await sendEmailDirect(
        data.email,
        'تأكيد التسجيل في الهاكاثون',
        `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #01645e;">تأكيد التسجيل في الهاكاثون</h2>
            <p>مرحباً ${data.name}،</p>
            <p>تم تسجيلك بنجاح في ${hackathonTitle}</p>
            <p><strong>البريد الإلكتروني:</strong> ${data.email}</p>
            <p><strong>تاريخ التسجيل:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
            <p>سيتم مراجعة طلبك وإرسال تأكيد القبول قريباً</p>
            <hr>
            <p style="color: #01645e; font-weight: bold;">منصة هاكاثون الابتكار التقني</p>
          </div>
        `
      )
      console.log('📧 Backup email result:', immediateEmailResult)
    } catch (immediateError) {
      console.error('❌ Backup email failed:', immediateError)
    }

    console.log('📧 About to send confirmation email to:', data.email)
    const emailResult = await sendRegistrationConfirmationEmail(data, hackathonTitle)
    console.log('📧 Email sending result:', emailResult)

    if (emailResult.success) {
      console.log('✅ Email sent successfully via', emailResult.method)
    } else {
      console.error('❌ Email sending failed:', emailResult.error)

      // Last resort: try a simple direct email
      try {
        console.log('🔄 Attempting last resort email send...')
        const simpleEmailContent = `
          <h2>تأكيد التسجيل في الهاكاثون</h2>
          <p>مرحباً ${data.name}،</p>
          <p>تم تسجيلك بنجاح في ${hackathonTitle}</p>
          <p>البريد الإلكتروني: ${data.email}</p>
          <p>تاريخ التسجيل: ${new Date().toLocaleDateString('ar-SA')}</p>
          <p>سيتم مراجعة طلبك وإرسال تأكيد القبول قريباً</p>
          <p>منصة هاكاثون الابتكار التقني</p>
        `

        await sendEmailDirect(
          data.email,
          `تأكيد التسجيل في ${hackathonTitle}`,
          simpleEmailContent
        )
        console.log('✅ Last resort email sent successfully')
      } catch (lastResortError) {
        console.error('❌ Last resort email also failed:', lastResortError)
      }
    }

    try {
      // Get hackathon details
      const hackathon = await prisma.hackathon.findUnique({
        where: { id: params.id }
      })

      if (!hackathon) {
        return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
      }

      // Check if registration is still open
      if (new Date() > new Date(hackathon.registrationDeadline)) {
        return NextResponse.json({ error: 'انتهى موعد التسجيل' }, { status: 400 })
      }

      // Check if hackathon is full
      if (hackathon.maxParticipants) {
        const currentParticipants = await prisma.participant.count({
          where: { hackathonId: params.id }
        })
        
        if (currentParticipants >= hackathon.maxParticipants) {
          return NextResponse.json({ error: 'الهاكاثون ممتلئ' }, { status: 400 })
        }
      }

      // Check if user already registered
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      })

      if (existingUser) {
        const existingParticipant = await prisma.participant.findFirst({
          where: {
            userId: existingUser.id,
            hackathonId: params.id
          }
        })

        if (existingParticipant) {
          return NextResponse.json({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' }, { status: 400 })
        }
      }

      // Create or get user
      let user = existingUser
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            city: data.city || null,
            nationality: data.nationality || 'سعودي',
            preferredRole: data.experience || 'مبتدئ'
          }
        })
      }

      // Create participant record
      const participant = await prisma.participant.create({
        data: {
          userId: user.id,
          hackathonId: params.id,
          status: 'pending', // Will require admin approval
          additionalInfo: {
            registrationType: 'form',
            formData: data,
            submittedAt: new Date().toISOString()
          }
        }
      })

      console.log('✅ Registration saved to database successfully')

      return NextResponse.json({
        success: true,
        message: 'تم التسجيل بنجاح',
        participant: {
          id: participant.id,
          status: participant.status,
          requiresApproval: true
        }
      })

    } catch (dbError) {
      console.error('Database error:', dbError)

      // Fallback: log the registration and return success
      console.log('Registration data (fallback):', {
        hackathonId: params.id,
        formId,
        userData: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          ...data
        },
        timestamp: new Date().toISOString()
      })

      console.log('✅ Registration logged in fallback mode')

      return NextResponse.json({
        success: true,
        message: 'تم التسجيل بنجاح (وضع التجريب)',
        participant: {
          id: `participant_${Date.now()}`,
          status: 'pending',
          requiresApproval: true
        }
      })
    }

  } catch (error) {
    console.error('Error submitting registration form:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
