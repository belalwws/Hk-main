import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/judge/apply - Submit judge application
export async function POST(request: NextRequest) {
  try {
    const formDataRaw = await request.formData()

    const hackathonId = formDataRaw.get('hackathonId') as string
    const formDataJson = formDataRaw.get('formData') as string

    // Parse the JSON form data
    const parsedData = formDataJson ? JSON.parse(formDataJson) : {}

    const name = parsedData.name || parsedData['الاسم الكامل'] || formDataRaw.get('name') as string
    const email = parsedData.email || parsedData['البريد الإلكتروني'] || formDataRaw.get('email') as string
    const phone = parsedData.phone || parsedData['رقم الهاتف'] || formDataRaw.get('phone') as string | null
    
    // جمع البيانات الإضافية في حقل bio
    const bioText = parsedData.bio || parsedData['نبذه عن المحكم المشارك'] || ''
    const nationalId = parsedData.nationalId || parsedData['رقم الهويه'] || ''
    const workplace = parsedData.workplace || parsedData['جهه العمل'] || ''
    
    // تخزين البيانات كـ JSON في bio
    const bioData = {
      bio: bioText,
      nationalId: nationalId,
      workplace: workplace
    }
    const bio = JSON.stringify(bioData)
    
    // المؤهل العلمي في expertise
    const expertise = parsedData.expertise || parsedData['المؤهل العلمي'] || parsedData.education || null
    
    // المشاركات السابقة في experience  
    const previousHackathons = parsedData.previousHackathons || parsedData['هل شاركت في هاكثونات افتراضيه عبر الانترنت من قبب'] || null
    const experience = previousHackathons ? `مشاركات سابقة: ${previousHackathons}` : null
    
    const linkedin = parsedData.linkedin || formDataRaw.get('linkedin') as string | null
    const twitter = parsedData.twitter || formDataRaw.get('twitter') as string | null
    const website = parsedData.website || formDataRaw.get('website') as string | null
    
    // معالجة الصورة الشخصية
    const profileImageFile = formDataRaw.get('profileImage') || formDataRaw.get('صوره شخصيه')
    const profileImage = (profileImageFile && typeof profileImageFile !== 'string') ? profileImageFile as File : null

    console.log('📝 Submitting judge application:', { name, email, hackathonId })

    // Validate required fields
    if (!hackathonId || !name || !email) {
      return NextResponse.json({
        error: 'الاسم والبريد الإلكتروني والهاكاثون مطلوبة'
      }, { status: 400 })
    }

    // ✅ السماح بالتسجيل حتى لو الإيميل موجود في النظام
    // فقط تحقق من عدم وجود طلب معلق لنفس الإيميل في نفس الهاكاثون
    
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

