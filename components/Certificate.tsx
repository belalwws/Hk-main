'use client'

import React, { useRef, useEffect, useState } from 'react'
import { drawCertificateText, DEFAULT_CERTIFICATE_CONFIG } from '@/lib/certificate-config'

interface CertificateProps {
  participantName: string
  hackathonTitle: string
  date: string
  rank?: number
  isWinner?: boolean
}

function Certificate({
  participantName,
  hackathonTitle,
  date,
  rank,
  isWinner = false
}: CertificateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_CERTIFICATE_CONFIG)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/certificate-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings({
          ...DEFAULT_CERTIFICATE_CONFIG,
          namePositionY: data.namePositionY || data.namePosition || DEFAULT_CERTIFICATE_CONFIG.namePositionY,
          namePositionX: data.namePositionX || DEFAULT_CERTIFICATE_CONFIG.namePositionX,
          nameFont: data.nameFont,
          nameColor: data.nameColor
        })
      }
    } catch (error) {
      console.error('Error loading certificate settings:', error)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !settings) return

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
        participantName,
        hackathonTitle,
        date,
        rank,
        isWinner
      }, settings)

      setImageLoaded(true)
    }

    img.onerror = () => {
      console.error('Failed to load certificate image')
    }

    img.src = '/row-certificat.png'
  }, [participantName, hackathonTitle, date, rank, isWinner, settings])

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto border border-gray-300 rounded-lg shadow-lg"
        style={{ maxWidth: '800px' }}
      />
      {!imageLoaded && (
        <div className="flex items-center justify-center w-full h-64 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01645e] mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل الشهادة...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Component for generating certificate as image/PDF
export function CertificateGenerator({
  participantName,
  hackathonTitle,
  date,
  rank,
  isWinner = false
}: CertificateProps) {
  const downloadCertificate = async () => {
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
        participantName,
        hackathonTitle,
        date,
        rank,
        isWinner
      }, currentSettings)

      // Download the certificate
      const link = document.createElement('a')
      link.download = `certificate-${participantName.replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL()
      link.click()
    }

    img.src = '/row-certificat.png'
  }

  return (
    <div className="space-y-4">
      <Certificate 
        participantName={participantName}
        hackathonTitle={hackathonTitle}
        date={date}
        rank={rank}
        isWinner={isWinner}
      />
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={downloadCertificate}
          className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
        >
          تحميل الشهادة
        </button>
        
        <button
          onClick={() => window.print()}
          className="bg-gradient-to-r from-[#3ab666] to-[#c3e956] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
        >
          طباعة الشهادة
        </button>
      </div>
    </div>
  )
}

export { Certificate }
