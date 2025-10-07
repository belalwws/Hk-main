"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, Loader2, Upload, User, Mail, Phone, Briefcase, Award, Link as LinkIcon, Image as ImageIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface FormDesign {
  coverImage?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  title?: string
  description?: string
  welcomeMessage?: string
  successMessage?: string
  logoUrl?: string
  customCss?: string
}

export default function JudgeApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const hackathonId = params.hackathonId as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [design, setDesign] = useState<FormDesign | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    expertise: '',
    experience: '',
    linkedin: '',
    twitter: '',
    website: '',
    profileImage: null as File | null
  })

  useEffect(() => {
    fetchFormDesign()
  }, [hackathonId])

  const fetchFormDesign = async () => {
    try {
      const response = await fetch(`/api/admin/judge-form-design/${hackathonId}`)
      const data = await response.json()
      if (response.ok) {
        setDesign(data.design)
      }
    } catch (err) {
      console.error('Error fetching form design:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, profileImage: file })
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.name || !formData.email) {
      setError('الاسم والبريد الإلكتروني مطلوبان')
      return
    }

    setSubmitting(true)

    try {
      const submitData = new FormData()
      submitData.append('hackathonId', hackathonId)
      submitData.append('name', formData.name)
      submitData.append('email', formData.email)
      if (formData.phone) submitData.append('phone', formData.phone)
      if (formData.bio) submitData.append('bio', formData.bio)
      if (formData.expertise) submitData.append('expertise', formData.expertise)
      if (formData.experience) submitData.append('experience', formData.experience)
      if (formData.linkedin) submitData.append('linkedin', formData.linkedin)
      if (formData.twitter) submitData.append('twitter', formData.twitter)
      if (formData.website) submitData.append('website', formData.website)
      if (formData.profileImage) submitData.append('profileImage', formData.profileImage)

      const response = await fetch('/api/judge/apply', {
        method: 'POST',
        body: submitData
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'فشل في إرسال الطلب')
      }
    } catch (err) {
      console.error('Error submitting application:', err)
      setError('حدث خطأ في إرسال الطلب')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: design?.backgroundColor || '#f9fafb' }}>
        <Loader2 className="w-16 h-16 animate-spin" style={{ color: design?.primaryColor || '#01645e' }} />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: design?.backgroundColor || '#f9fafb' }}>
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: design?.secondaryColor || '#3ab666' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: design?.primaryColor || '#01645e' }}>
                {design?.successMessage || 'تم إرسال طلبك بنجاح!'}
              </h2>
              <p className="text-gray-600 mb-6">سيتم مراجعة طلبك والتواصل معك قريباً</p>
              <Button
                onClick={() => router.push('/')}
                style={{
                  background: `linear-gradient(to right, ${design?.primaryColor || '#01645e'}, ${design?.secondaryColor || '#3ab666'})`
                }}
              >
                العودة للصفحة الرئيسية
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: design?.backgroundColor || '#f9fafb' }}>
      {/* Cover Image */}
      {design?.coverImage && (
        <div className="relative w-full h-64 md:h-80">
          <Image
            src={design.coverImage}
            alt="Cover"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6 -mt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-2xl">
            <CardHeader className="text-center" style={{ 
              background: `linear-gradient(to right, ${design?.primaryColor || '#01645e'}, ${design?.secondaryColor || '#3ab666'})`,
              color: 'white'
            }}>
              {design?.logoUrl && (
                <div className="flex justify-center mb-4">
                  <Image src={design.logoUrl} alt="Logo" width={80} height={80} className="rounded-full bg-white p-2" />
                </div>
              )}
              <CardTitle className="text-3xl">
                {design?.title || 'نموذج التقديم كمحكم'}
              </CardTitle>
              <CardDescription className="text-white/90 text-lg mt-2">
                {design?.description || 'املأ النموذج للتقديم كمحكم في الهاكاثون'}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              {design?.welcomeMessage && (
                <Alert className="mb-6" style={{ borderColor: design.accentColor }}>
                  <Award className="h-4 w-4" />
                  <AlertDescription>{design.welcomeMessage}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Image */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    الصورة الشخصية (اختياري)
                  </Label>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border-4" style={{ borderColor: design?.primaryColor }}>
                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (حد أقصى 5MB)</p>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    الاسم الكامل <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    رقم الهاتف
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">نبذة عنك</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="اكتب نبذة مختصرة عنك..."
                    rows={4}
                  />
                </div>

                {/* Expertise */}
                <div className="space-y-2">
                  <Label htmlFor="expertise" className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    مجالات الخبرة
                  </Label>
                  <Input
                    id="expertise"
                    value={formData.expertise}
                    onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                    placeholder="مثال: تطوير الويب، الذكاء الاصطناعي، التصميم"
                  />
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label htmlFor="experience" className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    الخبرة العملية
                  </Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="اذكر خبراتك السابقة..."
                    rows={3}
                  />
                </div>

                {/* Social Links */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="linkedin.com/in/..."
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Twitter/X
                    </Label>
                    <Input
                      id="twitter"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      placeholder="@username"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      الموقع الشخصي
                    </Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://..."
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full text-lg py-6"
                  style={{
                    background: `linear-gradient(to right, ${design?.primaryColor || '#01645e'}, ${design?.secondaryColor || '#3ab666'})`
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 ml-2" />
                      إرسال الطلب
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Custom CSS */}
      {design?.customCss && (
        <style dangerouslySetInnerHTML={{ __html: design.customCss }} />
      )}
    </div>
  )
}

