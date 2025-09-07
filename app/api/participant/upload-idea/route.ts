import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Participant upload idea request received')
    
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      console.log('❌ No auth token found')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      console.log('❌ Invalid token')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    console.log('✅ User authenticated:', payload.userId, payload.email)

    // البحث عن فريق المستخدم
    const participant = await prisma.participant.findFirst({
      where: {
        userId: payload.userId,
        status: 'APPROVED'
      },
      include: {
        team: true,
        user: true
      }
    })

    if (!participant || !participant.team) {
      console.log('❌ User is not member of any team')
      return NextResponse.json({ error: 'لست عضواً في أي فريق' }, { status: 403 })
    }

    console.log('✅ User team found:', participant.team.name, participant.team.id)

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file || !title) {
      return NextResponse.json({ error: 'الملف وعنوان الفكرة مطلوبان' }, { status: 400 })
    }

    console.log('📁 File details:', file.name, file.type, file.size)

    // Validate file type
    const allowedTypes = [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/pdf'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'نوع الملف غير مدعوم. يجب أن يكون PowerPoint أو PDF' 
      }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const fileName = `team-${participant.team.id}-${timestamp}${fileExtension}`
    const filePath = path.join(uploadsDir, fileName)

    console.log('💾 Saving file to:', filePath)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Update team in database
    await prisma.team.update({
      where: { id: participant.team.id },
      data: {
        ideaFile: fileName,
        ideaTitle: title,
        ideaDescription: description || null
      }
    })

    console.log('✅ File uploaded successfully:', fileName)

    return NextResponse.json({
      message: 'تم رفع العرض التقديمي بنجاح',
      fileName: fileName,
      teamId: participant.team.id,
      teamName: participant.team.name
    })

  } catch (error) {
    console.error('💥 Error uploading idea file:', error)
    return NextResponse.json({ error: 'خطأ في رفع الملف' }, { status: 500 })
  }
}
