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
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('certificateTemplate') as File

    if (!file) {
      return NextResponse.json({ error: 'ملف الشهادة مطلوب' }, { status: 400 })
    }

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
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('📤 Uploading certificate:', fileName, 'Size:', buffer.length)
    const uploadResult = await uploadFile(buffer, fileName, file.type, 'certificates')

    if (!uploadResult.success) {
      console.error('❌ Upload failed:', uploadResult.error)
      return NextResponse.json({
        error: 'فشل في رفع الملف: ' + uploadResult.error
      }, { status: 500 })
    }

    console.log('✅ Upload successful:', uploadResult.url)

    // Update hackathon in database with the uploaded URL
    await prisma.hackathon.update({
      where: { id: hackathonId },
      data: {
        certificateTemplate: uploadResult.url
      }
    })

    console.log('✅ Certificate template saved to database:', uploadResult.url)

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
