import { createCanvas, loadImage } from 'canvas'
import { DEFAULT_CERTIFICATE_CONFIG } from './certificate-config'
import fs from 'fs'
import path from 'path'

export interface CertificateData {
  participantName: string
  hackathonTitle: string
  teamName: string
  rank: number
  isWinner: boolean
  totalScore?: number
  date?: string
}

export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  try {
    console.log('🎨 Generating certificate PDF for:', data.participantName)

    // تحميل إعدادات الشهادة
    let settings = DEFAULT_CERTIFICATE_CONFIG
    try {
      const settingsPath = path.join(process.cwd(), 'certificate-settings.json')
      if (fs.existsSync(settingsPath)) {
        const savedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
        settings = {
          ...DEFAULT_CERTIFICATE_CONFIG,
          ...savedSettings
        }
      }
    } catch (error) {
      console.log('Using default certificate settings')
    }

    // تحميل صورة الشهادة
    const certificateImagePath = path.join(process.cwd(), 'public', 'row-certificat.png')
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

export async function generateCertificateImage(data: CertificateData): Promise<Buffer> {
  try {
    console.log('🖼️ Generating certificate image for:', data.participantName)

    // تحميل إعدادات الشهادة
    let settings = DEFAULT_CERTIFICATE_CONFIG
    try {
      const settingsPath = path.join(process.cwd(), 'certificate-settings.json')
      if (fs.existsSync(settingsPath)) {
        const savedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
        settings = {
          ...DEFAULT_CERTIFICATE_CONFIG,
          ...savedSettings
        }
      }
    } catch (error) {
      console.log('Using default certificate settings')
    }

    // تحميل صورة الشهادة
    const certificateImagePath = path.join(process.cwd(), 'public', 'row-certificat.png')
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
