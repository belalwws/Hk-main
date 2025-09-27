import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadFile } from '@/lib/storage'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params

    // Verify admin authentication
    console.log('🔐 Checking authentication...')

    // Try to get token from Authorization header first, then cookies
    let token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      token = request.cookies.get('auth-token')?.value
    }

    if (!token) {
      console.log('❌ No token found in headers or cookies')
      return NextResponse.json({ error: 'غير مصرح - لا يوجد token' }, { status: 401 })
    }

    console.log('✅ Token found, verifying...')
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      console.log('❌ Token verification failed or not admin')
      return NextResponse.json({ error: 'غير مصرح - صلاحيات غير كافية' }, { status: 401 })
    }

    console.log('✅ Admin authentication successful')

    console.log('📥 Processing form data...')
    const formData = await request.formData()
    console.log('📋 Form data keys:', Array.from(formData.keys()))

    const file = formData.get('certificateTemplate') as File

    if (!file) {
      console.log('❌ No file provided in form data')
      return NextResponse.json({ error: 'ملف الشهادة مطلوب' }, { status: 400 })
    }

    console.log('📁 File received:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    })

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'نوع الملف غير مدعوم. يجب أن يكون صورة (JPG, PNG, WebP)' 
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'png'
    const fileName = `hackathon-${hackathonId}-${timestamp}.${fileExtension}`

    // Upload file using smart storage
    console.log('🔄 Converting file to buffer...')
    let bytes: ArrayBuffer
    let buffer: Buffer

    try {
      bytes = await file.arrayBuffer()
      buffer = Buffer.from(bytes)
      console.log('✅ Buffer conversion successful:', buffer.length, 'bytes')
    } catch (error) {
      console.error('❌ Buffer conversion failed:', error)
      throw new Error('فشل في تحويل الملف: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'))
    }

    console.log('📤 Uploading certificate:', {
      fileName,
      bufferSize: buffer.length,
      fileType: file.type,
      folder: 'certificates'
    })

    let uploadResult: any
    try {
      uploadResult = await uploadFile(buffer, fileName, file.type, 'certificates')
      console.log('📊 Upload result:', {
        success: uploadResult.success,
        url: uploadResult.url,
        error: uploadResult.error
      })
    } catch (error) {
      console.error('❌ Upload function threw error:', error)
      throw new Error('فشل في استدعاء دالة الرفع: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'))
    }

    if (!uploadResult.success) {
      console.error('❌ Upload failed:', uploadResult.error)
      return NextResponse.json({
        error: 'فشل في رفع الملف: ' + uploadResult.error
      }, { status: 500 })
    }

    console.log('✅ Upload successful:', uploadResult.url)

    // Update hackathon in database with the uploaded URL
    console.log('💾 Saving to database:', {
      hackathonId,
      url: uploadResult.url
    })

    try {
      await prisma.hackathon.update({
        where: { id: hackathonId },
        data: {
          certificateTemplate: uploadResult.url
        }
      })
      console.log('✅ Certificate template saved to database successfully')
    } catch (error) {
      console.error('❌ Database save failed:', error)
      throw new Error('فشل في حفظ البيانات: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'))
    }

    return NextResponse.json({
      message: 'تم رفع قالب الشهادة بنجاح',
      fileName: fileName,
      filePath: uploadResult.url,
      storage: uploadResult.url?.startsWith('https://') ? 'S3' : 'Local'
    })

  } catch (error: any) {
    console.error('❌ Error uploading certificate template:', error)
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })

    return NextResponse.json({
      error: 'خطأ في رفع قالب الشهادة: ' + (error.message || 'خطأ غير معروف'),
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

// GET - Get current certificate template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { certificateTemplate: true, title: true }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    return NextResponse.json({
      certificateTemplate: hackathon.certificateTemplate,
      templatePath: hackathon.certificateTemplate || '/row-certificat.png',
      hackathonTitle: hackathon.title
    })

  } catch (error) {
    console.error('Error getting certificate template:', error)
    return NextResponse.json({ error: 'خطأ في جلب قالب الشهادة' }, { status: 500 })
  }
}

// DELETE - Remove certificate template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params

    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Update hackathon to remove certificate template
    await prisma.hackathon.update({
      where: { id: hackathonId },
      data: {
        certificateTemplate: null
      }
    })

    return NextResponse.json({
      message: 'تم حذف قالب الشهادة بنجاح'
    })

  } catch (error) {
    console.error('Error deleting certificate template:', error)
    return NextResponse.json({ error: 'خطأ في حذف قالب الشهادة' }, { status: 500 })
  }
}
