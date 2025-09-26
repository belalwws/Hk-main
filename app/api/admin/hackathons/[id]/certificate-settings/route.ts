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
    let settings = []
    try {
      settings = await prisma.$queryRaw`
        SELECT * FROM certificate_settings
        WHERE id = ${hackathonId}
        ORDER BY "createdAt" DESC
        LIMIT 1
      ` as any[]
    } catch (dbError) {
      console.log('Certificate settings table might not exist, using defaults')
      settings = []
    }

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
      if (setting.settings) {
        const parsed = typeof setting.settings === 'string' ? JSON.parse(setting.settings) : setting.settings
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

    // Save settings to database using Prisma model
    try {
      await prisma.globalSettings.upsert({
        where: { key: `certificate_settings_${hackathonId}` },
        update: {
          value: settingsData,
          updatedAt: new Date()
        },
        create: {
          key: `certificate_settings_${hackathonId}`,
          value: settingsData,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    } catch (upsertError) {
      console.error('Error upserting certificate settings:', upsertError)
      // Fallback to raw SQL if needed
      await prisma.$executeRaw`
        INSERT INTO certificate_settings (id, settings, "createdAt", "updatedAt")
        VALUES (${hackathonId}, ${JSON.stringify(settingsData)}, NOW(), NOW())
        ON CONFLICT (id)
        DO UPDATE SET
          settings = ${JSON.stringify(settingsData)},
          "updatedAt" = NOW()
      `
    }

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
