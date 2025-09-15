import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
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
    const file = formData.get('certificateImage') as File

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

    // Validate file size (max 4MB)
    const maxSize = 4 * 1024 * 1024 // 4MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'حجم الملف كبير جداً. الحد الأقصى المسموح 4 ميجابايت' 
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
    const fileName = `default-certificate-${timestamp}${fileExtension}`
    const filePath = path.join(certificatesDir, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

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
