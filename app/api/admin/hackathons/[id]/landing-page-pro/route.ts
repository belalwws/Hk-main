import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface FileItem {
  id: string
  name: string
  type: 'html' | 'css' | 'js' | 'json'
  content: string
  isMain?: boolean
}

interface LandingPageProData {
  hackathonId: string
  isEnabled: boolean
  files: FileItem[]
  settings: {
    title?: string
    description?: string
    customDomain?: string
    seoTitle?: string
    seoDescription?: string
  }
}

// GET - جلب بيانات Landing Page Pro
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log('🔍 Fetching pro landing page for hackathon:', resolvedParams.id)

    const landingPage = await prisma.hackathonLandingPage.findUnique({
      where: { hackathonId: resolvedParams.id }
    })

    if (!landingPage) {
      return NextResponse.json({
        hackathonId: resolvedParams.id,
        isEnabled: false,
        files: [],
        settings: {}
      })
    }

    // Parse files from stored data
    let files: FileItem[] = []
    try {
      // Try to parse from new format first
      if (landingPage.htmlContent && landingPage.htmlContent.startsWith('[')) {
        files = JSON.parse(landingPage.htmlContent)
      } else {
        // Convert from old format
        files = [
          {
            id: 'main-html',
            name: 'index.html',
            type: 'html',
            content: landingPage.htmlContent || '',
            isMain: true
          }
        ]
        
        if (landingPage.cssContent) {
          files.push({
            id: 'main-css',
            name: 'styles.css',
            type: 'css',
            content: landingPage.cssContent
          })
        }
        
        if (landingPage.jsContent) {
          files.push({
            id: 'main-js',
            name: 'script.js',
            type: 'js',
            content: landingPage.jsContent
          })
        }
      }
    } catch (error) {
      console.error('Error parsing files:', error)
      files = []
    }

    const settings = {
      title: landingPage.seoTitle,
      description: landingPage.seoDescription,
      customDomain: landingPage.customDomain
    }

    return NextResponse.json({
      hackathonId: resolvedParams.id,
      isEnabled: landingPage.isEnabled,
      files,
      settings
    })

  } catch (error) {
    console.error('❌ Error fetching pro landing page:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

// POST - حفظ أو تحديث Landing Page Pro
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const data: LandingPageProData = await request.json()

    console.log('💾 Saving pro landing page for hackathon:', resolvedParams.id)
    console.log('📝 Data received:', {
      filesCount: data.files?.length || 0,
      isEnabled: data.isEnabled,
      settings: data.settings
    })

    // التحقق من وجود الهاكاثون
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Store files as JSON in htmlContent field
    const filesJson = JSON.stringify(data.files || [])
    
    // Extract main HTML file for backward compatibility
    const mainHtmlFile = data.files?.find(f => f.isMain)
    const mainCssFile = data.files?.find(f => f.type === 'css')
    const mainJsFile = data.files?.find(f => f.type === 'js')

    // حفظ أو تحديث Landing Page
    const landingPage = await prisma.hackathonLandingPage.upsert({
      where: { hackathonId: resolvedParams.id },
      update: {
        isEnabled: data.isEnabled,
        customDomain: data.settings?.customDomain,
        htmlContent: filesJson, // Store all files as JSON
        cssContent: mainCssFile?.content || '', // Keep for backward compatibility
        jsContent: mainJsFile?.content || '', // Keep for backward compatibility
        seoTitle: data.settings?.seoTitle,
        seoDescription: data.settings?.seoDescription,
        template: 'pro',
        updatedAt: new Date()
      },
      create: {
        hackathonId: resolvedParams.id,
        isEnabled: data.isEnabled,
        customDomain: data.settings?.customDomain,
        htmlContent: filesJson,
        cssContent: mainCssFile?.content || '',
        jsContent: mainJsFile?.content || '',
        seoTitle: data.settings?.seoTitle,
        seoDescription: data.settings?.seoDescription,
        template: 'pro'
      }
    })

    console.log('✅ Pro landing page saved successfully:', {
      id: landingPage.id,
      filesCount: data.files?.length || 0
    })

    return NextResponse.json({
      success: true,
      message: 'تم حفظ الصفحة بنجاح',
      landingPage: {
        id: landingPage.id,
        hackathonId: landingPage.hackathonId,
        isEnabled: landingPage.isEnabled,
        files: data.files,
        settings: data.settings
      }
    })

  } catch (error) {
    console.error('❌ Error saving pro landing page:', error)
    return NextResponse.json({ error: 'خطأ في حفظ البيانات' }, { status: 500 })
  }
}

// DELETE - حذف Landing Page Pro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log('🗑️ Deleting pro landing page for hackathon:', resolvedParams.id)

    await prisma.hackathonLandingPage.delete({
      where: { hackathonId: resolvedParams.id }
    })

    console.log('✅ Pro landing page deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'تم حذف الصفحة بنجاح'
    })

  } catch (error) {
    console.error('❌ Error deleting pro landing page:', error)
    return NextResponse.json({ error: 'خطأ في حذف البيانات' }, { status: 500 })
  }
}
