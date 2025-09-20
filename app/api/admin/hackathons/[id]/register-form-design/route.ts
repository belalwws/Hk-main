import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// إنشاء جدول تصميم الفورم إذا لم يكن موجوداً
async function ensureFormDesignTable() {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS hackathon_form_designs (
        id TEXT PRIMARY KEY,
        hackathonId TEXT NOT NULL,
        isEnabled BOOLEAN DEFAULT false,
        template TEXT DEFAULT 'modern',
        htmlContent TEXT,
        cssContent TEXT,
        jsContent TEXT,
        settings TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hackathonId) REFERENCES hackathons (id) ON DELETE CASCADE
      )
    `
    console.log('✅ Form design table ensured')
  } catch (error) {
    console.log('ℹ️ Form design table already exists or error:', error)
  }
}

// GET - جلب تصميم الفورم
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureFormDesignTable()

    const resolvedParams = await params
    console.log('🔍 Fetching form design for hackathon:', resolvedParams.id)

    const design = await prisma.$queryRaw`
      SELECT * FROM hackathon_form_designs
      WHERE hackathonId = ${resolvedParams.id}
    ` as any[]

    if (design.length === 0) {
      console.log('⚠️ No form design found, returning default')
      return NextResponse.json({
        design: {
          hackathonId: resolvedParams.id,
          isEnabled: true,
          template: 'modern',
          htmlContent: '',
          cssContent: '',
          jsContent: '',
          settings: {
            theme: 'modern',
            backgroundColor: '#f8f9fa',
            primaryColor: '#01645e',
            secondaryColor: '#667eea',
            fontFamily: 'Cairo',
            borderRadius: '12px',
            showHackathonInfo: true,
            showProgressBar: true,
            enableAnimations: true
          }
        }
      })
    }

    const formDesign = design[0]
    
    // Parse settings JSON
    let settings = {}
    try {
      settings = JSON.parse(formDesign.settings || '{}')
    } catch (e) {
      console.log('⚠️ Error parsing settings, using defaults')
      settings = {
        theme: 'modern',
        backgroundColor: '#f8f9fa',
        primaryColor: '#01645e',
        secondaryColor: '#667eea',
        fontFamily: 'Cairo',
        borderRadius: '12px',
        showHackathonInfo: true,
        showProgressBar: true,
        enableAnimations: true
      }
    }

    console.log('✅ Form design found:', {
      id: formDesign.id,
      enabled: formDesign.isEnabled,
      template: formDesign.template,
      htmlLength: formDesign.htmlContent?.length || 0
    })

    return NextResponse.json({
      design: {
        id: formDesign.id,
        hackathonId: formDesign.hackathonId,
        isEnabled: Boolean(formDesign.isEnabled),
        template: formDesign.template,
        htmlContent: formDesign.htmlContent || '',
        cssContent: formDesign.cssContent || '',
        jsContent: formDesign.jsContent || '',
        settings
      }
    })

  } catch (error) {
    console.error('❌ Error fetching form design:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

// POST - حفظ أو تحديث تصميم الفورم
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureFormDesignTable()
    const data = await request.json()
    const resolvedParams = await params

    console.log('💾 Saving form design for hackathon:', resolvedParams.id)
    console.log('📝 Data received:', {
      htmlLength: data.htmlContent?.length || 0,
      cssLength: data.cssContent?.length || 0,
      jsLength: data.jsContent?.length || 0,
      isEnabled: data.isEnabled,
      template: data.template
    })

    // التحقق من وجود الهاكاثون
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // تحويل settings إلى JSON string
    const settingsJson = JSON.stringify(data.settings || {})
    
    // التحقق من وجود تصميم سابق
    const existingDesign = await prisma.$queryRaw`
      SELECT id FROM hackathon_form_designs
      WHERE hackathonId = ${resolvedParams.id}
    ` as any[]

    let formDesign
    
    if (existingDesign.length > 0) {
      // تحديث التصميم الموجود
      console.log('🔄 Updating existing form design')
      await prisma.$executeRaw`
        UPDATE hackathon_form_designs 
        SET 
          isEnabled = ${data.isEnabled},
          template = ${data.template},
          htmlContent = ${data.htmlContent},
          cssContent = ${data.cssContent},
          jsContent = ${data.jsContent},
          settings = ${settingsJson},
          updatedAt = CURRENT_TIMESTAMP
        WHERE hackathonId = ${resolvedParams.id}
      `
      
      formDesign = { id: existingDesign[0].id, ...data }
    } else {
      // إنشاء تصميم جديد
      console.log('➕ Creating new form design')
      const newId = `form_design_${Date.now()}`
      
      await prisma.$executeRaw`
        INSERT INTO hackathon_form_designs 
        (id, hackathonId, isEnabled, template, htmlContent, cssContent, jsContent, settings)
        VALUES (${newId}, ${resolvedParams.id}, ${data.isEnabled}, ${data.template},
                ${data.htmlContent}, ${data.cssContent}, ${data.jsContent}, ${settingsJson})
      `
      
      formDesign = { id: newId, ...data }
    }

    console.log('✅ Form design saved successfully:', {
      id: formDesign.id,
      htmlLength: formDesign.htmlContent?.length || 0
    })

    return NextResponse.json({
      success: true,
      message: 'تم حفظ تصميم الفورم بنجاح',
      design: formDesign
    })

  } catch (error) {
    console.error('❌ Error saving form design:', error)
    return NextResponse.json({ error: 'خطأ في حفظ البيانات' }, { status: 500 })
  }
}

// DELETE - حذف تصميم الفورم
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureFormDesignTable()
    const resolvedParams = await params

    console.log('🗑️ Deleting form design for hackathon:', resolvedParams.id)

    await prisma.$executeRaw`
      DELETE FROM hackathon_form_designs
      WHERE hackathonId = ${resolvedParams.id}
    `

    console.log('✅ Form design deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'تم حذف تصميم الفورم بنجاح'
    })

  } catch (error) {
    console.error('❌ Error deleting form design:', error)
    return NextResponse.json({ error: 'خطأ في حذف البيانات' }, { status: 500 })
  }
}
