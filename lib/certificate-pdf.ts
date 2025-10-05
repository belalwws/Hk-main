import { createCanvas, loadImage } from 'canvas'
import { DEFAULT_CERTIFICATE_CONFIG } from './certificate-config'
import fs from 'fs'
import path from 'path'
import { prisma } from './prisma'

export interface CertificateData {
  participantName: string
  hackathonTitle: string
  teamName: string
  rank: number
  isWinner: boolean
  totalScore?: number
  date?: string
}

export async function generateCertificatePDF(data: CertificateData, hackathonId?: string): Promise<Buffer> {
  try {
    console.log('🎨 Generating certificate PDF for:', data.participantName)

    // تحميل إعدادات الشهادة
    let settings = DEFAULT_CERTIFICATE_CONFIG
    let certificateImagePath = path.join(process.cwd(), 'public', 'row-certificat.png')
    
    try {
      // محاولة تحميل الإعدادات من قاعدة البيانات أولاً
      if (hackathonId) {
        try {
          // جرب قراءة القالب مباشرة من قاعدة البيانات أولاً
          const hackathon = await prisma.hackathon.findUnique({
            where: { id: hackathonId },
            select: { certificateTemplate: true }
          })
          
          if (hackathon?.certificateTemplate) {
            let templatePath = path.join(process.cwd(), 'public', hackathon.certificateTemplate.replace('/certificates/', ''))
            if (!fs.existsSync(templatePath)) {
              templatePath = path.join(process.cwd(), 'public', hackathon.certificateTemplate.replace('/', ''))
            }
            if (fs.existsSync(templatePath)) {
              certificateImagePath = templatePath
              console.log('✅ Using certificate template from hackathon table:', certificateImagePath)
            }
          }
          
          // ثم جرب تحميل الإعدادات من API
          const settingsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/hackathons/${hackathonId}/certificate-settings`, {
            cache: 'no-store'
          })
          if (settingsResponse.ok) {
            const dbSettings = await settingsResponse.json()
            settings = {
              ...DEFAULT_CERTIFICATE_CONFIG,
              ...dbSettings
            }
            
            // إذا كان هناك قالب مرفوع في الإعدادات ولم نجد واحداً من جدول الهاكاثون، استخدمه
            if (dbSettings.certificateTemplate && certificateImagePath === path.join(process.cwd(), 'public', 'row-certificat.png')) {
              let templatePath = path.join(process.cwd(), 'public', dbSettings.certificateTemplate.replace('/certificates/', ''))
              if (!fs.existsSync(templatePath)) {
                templatePath = path.join(process.cwd(), 'public', dbSettings.certificateTemplate.replace('/', ''))
              }
              if (fs.existsSync(templatePath)) {
                certificateImagePath = templatePath
                console.log('✅ Using uploaded certificate template from settings:', certificateImagePath)
              } else {
                console.log('⚠️ Certificate template not found:', templatePath)
              }
            }
          }
        } catch (dbError) {
          console.log('⚠️ Could not load settings from database, using file system')
        }
      }
      
      // إذا لم تنجح محاولة قاعدة البيانات، جرب ملف النظام
      if (certificateImagePath === path.join(process.cwd(), 'public', 'row-certificat.png')) {
        const settingsPath = path.join(process.cwd(), 'certificate-settings.json')
        if (fs.existsSync(settingsPath)) {
          const savedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
          settings = {
            ...DEFAULT_CERTIFICATE_CONFIG,
            ...savedSettings
          }
          
          // تحقق من وجود قالب مرفوع في الإعدادات
          if (savedSettings.certificateTemplate) {
            let templatePath = path.join(process.cwd(), 'public', savedSettings.certificateTemplate.replace('/certificates/', ''))
            if (!fs.existsSync(templatePath)) {
              // جرب المسار النسبي
              templatePath = path.join(process.cwd(), 'public', savedSettings.certificateTemplate.replace('/', ''))
            }
            if (fs.existsSync(templatePath)) {
              certificateImagePath = templatePath
              console.log('✅ Using certificate template from settings:', certificateImagePath)
            } else {
              console.log('⚠️ Certificate template not found:', templatePath)
            }
          }
        }
      }
    } catch (error) {
      console.log('Using default certificate settings')
    }

    console.log('🖼️ Loading certificate image from:', certificateImagePath)
    const image = await loadImage(certificateImagePath)

    // إنشاء canvas بحجم الصورة
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')

    // رسم صورة الشهادة الأساسية
    ctx.drawImage(image, 0, 0)

    // إعداد النص
    ctx.textAlign = 'center'
    ctx.fillStyle = settings.nameColor || '#000000'
    ctx.font = settings.nameFont || '48px Arial'

    // حساب موقع النص
    const nameX = canvas.width * (settings.namePositionX || 0.5)
    const nameY = canvas.height * (settings.namePositionY || 0.5)

    // رسم اسم المشارك
    ctx.fillText(data.participantName, nameX, nameY)

    // تحويل Canvas إلى Buffer
    const buffer = canvas.toBuffer('image/png')
    
    console.log('✅ Certificate PDF generated successfully')
    return buffer

  } catch (error) {
    console.error('❌ Error generating certificate PDF:', error)
    throw new Error('فشل في إنشاء شهادة PDF')
  }
}

export async function generateCertificateImage(data: CertificateData, hackathonId?: string): Promise<Buffer> {
  try {
    console.log('🖼️ Generating certificate image for:', data.participantName)

    // تحميل إعدادات الشهادة
    let settings = DEFAULT_CERTIFICATE_CONFIG
    let certificateImagePath = path.join(process.cwd(), 'public', 'row-certificat.png')
    
    try {
      // محاولة تحميل الإعدادات من قاعدة البيانات أولاً
      if (hackathonId) {
        try {
          // جرب قراءة القالب مباشرة من قاعدة البيانات أولاً
          const hackathon = await prisma.hackathon.findUnique({
            where: { id: hackathonId },
            select: { certificateTemplate: true }
          })
          
          if (hackathon?.certificateTemplate) {
            let templatePath = path.join(process.cwd(), 'public', hackathon.certificateTemplate.replace('/certificates/', ''))
            if (!fs.existsSync(templatePath)) {
              templatePath = path.join(process.cwd(), 'public', hackathon.certificateTemplate.replace('/', ''))
            }
            if (fs.existsSync(templatePath)) {
              certificateImagePath = templatePath
              console.log('✅ Using certificate template from hackathon table:', certificateImagePath)
            }
          }
          
          // ثم جرب تحميل الإعدادات من API
          const settingsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/hackathons/${hackathonId}/certificate-settings`, {
            cache: 'no-store'
          })
          if (settingsResponse.ok) {
            const dbSettings = await settingsResponse.json()
            settings = {
              ...DEFAULT_CERTIFICATE_CONFIG,
              ...dbSettings
            }
            
            // إذا كان هناك قالب مرفوع في الإعدادات ولم نجد واحداً من جدول الهاكاثون، استخدمه
            if (dbSettings.certificateTemplate && certificateImagePath === path.join(process.cwd(), 'public', 'row-certificat.png')) {
              let templatePath = path.join(process.cwd(), 'public', dbSettings.certificateTemplate.replace('/certificates/', ''))
              if (!fs.existsSync(templatePath)) {
                templatePath = path.join(process.cwd(), 'public', dbSettings.certificateTemplate.replace('/', ''))
              }
              if (fs.existsSync(templatePath)) {
                certificateImagePath = templatePath
                console.log('✅ Using uploaded certificate template from settings:', certificateImagePath)
              } else {
                console.log('⚠️ Certificate template not found:', templatePath)
              }
            }
          }
        } catch (dbError) {
          console.log('⚠️ Could not load settings from database, using file system')
        }
      }
      
      // إذا لم تنجح محاولة قاعدة البيانات، جرب ملف النظام
      if (certificateImagePath === path.join(process.cwd(), 'public', 'row-certificat.png')) {
        const settingsPath = path.join(process.cwd(), 'certificate-settings.json')
        if (fs.existsSync(settingsPath)) {
          const savedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
          settings = {
            ...DEFAULT_CERTIFICATE_CONFIG,
            ...savedSettings
          }
          
          // تحقق من وجود قالب مرفوع في الإعدادات
          if (savedSettings.certificateTemplate) {
            let templatePath = path.join(process.cwd(), 'public', savedSettings.certificateTemplate.replace('/certificates/', ''))
            if (!fs.existsSync(templatePath)) {
              // جرب المسار النسبي
              templatePath = path.join(process.cwd(), 'public', savedSettings.certificateTemplate.replace('/', ''))
            }
            if (fs.existsSync(templatePath)) {
              certificateImagePath = templatePath
              console.log('✅ Using certificate template from settings:', certificateImagePath)
            } else {
              console.log('⚠️ Certificate template not found:', templatePath)
            }
          }
        }
      }
    } catch (error) {
      console.log('Using default certificate settings')
    }

    console.log('🖼️ Loading certificate image from:', certificateImagePath)
    const image = await loadImage(certificateImagePath)

    // إنشاء canvas بحجم الصورة
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')

    // رسم صورة الشهادة الأساسية
    ctx.drawImage(image, 0, 0)

    // إعداد النص
    ctx.textAlign = 'center'
    ctx.fillStyle = settings.nameColor || '#000000'
    ctx.font = settings.nameFont || '48px Arial'

    // حساب موقع النص
    const nameX = canvas.width * (settings.namePositionX || 0.5)
    const nameY = canvas.height * (settings.namePositionY || 0.5)

    // رسم اسم المشارك
    ctx.fillText(data.participantName, nameX, nameY)

    // تحويل Canvas إلى Buffer
    const buffer = canvas.toBuffer('image/png')
    
    console.log('✅ Certificate image generated successfully')
    return buffer

  } catch (error) {
    console.error('❌ Error generating certificate image:', error)
    throw new Error('فشل في إنشاء صورة الشهادة')
  }
}
