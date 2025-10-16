import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadToCloudinary } from '@/lib/cloudinary'

// POST /api/upload-presentation/upload - رفع العرض التقديمي
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const token = formData.get('token') as string
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    console.log('📤 [upload-presentation] Upload request received')
    console.log('📤 Token:', token)
    console.log('📤 Title:', title)
    console.log('📤 File:', file?.name, file?.size)

    // التحقق من البيانات المطلوبة
    if (!token || !file || !title) {
      return NextResponse.json({ 
        error: 'الرجاء إدخال جميع البيانات المطلوبة' 
      }, { status: 400 })
    }

    // البحث عن الـ token
    const uploadToken = await prisma.uploadToken.findUnique({
      where: { token },
      include: {
        participant: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        team: true,
        hackathon: true
      }
    })

    if (!uploadToken) {
      return NextResponse.json({ error: 'الرابط غير صحيح' }, { status: 404 })
    }

    // التحقق من انتهاء صلاحية الـ token
    if (new Date() > uploadToken.expiresAt) {
      return NextResponse.json({ error: 'انتهت صلاحية الرابط' }, { status: 410 })
    }

    // التحقق من استخدام الـ token
    if (uploadToken.used) {
      return NextResponse.json({ 
        error: 'تم استخدام هذا الرابط من قبل' 
      }, { status: 409 })
    }

    // التحقق من حجم الملف (10 ميجابايت)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'حجم الملف كبير جداً. الحد الأقصى المسموح 10 ميجابايت'
      }, { status: 400 })
    }

    // التحقق من نوع الملف
    const allowedTypes = [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/pdf'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'نوع الملف غير مدعوم. يرجى رفع ملف PowerPoint (.ppt, .pptx) أو PDF'
      }, { status: 400 })
    }

    console.log('✅ [upload-presentation] Validation passed')

    // رفع الملف على Cloudinary
    console.log('☁️ [upload-presentation] Uploading to Cloudinary...')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Date.now()
    const fileName = `team-${uploadToken.team.id}-${timestamp}`

    const cloudinaryResult = await uploadToCloudinary(buffer, 'presentations', fileName)

    console.log('✅ [upload-presentation] File uploaded to Cloudinary:', cloudinaryResult.url)

    // تحديث بيانات الفريق
    await prisma.team.update({
      where: { id: uploadToken.team.id },
      data: {
        ideaFile: cloudinaryResult.url,
        ideaTitle: title,
        ideaDescription: description || null
      }
    })

    console.log('✅ [upload-presentation] Team updated with presentation data')

    // تحديث الـ token كمستخدم
    await prisma.uploadToken.update({
      where: { id: uploadToken.id },
      data: {
        used: true,
        usedAt: new Date()
      }
    })

    console.log('✅ [upload-presentation] Token marked as used')

    return NextResponse.json({
      message: 'تم رفع العرض التقديمي بنجاح! 🎉',
      fileUrl: cloudinaryResult.url,
      team: {
        id: uploadToken.team.id,
        name: uploadToken.team.name
      },
      hackathon: {
        id: uploadToken.hackathon.id,
        title: uploadToken.hackathon.title
      }
    })

  } catch (error) {
    console.error('❌ [upload-presentation] Error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في رفع الملف' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

