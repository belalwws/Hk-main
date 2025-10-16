'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Settings, Save, RotateCcw, ArrowLeft, Upload, Send, Loader2, Award, Users, CheckCircle2, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

interface CertificateSettings {
  namePositionY: number
  namePositionX: number
  nameFont: string
  nameColor: string
  certificateTemplate?: string
  lastUpdated?: string
  updatedBy?: string
  hackathonId?: string
}

interface Hackathon {
  id: string
  title: string
  description: string
  status: string
}

interface Participant {
  id: string
  userId: string
  status: string
  teamId: string | null
  user: {
    name: string
    email: string
  }
  team: {
    name: string
  } | null
}

interface Judge {
  id: string
  userId: string
  hackathonId: string
  certificateUrl: string | null
  certificateSent: boolean
  user: {
    name: string
    email: string
  }
}

interface Supervisor {
  id: string
  userId: string
  hackathonId: string | null
  certificateUrl: string | null
  certificateSent: boolean
  user: {
    name: string
    email: string
  }
}

export default function SupervisorCertificateManagementPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()
  
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [selectedHackathon, setSelectedHackathon] = useState<string>('')
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [settings, setSettings] = useState<CertificateSettings>({
    namePositionY: 0.52,
    namePositionX: 0.50,
    nameFont: 'bold 48px Arial',
    nameColor: '#1a472a'
  })
  const [saving, setSaving] = useState(false)
  const [previewName, setPreviewName] = useState('محمد أحمد علي')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [uploadingCertificate, setUploadingCertificate] = useState(false)
  const [certificateImageSrc, setCertificateImageSrc] = useState('/row-certificat.svg')
  const [previewError, setPreviewError] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Participants, Judges, Supervisors
  const [participants, setParticipants] = useState<Participant[]>([])
  const [judges, setJudges] = useState<Judge[]>([])
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [sendingCertificates, setSendingCertificates] = useState(false)

  useEffect(() => {
    loadHackathons()
  }, [])

  useEffect(() => {
    if (selectedHackathon) {
      loadHackathonData()
      loadSettings()
      loadCertificateImage()
      loadParticipants()
      loadJudges()
      loadSupervisors()
    }
  }, [selectedHackathon])

  useEffect(() => {
    console.log('Certificate image source changed:', certificateImageSrc)
    setImageLoaded(false)
    loadCertificateImage()
  }, [certificateImageSrc])

  const loadHackathons = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/supervisor/hackathons', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setHackathons(data.hackathons || [])
      }
    } catch (error) {
      console.error('Error loading hackathons:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadHackathonData = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${selectedHackathon}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setHackathon(data.hackathon)
      }
    } catch (error) {
      console.error('Error loading hackathon:', error)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${selectedHackathon}/certificate-settings`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        console.log('📋 Loaded settings:', data)
        setSettings(data)

        if (data.certificateTemplate) {
          console.log('🖼️ Loading custom certificate template:', data.certificateTemplate)
          setCertificateImageSrc(data.certificateTemplate)
        } else {
          console.log('🖼️ Using default certificate template')
          setCertificateImageSrc('/row-certificat.svg')
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const loadParticipants = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${selectedHackathon}/participants`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setParticipants(data.participants || [])
      }
    } catch (error) {
      console.error('Error loading participants:', error)
    }
  }

  const loadJudges = async () => {
    try {
      const response = await fetch(`/api/supervisor/certificates/judges?hackathonId=${selectedHackathon}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setJudges(data.judges || [])
      }
    } catch (error) {
      console.error('Error loading judges:', error)
    }
  }

  const loadSupervisors = async () => {
    try {
      const response = await fetch(`/api/supervisor/certificates/supervisors?hackathonId=${selectedHackathon}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setSupervisors(data.supervisors || [])
      }
    } catch (error) {
      console.error('Error loading supervisors:', error)
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

      if (certificateImageSrc !== '/row-certificat.svg') {
        console.log('🔄 Trying fallback to default certificate')
        setCertificateImageSrc('/row-certificat.svg')
      }
    }

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
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const nameX = canvas.width * settings.namePositionX
      const nameY = canvas.height * settings.namePositionY

      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = settings.nameColor

      const fontSize = parseInt(settings.nameFont.match(/(\d+)px/)?.[1] || '48') * scale
      const fontFamily = settings.nameFont.replace(/bold\s+\d+px\s+/, '') || 'Arial'
      ctx.font = `bold ${fontSize}px ${fontFamily}`

      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 2
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1

      ctx.fillText(previewName, nameX, nameY)

      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Draw position indicators
      ctx.strokeStyle = '#ff4444'
      ctx.lineWidth = 2
      ctx.setLineDash([8, 4])

      ctx.beginPath()
      ctx.moveTo(Math.max(0, nameX - 120), nameY)
      ctx.lineTo(Math.min(canvas.width, nameX + 120), nameY)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(nameX, Math.max(0, nameY - 40))
      ctx.lineTo(nameX, Math.min(canvas.height, nameY + 40))
      ctx.stroke()

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4] p-6">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#c3e956] to-[#3ab666] rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-[#01645e] to-[#3ab666] p-6 rounded-full shadow-2xl w-24 h-24 flex items-center justify-center">
                <Award className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#01645e] via-[#3ab666] to-[#c3e956] bg-clip-text text-transparent mb-2">
            🏆 إدارة الشهادات
          </h1>
          <p className="text-[#8b7632] text-lg">رفع وإرسال الشهادات للمشاركين والمحكمين والمشرفين</p>
        </motion.div>

        {/* Hackathon Selection */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <label className="text-gray-700 font-medium">اختر الهاكاثون:</label>
              <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="اختر هاكاثون" />
                </SelectTrigger>
                <SelectContent>
                  {hackathons.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedHackathon && hackathon && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {hackathon.title}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedHackathon && (
          <Tabs defaultValue="settings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 ml-2" />
                إعدادات الشهادة
              </TabsTrigger>
              <TabsTrigger value="participants">
                <Users className="w-4 h-4 ml-2" />
                المشاركين ({participants.length})
              </TabsTrigger>
              <TabsTrigger value="judges">
                <Award className="w-4 h-4 ml-2" />
                المحكمين ({judges.length})
              </TabsTrigger>
              <TabsTrigger value="supervisors">
                <Users className="w-4 h-4 ml-2" />
                المشرفين ({supervisors.length})
              </TabsTrigger>
            </TabsList>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Certificate Preview */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>معاينة الشهادة</CardTitle>
                      <p className="text-sm text-gray-600">
                        💡 اضغط في أي مكان على الشهادة لتحديد موضع الاسم
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center">
                        <canvas
                          ref={canvasRef}
                          onClick={(e) => {
                            const canvas = canvasRef.current
                            if (!canvas || !imageLoaded) return

                            const rect = canvas.getBoundingClientRect()
                            const x = e.clientX - rect.left
                            const y = e.clientY - rect.top

                            const newPositionX = x / canvas.width
                            const newPositionY = y / canvas.height

                            const clampedPositionX = Math.max(0.05, Math.min(0.95, newPositionX))
                            const clampedPositionY = Math.max(0.15, Math.min(0.85, newPositionY))

                            setSettings(prev => ({
                              ...prev,
                              namePositionX: clampedPositionX,
                              namePositionY: clampedPositionY
                            }))

                            const ctx = canvas.getContext('2d')
                            if (ctx) {
                              const img = new Image()
                              img.onload = () => drawCertificate(ctx, canvas, img, 0.6)
                              img.src = `${certificateImageSrc}?t=${Date.now()}`
                            }
                          }}
                          className="border border-gray-300 rounded-lg shadow-lg cursor-crosshair hover:shadow-xl transition-shadow"
                          style={{ maxWidth: '100%', height: 'auto' }}
                        />
                      </div>

                      {!imageLoaded && !previewError && (
                        <div className="flex items-center justify-center h-64">
                          <div className="text-center">
                            <Loader2 className="animate-spin h-12 w-12 border-b-2 border-[#01645e] mx-auto mb-4" />
                            <p className="text-gray-600">جاري تحميل الشهادة...</p>
                          </div>
                        </div>
                      )}

                      {previewError && (
                        <div className="flex items-center justify-center h-64">
                          <div className="text-center">
                            <div className="text-red-500 text-6xl mb-4">⚠️</div>
                            <p className="text-red-600 font-medium">{previewError}</p>
                            <Button
                              onClick={() => {
                                setPreviewError('')
                                loadCertificateImage()
                              }}
                              className="mt-4"
                            >
                              إعادة المحاولة
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Settings Panel */}
                <div className="space-y-6">
                  {/* Position Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>إعدادات الموضع</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Vertical Position */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          الموضع العمودي: {(settings.namePositionY * 100).toFixed(0)}%
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
                      </div>

                      {/* Horizontal Position */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          الموضع الأفقي: {(settings.namePositionX * 100).toFixed(0)}%
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
                      </div>

                      {/* Color Picker */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          لون الاسم
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={settings.nameColor}
                            onChange={(e) => {
                              const newColor = e.target.value
                              setSettings(prev => ({ ...prev, nameColor: newColor }))

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

                      {/* Preview Name */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          اسم المعاينة
                        </label>
                        <input
                          type="text"
                          value={previewName}
                          onChange={(e) => {
                            setPreviewName(e.target.value)

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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="أدخل اسم للمعاينة"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Certificate Template Upload - Will continue in next chunk */}
                </div>
              </div>
            </TabsContent>

            {/* Other tabs will be added in next chunks */}
          </Tabs>
        )}
      </div>
    </div>
  )
}

