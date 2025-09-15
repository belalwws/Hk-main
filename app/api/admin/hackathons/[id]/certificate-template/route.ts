import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'

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

    // Create certificates directory if it doesn't exist
    const certificatesDir = path.join(process.cwd(), 'public', 'certificates')
    try {
      await mkdir(certificatesDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const fileName = `hackathon-${hackathonId}-${timestamp}${fileExtension}`
    const filePath = path.join(certificatesDir, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Update hackathon in database
    await prisma.hackathon.update({
      where: { id: hackathonId },
      data: {
        certificateTemplate: fileName
      }
    })

    return NextResponse.json({
      message: 'تم رفع قالب الشهادة بنجاح',
      fileName: fileName,
      filePath: `/certificates/${fileName}`
    })

  } catch (error) {
    console.error('Error uploading certificate template:', error)
    return NextResponse.json({ error: 'خطأ في رفع قالب الشهادة' }, { status: 500 })
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
      templatePath: hackathon.certificateTemplate ? `/certificates/${hackathon.certificateTemplate}` : null,
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
