import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTemplatedEmail } from '@/lib/mailer'

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

      // Send confirmation email
      try {
        await sendTemplatedEmail({
          to: user.email,
          subject: `تأكيد التسجيل في ${hackathon.title}`,
          template: 'registration_confirmation',
          variables: {
            participantName: user.name,
            participantEmail: user.email,
            hackathonTitle: hackathon.title,
            registrationDate: new Date().toLocaleDateString('ar-SA'),
            hackathonDate: new Date(hackathon.startDate).toLocaleDateString('ar-SA'),
            hackathonLocation: hackathon.location || 'سيتم تحديده لاحقاً'
          }
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the registration if email fails
      }

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
