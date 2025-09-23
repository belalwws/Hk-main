import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/hackathons/[id]/certificate-settings - Get certificate settings for specific hackathon
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId } = params

    // Check if hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Try to get existing certificate settings for this hackathon
    let settings = await prisma.$queryRaw`
      SELECT * FROM certificate_settings 
      WHERE hackathon_id = ${hackathonId}
      ORDER BY created_at DESC 
      LIMIT 1
    ` as any[]

    if (settings.length === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        namePositionY: 0.52,
        namePositionX: 0.50,
        nameFont: 'bold 48px Arial',
        nameColor: '#1a472a',
        hackathonId: hackathonId
      })
    }

    const setting = settings[0]
    let parsedSettings = {
      namePositionY: 0.52,
      namePositionX: 0.50,
      nameFont: 'bold 48px Arial',
      nameColor: '#1a472a',
      hackathonId: hackathonId
    }

    try {
      if (setting.settings_data) {
        const parsed = JSON.parse(setting.settings_data)
        parsedSettings = { ...parsedSettings, ...parsed }
      }
    } catch (parseError) {
      console.error('Error parsing certificate settings:', parseError)
    }

    return NextResponse.json(parsedSettings)

  } catch (error) {
    console.error('Error loading certificate settings:', error)
    return NextResponse.json({ error: 'خطأ في تحميل إعدادات الشهادة' }, { status: 500 })
  }
}

// POST /api/admin/hackathons/[id]/certificate-settings - Save certificate settings for specific hackathon
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId } = params
    const body = await request.json()

    // Check if hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    const {
      namePositionY,
      namePositionX,
      nameFont,
      nameColor,
      certificateTemplate,
      updatedBy
    } = body

    // Validate required fields
    if (namePositionY === undefined || namePositionX === undefined || !nameFont || !nameColor) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    const settingsData = {
      namePositionY: parseFloat(namePositionY),
      namePositionX: parseFloat(namePositionX),
      nameFont,
      nameColor,
      certificateTemplate,
      hackathonId,
      lastUpdated: new Date().toISOString(),
      updatedBy: updatedBy || 'admin'
    }

    // Save settings to database
    await prisma.$executeRaw`
      INSERT INTO certificate_settings (hackathon_id, settings_data, updated_by, created_at, updated_at)
      VALUES (${hackathonId}, ${JSON.stringify(settingsData)}, ${updatedBy || 'admin'}, NOW(), NOW())
      ON CONFLICT (hackathon_id) 
      DO UPDATE SET 
        settings_data = ${JSON.stringify(settingsData)},
        updated_by = ${updatedBy || 'admin'},
        updated_at = NOW()
    `

    console.log('✅ Certificate settings saved for hackathon:', hackathonId)

    return NextResponse.json({
      message: 'تم حفظ إعدادات الشهادة بنجاح',
      settings: settingsData
    })

  } catch (error) {
    console.error('Error saving certificate settings:', error)
    return NextResponse.json({ error: 'خطأ في حفظ إعدادات الشهادة' }, { status: 500 })
  }
}
