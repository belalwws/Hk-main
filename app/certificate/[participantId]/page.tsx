'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Download, Printer, Share } from 'lucide-react'
import { drawCertificateText, DEFAULT_CERTIFICATE_CONFIG } from '@/lib/certificate-config'

interface ParticipantData {
  name: string
  email: string
  hackathonTitle: string
  teamName: string
  rank: number
  isWinner: boolean
  totalScore: number
}

export default function CertificatePage() {
  const params = useParams()
  const participantId = params.participantId as string
  const [participant, setParticipant] = useState<ParticipantData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (participantId) {
      fetchParticipantData()
    }
  }, [participantId])

  const fetchParticipantData = async () => {
    try {
      const response = await fetch(`/api/participants/${participantId}/certificate`)
      if (response.ok) {
        const data = await response.json()
        setParticipant(data)
      } else {
        setError('لم يتم العثور على بيانات المشارك')
      }
    } catch (error) {
      console.error('Error fetching participant data:', error)
      setError('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const downloadCertificate = async () => {
    if (!participant) return

    // Load current settings
    let currentSettings = DEFAULT_CERTIFICATE_CONFIG
    try {
      const response = await fetch('/api/admin/certificate-settings')
      if (response.ok) {
        const data = await response.json()
        currentSettings = {
          ...DEFAULT_CERTIFICATE_CONFIG,
          namePositionY: data.namePositionY || data.namePosition || DEFAULT_CERTIFICATE_CONFIG.namePositionY,
          namePositionX: data.namePositionX || DEFAULT_CERTIFICATE_CONFIG.namePositionX,
          nameFont: data.nameFont,
          nameColor: data.nameColor
        }
      }
    } catch (error) {
      console.error('Error loading settings for download:', error)
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw the base certificate image
      ctx.drawImage(img, 0, 0)

      // Draw certificate text using helper function with current settings
      drawCertificateText(ctx, canvas, {
        participantName: participant.name,
        hackathonTitle: participant.hackathonTitle,
        date: participant.date || new Date().toLocaleDateString('ar-SA'),
        rank: participant.rank,
        isWinner: participant.isWinner
      }, currentSettings)

      // Download the certificate
      const link = document.createElement('a')
      link.download = `certificate-${participant.name.replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL()
      link.click()
    }

    img.src = '/row-certificat.png'
  }

  const shareCertificate = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `شهادة تقدير - ${participant?.name}`,
          text: `شهادة تقدير من ${participant?.hackathonTitle}`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('تم نسخ رابط الشهادة!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#01645e] mx-auto"></div>
          <p className="mt-4 text-[#01645e] text-xl">جاري تحميل الشهادة...</p>
        </div>
      </div>
    )
  }

  if (error || !participant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 border border-red-200 shadow-xl">
            <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ</h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const currentDate = new Date().toLocaleDateString('ar-SA')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#01645e] via-[#3ab666] to-[#c3e956] bg-clip-text text-transparent mb-4">
            شهادة التقدير
          </h1>
          <p className="text-[#8b7632] text-lg">
            {participant.hackathonTitle} - {participant.teamName}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={downloadCertificate}
            className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            تحميل الشهادة
          </button>
          
          <button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-[#3ab666] to-[#c3e956] text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            طباعة
          </button>
          
          <button
            onClick={shareCertificate}
            className="bg-gradient-to-r from-[#c3e956] to-[#01645e] text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <Share className="w-5 h-5" />
            مشاركة
          </button>
        </div>

        {/* Certificate */}
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="relative">
              <img
                src="/row-certificat.png"
                alt="شهادة تقدير"
                className="w-full max-w-4xl mx-auto"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-4xl font-bold text-[#01645e] mb-4">
                    {participant.name}
                  </h2>
                  <p className="text-xl text-[#8b7632]">
                    {participant.hackathonTitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Info */}
        {participant.isWinner && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400 rounded-2xl p-6 text-center">
              <h3 className="text-2xl font-bold text-yellow-700 mb-2">
                🏆 تهانينا!
              </h3>
              <p className="text-yellow-600 text-lg">
                حصلت على {participant.rank === 1 ? 'المركز الأول' : participant.rank === 2 ? 'المركز الثاني' : 'المركز الثالث'} 
                في {participant.hackathonTitle}
              </p>
              <p className="text-yellow-600 mt-2">
                النتيجة النهائية: {participant.totalScore.toFixed(2)} نقطة
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-[#8b7632]">
          <p className="text-sm">
            تم إنشاء هذه الشهادة تلقائياً من منصة هاكاثون الابتكار التقني
          </p>
          <p className="text-xs mt-2">
            © 2024 جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  )
}
