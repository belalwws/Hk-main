import { NextRequest, NextResponse } from 'next/server'
import { generateCertificateImage, CertificateData } from '@/lib/certificate-pdf'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test certificate generation request received')

    const body = await request.json()
    const { participantName, hackathonTitle, teamName, rank, isWinner } = body

    if (!participantName || !hackathonTitle) {
      return NextResponse.json({ error: 'اسم المشارك واسم الهاكاثون مطلوبان' }, { status: 400 })
    }

    console.log('🎨 Generating test certificate for:', participantName)

    const certificateData: CertificateData = {
      participantName,
      hackathonTitle,
      teamName: teamName || 'فريق تجريبي',
      rank: rank || 1,
      isWinner: isWinner || false,
      date: new Date().toLocaleDateString('ar-SA')
    }

    const certificateBuffer = await generateCertificateImage(certificateData)

    console.log('✅ Test certificate generated successfully')

    return new NextResponse(certificateBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="test-certificate-${participantName.replace(/\s+/g, '-')}.png"`
      }
    })

  } catch (error) {
    console.error('❌ Error generating test certificate:', error)
    return NextResponse.json({ error: 'فشل في إنشاء الشهادة التجريبية' }, { status: 500 })
  }
}
