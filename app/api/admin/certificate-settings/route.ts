import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

const SETTINGS_FILE = join(process.cwd(), 'certificate-settings.json')

interface CertificateSettings {
  namePositionY: number  // موضع عمودي (أعلى/أسفل)
  namePositionX: number  // موضع أفقي (يمين/شمال)
  nameFont: string
  nameColor: string
  certificateTemplate?: string  // مسار قالب الشهادة المخصص
  lastUpdated: string
  updatedBy: string
}

const defaultSettings: CertificateSettings = {
  namePositionY: 0.52,   // 52% من الارتفاع
  namePositionX: 0.50,   // 50% من العرض (وسط)
  nameFont: 'bold 48px Arial',
  nameColor: '#1a472a',
  lastUpdated: new Date().toISOString(),
  updatedBy: 'system'
}

// GET - جلب الإعدادات الحالية
export async function GET() {
  try {
    const data = await readFile(SETTINGS_FILE, 'utf8')
    const settings = JSON.parse(data)
    return NextResponse.json(settings)
  } catch (error) {
    // إذا لم يوجد الملف، أرجع الإعدادات الافتراضية
    return NextResponse.json(defaultSettings)
  }
}

// POST - حفظ إعدادات جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { namePositionY, namePositionX, nameFont, nameColor, certificateTemplate, updatedBy } = body

    // التحقق من صحة البيانات
    if (typeof namePositionY !== 'number' || namePositionY < 0 || namePositionY > 1) {
      return NextResponse.json(
        { error: 'الموضع العمودي يجب أن يكون رقم بين 0 و 1' },
        { status: 400 }
      )
    }

    if (typeof namePositionX !== 'number' || namePositionX < 0 || namePositionX > 1) {
      return NextResponse.json(
        { error: 'الموضع الأفقي يجب أن يكون رقم بين 0 و 1' },
        { status: 400 }
      )
    }

    const newSettings: CertificateSettings = {
      namePositionY,
      namePositionX,
      nameFont: nameFont || defaultSettings.nameFont,
      nameColor: nameColor || defaultSettings.nameColor,
      certificateTemplate: certificateTemplate || undefined,
      lastUpdated: new Date().toISOString(),
      updatedBy: updatedBy || 'admin'
    }

    // حفظ الإعدادات في ملف
    await writeFile(SETTINGS_FILE, JSON.stringify(newSettings, null, 2))

    return NextResponse.json({
      success: true,
      message: 'تم حفظ إعدادات الشهادة بنجاح',
      settings: newSettings
    })

  } catch (error) {
    console.error('Error saving certificate settings:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في حفظ الإعدادات' },
      { status: 500 }
    )
  }
}
