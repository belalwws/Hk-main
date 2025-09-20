'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Settings, Save, RotateCcw, Eye, ArrowLeft, Upload } from 'lucide-react'

interface CertificateSettings {
  namePositionY: number  // موضع عمودي
  namePositionX: number  // موضع أفقي
  nameFont: string
  nameColor: string
  lastUpdated?: string
  updatedBy?: string
}

export default function CertificateSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [settings, setSettings] = useState<CertificateSettings>({
    namePositionY: 0.52,
    namePositionX: 0.50,
    nameFont: 'bold 48px Arial',
    nameColor: '#1a472a'
  })
  const [isDragging, setIsDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewName, setPreviewName] = useState('محمد أحمد علي')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [uploadingCertificate, setUploadingCertificate] = useState(false)
  const [certificateImageSrc, setCertificateImageSrc] = useState('/row-certificat.png')
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [previewError, setPreviewError] = useState('')

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/admin/dashboard')
      return
    }
    loadSettings()
    loadCertificateImage()
  }, [user, router])

  // إعادة تحميل الصورة عند تغيير المصدر
  useEffect(() => {
    console.log('Certificate image source changed:', certificateImageSrc)
    setImageLoaded(false) // إعادة تعيين حالة التحميل
    loadCertificateImage()
  }, [certificateImageSrc])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/certificate-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        
        // If there's a custom certificate template, update the image source
        if (data.certificateTemplate) {
          console.log('Loading custom certificate template:', data.certificateTemplate)
          setCertificateImageSrc(data.certificateTemplate)
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const loadCertificateImage = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.error('Canvas not found')
      setPreviewError('لم يتم العثور على منطقة المعاينة')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('Canvas context not available')
      setPreviewError('خطأ في تهيئة منطقة المعاينة')
      return
    }

    console.log('🖼️ Loading certificate image:', certificateImageSrc)
    setImageLoaded(false)
    setPreviewError('')

    const img = new Image()
    img.onload = () => {
      try {
        console.log('✅ Certificate image loaded successfully')
        console.log('Image dimensions:', img.width, 'x', img.height)

        // Set canvas size to match image (scaled down for editing)
        const scale = 0.6
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        drawCertificate(ctx, canvas, img, scale)
        setImageLoaded(true)
        setPreviewError('')
      } catch (error) {
        console.error('Error processing loaded image:', error)
        setPreviewError('خطأ في معالجة الصورة')
      }
    }

    img.onerror = (error) => {
      console.error('❌ Failed to load certificate image:', certificateImageSrc, error)
      setImageLoaded(false)
      setPreviewError('فشل في تحميل صورة الشهادة. تأكد من وجود الملف.')

      // Try fallback to default certificate
      if (certificateImageSrc !== '/row-certificat.png') {
        console.log('🔄 Trying fallback to default certificate')
        setCertificateImageSrc('/row-certificat.png')
      }
    }

    // Add CORS and cache-busting
    img.crossOrigin = 'anonymous'
    img.src = `${certificateImageSrc}?t=${Date.now()}&cache=false`
  }

  const drawCertificate = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    img: HTMLImageElement,
    scale: number
  ) => {
    try {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw certificate image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Calculate name position
      const nameX = canvas.width * settings.namePositionX
      const nameY = canvas.height * settings.namePositionY

      // Draw name with better text rendering
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = settings.nameColor

      // Scale font size properly
      const fontSize = parseInt(settings.nameFont.match(/(\d+)px/)?.[1] || '48') * scale
      const fontFamily = settings.nameFont.replace(/bold\s+\d+px\s+/, '') || 'Arial'
      ctx.font = `bold ${fontSize}px ${fontFamily}`

      // Add text shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 2
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1

      ctx.fillText(previewName, nameX, nameY)

      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Draw position indicators (crosshair) - more visible
      ctx.strokeStyle = '#ff4444'
      ctx.lineWidth = 2
      ctx.setLineDash([8, 4])

      // Horizontal line
      ctx.beginPath()
      ctx.moveTo(Math.max(0, nameX - 120), nameY)
      ctx.lineTo(Math.min(canvas.width, nameX + 120), nameY)
      ctx.stroke()

      // Vertical line
      ctx.beginPath()
      ctx.moveTo(nameX, Math.max(0, nameY - 40))
      ctx.lineTo(nameX, Math.min(canvas.height, nameY + 40))
      ctx.stroke()

      // Draw center point
      ctx.setLineDash([])
      ctx.fillStyle = '#ff4444'
      ctx.beginPath()
      ctx.arc(nameX, nameY, 4, 0, 2 * Math.PI)
      ctx.fill()

      setPreviewError('')
    } catch (error) {
      console.error('Error drawing certificate:', error)
      setPreviewError('خطأ في رسم الشهادة')
    }
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !imageLoaded) {
      console.log('Canvas click ignored - canvas not ready')
      return
    }

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    console.log('Canvas clicked at:', x, y, 'Canvas size:', canvas.width, canvas.height)

    // Calculate relative position (0-1)
    const newPositionX = x / canvas.width
    const newPositionY = y / canvas.height

    console.log('Relative position:', newPositionX, newPositionY)

    // Limit positions between safe boundaries
    const clampedPositionX = Math.max(0.05, Math.min(0.95, newPositionX))
    const clampedPositionY = Math.max(0.15, Math.min(0.85, newPositionY))

    console.log('Clamped position:', clampedPositionX, clampedPositionY)

    // Update settings immediately
    setSettings(prev => ({
      ...prev,
      namePositionX: clampedPositionX,
      namePositionY: clampedPositionY
    }))

    // Redraw with new position immediately
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const img = new Image()
      img.onload = () => {
        console.log('Redrawing certificate with new position')
        drawCertificate(ctx, canvas, img, 0.6)
      }
      img.onerror = () => {
        console.error('Failed to reload image for redraw')
      }
      img.src = `${certificateImageSrc}?t=${Date.now()}`
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/certificate-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          updatedBy: user?.name || 'admin'
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert('✅ تم حفظ إعدادات الشهادة بنجاح!\nسيتم تطبيقها على جميع الشهادات الجديدة.')
        setSettings(result.settings)

        // إعادة رسم الشهادة بالإعدادات الجديدة
        const canvas = canvasRef.current
        if (canvas && imageLoaded) {
          const ctx = canvas.getContext('2d')
          if (ctx) {
            const img = new Image()
            img.onload = () => drawCertificate(ctx, canvas, img, 0.6)
            img.src = `${certificateImageSrc}?t=${Date.now()}`
          }
        }
      } else {
        const error = await response.json()
        alert(`❌ خطأ في الحفظ: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('❌ حدث خطأ في حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  const resetToDefault = async () => {
    if (!confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟ سيتم حذف القالب المخصص أيضاً.')) {
      return
    }

    const defaultSettings = {
      namePositionY: 0.52,
      namePositionX: 0.50,
      nameFont: 'bold 48px Arial',
      nameColor: '#1a472a',
      certificateTemplate: undefined
    }
    
    try {
      // Save default settings to server
      const response = await fetch('/api/admin/certificate-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...defaultSettings,
          updatedBy: user?.name || 'admin'
        })
      })

      if (response.ok) {
        setSettings(defaultSettings)
        setCertificateImageSrc('/row-certificat.png') // Reset to default image
        
        // Redraw with default settings and image
        const canvas = canvasRef.current
        if (canvas) {
          const ctx = canvas.getContext('2d')
          if (ctx) {
            const img = new Image()
            img.onload = () => drawCertificate(ctx, canvas, img, 0.6)
            img.src = '/row-certificat.png'
          }
        }
        
        alert('✅ تم إعادة تعيين الإعدادات إلى القيم الافتراضية')
      } else {
        alert('❌ حدث خطأ في إعادة تعيين الإعدادات')
      }
    } catch (error) {
      console.error('Error resetting settings:', error)
      alert('❌ حدث خطأ في إعادة تعيين الإعدادات')
    }
  }

  const handleCertificateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('📤 Starting certificate upload:', file.name, file.size, file.type)

    // التحقق من حجم الملف (الحد الأقصى 4 ميجابايت)
    const maxSize = 4 * 1024 * 1024 // 4MB
    if (file.size > maxSize) {
      alert('حجم الملف كبير جداً. الحد الأقصى المسموح 4 ميجابايت.')
      event.target.value = ''
      return
    }

    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, WebP).')
      event.target.value = ''
      return
    }

    setUploadingCertificate(true)
    setPreviewError('')

    try {
      console.log('🔄 Creating form data and sending request...')
      const formData = new FormData()
      formData.append('certificateImage', file)

      const response = await fetch('/api/admin/certificate-template', {
        method: 'POST',
        body: formData
      })

      console.log('📡 Upload response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Upload successful:', data)

        // إضافة timestamp لتجنب التخزين المؤقت
        const newImageSrc = `${data.filePath}?t=${Date.now()}`
        console.log('🖼️ New image source:', newImageSrc)

        // Update image source immediately
        setCertificateImageSrc(newImageSrc)

        // Save the new certificate template path to settings
        try {
          console.log('💾 Saving certificate template to settings...')
          const settingsResponse = await fetch('/api/admin/certificate-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...settings,
              certificateTemplate: data.filePath,
              updatedBy: user?.name || 'admin'
            })
          })

          if (settingsResponse.ok) {
            console.log('✅ Certificate template path saved to settings')
          } else {
            console.log('⚠️ Failed to save settings, but upload was successful')
          }
        } catch (settingsError) {
          console.error('❌ Error saving certificate template to settings:', settingsError)
        }

        alert('✅ تم رفع قالب الشهادة بنجاح!')

        // Force reload the image with new source
        setTimeout(() => {
          console.log('🔄 Reloading certificate image...')
          loadCertificateImage()
        }, 500)

        // Reload settings to get the updated certificate template
        setTimeout(() => {
          loadSettings()
        }, 1000)

      } else {
        const errorData = await response.json()
        console.error('❌ Upload failed:', errorData)
        alert(`❌ خطأ في رفع قالب الشهادة: ${errorData.error}`)
        setPreviewError(`خطأ في الرفع: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error uploading certificate template:', error)
      alert('❌ حدث خطأ في رفع قالب الشهادة')
    } finally {
      setUploadingCertificate(false)
      event.target.value = ''
    }
  }

  const previewInNewTab = () => {
    // Open certificate preview in new tab
    window.open('/admin/send-certificates', '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#c3e956] to-[#3ab666] rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-[#01645e] to-[#3ab666] p-6 rounded-full shadow-2xl w-24 h-24 flex items-center justify-center">
                <Settings className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#01645e] via-[#3ab666] to-[#c3e956] bg-clip-text text-transparent mb-4">
            ⚙️ إعدادات الشهادة
          </h1>
          <p className="text-[#8b7632] text-xl">اضغط على الشهادة لتحديد موضع الاسم</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Certificate Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h2 className="text-xl font-bold text-[#01645e] mb-4">معاينة الشهادة</h2>
              <p className="text-sm text-[#8b7632] mb-4">
                💡 اضغط في أي مكان على الشهادة لتحديد موضع الاسم
              </p>
              
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="border border-gray-300 rounded-lg shadow-lg cursor-crosshair hover:shadow-xl transition-shadow"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>

              {/* Loading State */}
              {!imageLoaded && !previewError && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01645e] mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل الشهادة...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {previewError && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <p className="text-red-600 font-medium">{previewError}</p>
                    <button
                      onClick={() => {
                        setPreviewError('')
                        loadCertificateImage()
                      }}
                      className="mt-4 px-4 py-2 bg-[#01645e] text-white rounded-lg hover:bg-[#01645e]/90 transition-colors"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Position Settings */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h3 className="text-lg font-bold text-[#01645e] mb-4">إعدادات الموضع</h3>
              
              <div className="space-y-4">
                {/* Vertical Position */}
                <div>
                  <label className="block text-sm font-medium text-[#01645e] mb-2">
                    الموضع العمودي (أعلى/أسفل): {(settings.namePositionY * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="0.8"
                    step="0.01"
                    value={settings.namePositionY}
                    onChange={(e) => {
                      const newPosition = parseFloat(e.target.value)
                      setSettings(prev => ({ ...prev, namePositionY: newPosition }))

                      // Redraw immediately
                      const canvas = canvasRef.current
                      if (canvas && imageLoaded) {
                        const ctx = canvas.getContext('2d')
                        if (ctx) {
                          const img = new Image()
                          img.onload = () => drawCertificate(ctx, canvas, img, 0.6)
                          img.src = `${certificateImageSrc}?t=${Date.now()}`
                        }
                      }
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>أعلى</span>
                    <span>أسفل</span>
                  </div>
                </div>

                {/* Horizontal Position */}
                <div>
                  <label className="block text-sm font-medium text-[#01645e] mb-2">
                    الموضع الأفقي (يمين/شمال): {(settings.namePositionX * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.01"
                    value={settings.namePositionX}
                    onChange={(e) => {
                      const newPosition = parseFloat(e.target.value)
                      setSettings(prev => ({ ...prev, namePositionX: newPosition }))

                      // Redraw immediately
                      const canvas = canvasRef.current
                      if (canvas && imageLoaded) {
                        const ctx = canvas.getContext('2d')
                        if (ctx) {
                          const img = new Image()
                          img.onload = () => drawCertificate(ctx, canvas, img, 0.6)
                          img.src = `${certificateImageSrc}?t=${Date.now()}`
                        }
                      }
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>شمال</span>
                    <span>يمين</span>
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-[#01645e] mb-2">
                    لون الاسم
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.nameColor}
                      onChange={(e) => {
                        const newColor = e.target.value
                        setSettings(prev => ({ ...prev, nameColor: newColor }))

                        // Redraw immediately
                        const canvas = canvasRef.current
                        if (canvas && imageLoaded) {
                          const ctx = canvas.getContext('2d')
                          if (ctx) {
                            const img = new Image()
                            img.onload = () => drawCertificate(ctx, canvas, img, 0.6)
                            img.src = `${certificateImageSrc}?t=${Date.now()}`
                          }
                        }
                      }}
                      className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{settings.nameColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#01645e] mb-2">
                    اسم المعاينة
                  </label>
                  <input
                    type="text"
                    value={previewName}
                    onChange={(e) => {
                      setPreviewName(e.target.value)
                      
                      // Redraw with new name
                      const canvas = canvasRef.current
                      if (canvas && imageLoaded) {
                        const ctx = canvas.getContext('2d')
                        if (ctx) {
                          const img = new Image()
                          img.onload = () => drawCertificate(ctx, canvas, img, 0.6)
                          img.src = `${certificateImageSrc}?t=${Date.now()}`
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01645e] focus:border-transparent"
                    placeholder="أدخل اسم للمعاينة"
                  />
                </div>
              </div>
            </div>

            {/* Certificate Template Upload */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h3 className="text-lg font-bold text-[#01645e] mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                رفع قالب شهادة مخصص
              </h3>

              <div className="space-y-4">
                {/* Current Template Info */}
                {certificateImageSrc !== '/row-certificat.png' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-green-800">✅ قالب مخصص نشط</h4>
                        <p className="text-sm text-green-600">يتم استخدام قالب شهادة مخصص حالياً</p>
                      </div>
                      <button
                        onClick={resetToDefault}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                      >
                        حذف القالب
                      </button>
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#01645e] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCertificateUpload}
                    className="hidden"
                    id="certificate-upload"
                    disabled={uploadingCertificate}
                  />
                  <label htmlFor="certificate-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-[#01645e] font-medium">
                          {uploadingCertificate ? 'جاري رفع الشهادة...' : 'اضغط لاختيار صورة الشهادة أو اسحب الملف هنا'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          الملفات المدعومة: JPG, PNG, WebP
                        </p>
                        <p className="text-xs text-gray-500">
                          الحد الأقصى لحجم الملف: 4 ميجابايت
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>• سيتم استخدام هذا القالب لجميع الشهادات الجديدة</p>
                  <p>• الأبعاد المقترحة: 1920x1080 بكسل أو أكبر</p>
                  <p>• تأكد من وجود مساحة كافية لكتابة الاسم</p>
                  <p>• سيتم حفظ القالب تلقائياً في إعدادات النظام</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h3 className="text-lg font-bold text-[#01645e] mb-4">الإجراءات</h3>
              
              <div className="space-y-3">
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-4 py-3 rounded-lg font-bold shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                </button>

                <button
                  onClick={resetToDefault}
                  className="w-full bg-gradient-to-r from-[#8b7632] to-[#c3e956] text-white px-4 py-3 rounded-lg font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  إعادة تعيين
                </button>

                <button
                  onClick={previewInNewTab}
                  className="w-full bg-gradient-to-r from-[#3ab666] to-[#c3e956] text-white px-4 py-3 rounded-lg font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  معاينة كاملة
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <h4 className="font-bold text-blue-800 mb-2">💡 نصائح:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• اضغط على الشهادة لتحديد الموضع (X و Y)</li>
                <li>• استخدم الشرائط للضبط الدقيق</li>
                <li>• غير لون الاسم حسب تصميم الشهادة</li>
                <li>• جرب أسماء مختلفة للمعاينة</li>
                <li>• احفظ الإعدادات لتطبيقها على الجميع</li>
              </ul>
            </div>

            {/* Color Presets */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <h4 className="font-bold text-green-800 mb-2">🎨 ألوان مقترحة:</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'أخضر داكن', color: '#1a472a' },
                  { name: 'أخضر متوسط', color: '#2c5530' },
                  { name: 'أسود', color: '#000000' },
                  { name: 'أزرق داكن', color: '#1e3a8a' },
                  { name: 'بني', color: '#8b4513' },
                  { name: 'ذهبي', color: '#d4af37' }
                ].map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => {
                      setSettings(prev => ({ ...prev, nameColor: preset.color }))

                      // Redraw immediately
                      const canvas = canvasRef.current
                      if (canvas && imageLoaded) {
                        const ctx = canvas.getContext('2d')
                        if (ctx) {
                          const img = new Image()
                          img.onload = () => drawCertificate(ctx, canvas, img, 0.6)
                          img.src = `${certificateImageSrc}?t=${Date.now()}`
                        }
                      }
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs border hover:bg-white transition-colors"
                    style={{ borderColor: preset.color }}
                  >
                    <div
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: preset.color }}
                    ></div>
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
