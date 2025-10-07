import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/judge/apply - Submit judge application
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const hackathonId = formData.get('hackathonId') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string | null
    const bio = formData.get('bio') as string | null
    const expertise = formData.get('expertise') as string | null
    const experience = formData.get('experience') as string | null
    const linkedin = formData.get('linkedin') as string | null
    const twitter = formData.get('twitter') as string | null
    const website = formData.get('website') as string | null
    const profileImage = formData.get('profileImage') as File | null

    console.log('📝 Submitting judge application:', { name, email, hackathonId })

    // Validate required fields
    if (!hackathonId || !name || !email) {
      return NextResponse.json({
        error: 'الاسم والبريد الإلكتروني والهاكاثون مطلوبة'
      }, { status: 400 })
    }

    // Check if email already exists as a user
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({
        error: 'هذا البريد الإلكتروني مسجل بالفعل في النظام'
      }, { status: 400 })
    }

    // Check if there's already a pending application for this email and hackathon
    const existingApplication = await prisma.judgeApplication.findFirst({
      where: {
        email,
        hackathonId,
        status: 'pending'
      }
    })

    if (existingApplication) {
      return NextResponse.json({
        error: 'لديك طلب معلق بالفعل لهذا الهاكاثون'
      }, { status: 400 })
    }

    // Handle profile image upload
    let profileImageUrl: string | null = null
    if (profileImage && profileImage.size > 0) {
      // Convert image to base64 for storage (for simplicity)
      // In production, use a proper file storage service like Cloudinary or S3
      const bytes = await profileImage.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const mimeType = profileImage.type
      profileImageUrl = `data:${mimeType};base64,${base64}`
      
      console.log('📸 Profile image uploaded:', profileImage.name, profileImage.size, 'bytes')
    }

    // Create application
    const application = await prisma.judgeApplication.create({
      data: {
        hackathonId,
        name,
        email,
        phone,
        bio,
        expertise,
        experience,
        linkedin,
        twitter,
        website,
        profileImage: profileImageUrl,
        status: 'pending'
      }
    })

    console.log('✅ Judge application submitted successfully')

    return NextResponse.json({
      message: 'تم إرسال طلبك بنجاح! سيتم مراجعته قريباً',
      application: {
        id: application.id,
        name: application.name,
        email: application.email,
        status: application.status
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error submitting application:', error)
    return NextResponse.json({
      error: 'خطأ في إرسال الطلب',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

