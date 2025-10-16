'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Settings, Save, RotateCcw, Upload, Loader2, Award, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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

export default function SupervisorCertificatesPage() {
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

  useEffect(() => {
    loadHackathons()
  }, [])

  useEffect(() => {
    if (selectedHackathon) {
      loadHackathonData()
      loadSettings()
      loadCertificateImage()
    }
  }, [selectedHackathon])

  useEffect(() => {
    if (imageLoaded) {
      redrawCertificate()
    }
  }, [settings.namePositionX, settings.namePositionY, settings.nameColor, previewName, imageLoaded])

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
        setSettings(data)

        if (data.certificateTemplate) {
          setCertificateImageSrc(data.certificateTemplate)
        } else {
          setCertificateImageSrc('/row-certificat.svg')
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const loadCertificateImage = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      setPreviewError('لم يتم العثور على منطقة المعاينة')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setPreviewError('خطأ في تهيئة منطقة المعاينة')
      return
    }

    setImageLoaded(false)
    setPreviewError('')

    const img = new Image()
    img.onload = () => {
      try {
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

    img.onerror = () => {
      setImageLoaded(false)
      setPreviewError('فشل في تحميل صورة الشهادة. تأكد من وجود الملف.')

      if (certificateImageSrc !== '/row-certificat.svg') {
        setCertificateImageSrc('/row-certificat.svg')
      }
    }

    img.crossOrigin = 'anonymous'
    img.src = `${certificateImageSrc}?t=${Date.now()}`
  }

  const drawCertificate = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    img: HTMLImageElement,
    scale: number
  ) => {
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
  }

  const redrawCertificate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      const scale = 0.6
      drawCertificate(ctx, canvas, img, scale)
    }
    img.crossOrigin = 'anonymous'
    img.src = `${certificateImageSrc}?t=${Date.now()}`
  }

  const handleUploadCertificate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار ملف صورة',
        variant: 'destructive'
      })
      return
    }

    try {
      setUploadingCertificate(true)

      const formData = new FormData()
      formData.append('certificate', file)
      formData.append('hackathonId', selectedHackathon)

      const response = await fetch('/api/admin/upload-certificate', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setCertificateImageSrc(data.url)
        
        toast({
          title: 'تم الرفع بنجاح',
          description: 'تم رفع قالب الشهادة بنجاح',
        })
      } else {
        throw new Error('فشل رفع الشهادة')
      }
    } catch (error) {
      console.error('Error uploading certificate:', error)
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء رفع الشهادة',
        variant: 'destructive'
      })
    } finally {
      setUploadingCertificate(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!selectedHackathon) {
      toast({
        title: 'تنبيه',
        description: 'يرجى اختيار هاكاثون أولاً',
        variant: 'destructive'
      })
      return
    }

    try {
      setSaving(true)

      const response = await fetch(`/api/admin/hackathons/${selectedHackathon}/certificate-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          certificateTemplate: certificateImageSrc !== '/row-certificat.svg' ? certificateImageSrc : undefined
        }),
        credentials: 'include'
      })

      if (response.ok) {
        toast({
          title: 'تم الحفظ بنجاح',
          description: 'تم حفظ إعدادات الشهادة بنجاح',
        })
      } else {
        throw new Error('فشل حفظ الإعدادات')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ الإعدادات',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings({
      namePositionY: 0.52,
      namePositionX: 0.50,
      nameFont: 'bold 48px Arial',
      nameColor: '#1a472a'
    })
    setCertificateImageSrc('/row-certificat.svg')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
          <Award className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إعدادات الشهادات</h1>
          <p className="text-gray-600">رفع قالب الشهادة وتعديل موضع الاسم</p>
        </div>
      </motion.div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-900 font-semibold">ملاحظة مهمة</AlertTitle>
        <AlertDescription className="text-blue-800">
          هذه الصفحة مخصصة لرفع قالب الشهادة وتعديل موضع الاسم فقط.
          <br />
          <strong>إرسال الشهادات للمشاركين والحكام والمشرفين يتم من صفحة الأدمن.</strong>
        </AlertDescription>
      </Alert>

      {/* Hackathon Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            اختيار الهاكاثون
          </CardTitle>
          <CardDescription>
            اختر الهاكاثون لتعديل إعدادات الشهادة الخاصة به
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر هاكاثون" />
            </SelectTrigger>
            <SelectContent>
              {hackathons.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  <div className="flex items-center gap-2">
                    <span>{h.title}</span>
                    <Badge variant={h.status === 'active' ? 'default' : 'secondary'}>
                      {h.status === 'active' ? 'نشط' : h.status === 'upcoming' ? 'قادم' : 'منتهي'}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedHackathon && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                رفع قالب الشهادة
              </CardTitle>
              <CardDescription>
                ارفع صورة قالب الشهادة وعدّل موضع الاسم
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Certificate */}
              <div className="space-y-2">
                <Label htmlFor="certificate-upload">رفع قالب جديد</Label>
                <Input
                  id="certificate-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCertificate}
                  disabled={uploadingCertificate}
                  className="cursor-pointer"
                />
                {uploadingCertificate && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري رفع الشهادة...</span>
                  </div>
                )}
              </div>

              {/* Name Position Y */}
              <div className="space-y-2">
                <Label htmlFor="position-y">موضع الاسم عمودياً (Y)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="position-y"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.namePositionY}
                    onChange={(e) => setSettings({ ...settings, namePositionY: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-16 text-center">
                    {(settings.namePositionY * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Name Position X */}
              <div className="space-y-2">
                <Label htmlFor="position-x">موضع الاسم أفقياً (X)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="position-x"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.namePositionX}
                    onChange={(e) => setSettings({ ...settings, namePositionX: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-16 text-center">
                    {(settings.namePositionX * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Name Color */}
              <div className="space-y-2">
                <Label htmlFor="name-color">لون الاسم</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="name-color"
                    type="color"
                    value={settings.nameColor}
                    onChange={(e) => setSettings({ ...settings, nameColor: e.target.value })}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.nameColor}
                    onChange={(e) => setSettings({ ...settings, nameColor: e.target.value })}
                    className="flex-1 font-mono"
                    placeholder="#1a472a"
                  />
                </div>
              </div>

              {/* Preview Name */}
              <div className="space-y-2">
                <Label htmlFor="preview-name">اسم المعاينة</Label>
                <Input
                  id="preview-name"
                  type="text"
                  value={previewName}
                  onChange={(e) => setPreviewName(e.target.value)}
                  placeholder="محمد أحمد علي"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      حفظ الإعدادات
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  إعادة تعيين
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                معاينة الشهادة
              </CardTitle>
              <CardDescription>
                معاينة مباشرة لشكل الشهادة مع الاسم
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previewError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>خطأ</AlertTitle>
                  <AlertDescription>{previewError}</AlertDescription>
                </Alert>
              ) : (
                <div className="relative bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  )}
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto shadow-lg rounded-lg"
                    style={{ display: imageLoaded ? 'block' : 'none' }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedHackathon && (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              اختر هاكاثون للبدء
            </h3>
            <p className="text-gray-500">
              اختر هاكاثون من القائمة أعلاه لتعديل إعدادات الشهادة
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

