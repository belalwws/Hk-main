import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface JWTPayload {
  userId: string
  role: string
  email: string
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })
    }

    let payload: JWTPayload
    try {
      payload = jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
      return NextResponse.json({ message: 'رمز غير صالح' }, { status: 401 })
    }

    // Check if user is supervisor or admin
    if (!['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
    }

    // Get the file from the request
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ message: 'لم يتم اختيار ملف' }, { status: 400 })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'حجم الملف يجب أن يكون أقل من 5 ميجابايت' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
    const allowedDocTypes = ['application/pdf']
    const allowedTypes = [...allowedImageTypes, ...allowedDocTypes]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'نوع الملف غير مدعوم. الملفات المدعومة: JPG, PNG, GIF, WEBP, PDF' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determine resource type and folder
    const isImage = allowedImageTypes.includes(file.type)
    const resourceType = isImage ? 'image' : 'raw'
    const folder = isImage ? 'email-attachments/images' : 'email-attachments/documents'

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: folder,
          format: isImage ? undefined : 'pdf',
          public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, '')}`, // Remove extension
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    // Return the secure URL
    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      size: uploadResult.bytes,
      type: file.type,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ أثناء رفع الملف', error: error.message },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
