"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Linkedin, 
  Globe,
  Camera,
  Save,
  Eye,
  EyeOff,
  Shield,
  Calendar,
  Trophy
} from "lucide-react"

interface SupervisorProfile {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
  bio?: string
  github?: string
  linkedin?: string
  portfolio?: string
  skills?: string
  experience?: string
  profilePicture?: string
  role: string
  createdAt: string
  supervisorAssignments: Array<{
    id: string
    department?: string
    hackathon?: {
      id: string
      title: string
    }
  }>
}

export default function SupervisorProfile() {
  const [profile, setProfile] = useState<SupervisorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    bio: "",
    github: "",
    linkedin: "",
    portfolio: "",
    skills: "",
    experience: "",
    currentPassword: "",
    newPassword: ""
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/supervisor/profile")
      const data = await response.json()

      if (response.ok) {
        setProfile(data.profile)
        setFormData({
          name: data.profile.name || "",
          phone: data.profile.phone || "",
          city: data.profile.city || "",
          bio: data.profile.bio || "",
          github: data.profile.github || "",
          linkedin: data.profile.linkedin || "",
          portfolio: data.profile.portfolio || "",
          skills: data.profile.skills || "",
          experience: data.profile.experience || "",
          currentPassword: "",
          newPassword: ""
        })
      } else {
        setError(data.error || "حدث خطأ في جلب الملف الشخصي")
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSaving(true)

    try {
      const response = await fetch("/api/supervisor/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setProfile(data.profile)
        setSuccess("تم تحديث الملف الشخصي بنجاح")
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: ""
        }))
        setShowPasswordFields(false)
      } else {
        setError(data.error || "حدث خطأ في تحديث الملف الشخصي")
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("profilePicture", file)

      const response = await fetch("/api/supervisor/profile", {
        method: "POST",
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setProfile(prev => prev ? { ...prev, profilePicture: data.profilePicture } : null)
        setSuccess("تم تحديث الصورة الشخصية بنجاح")
      } else {
        setError(data.error || "حدث خطأ في رفع الصورة")
      }
    } catch (error) {
      setError("حدث خطأ في رفع الصورة")
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">لم يتم العثور على الملف الشخصي</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
        <p className="text-gray-600">إدارة معلوماتك الشخصية وإعدادات الحساب</p>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات أساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Picture */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                  {profile.profilePicture ? (
                    <img 
                      src={profile.profilePicture} 
                      alt="الصورة الشخصية" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-blue-600" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              {uploading && (
                <p className="text-sm text-gray-500 mt-2">جاري رفع الصورة...</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{profile.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <Badge className="bg-blue-100 text-blue-800">مشرف</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  انضم في {new Date(profile.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>

            {/* Assignments */}
            {profile.supervisorAssignments.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">المهام المكلف بها</h4>
                <div className="space-y-2">
                  {profile.supervisorAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">
                        {assignment.hackathon?.title || "مشرف عام"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>تعديل المعلومات</CardTitle>
              <CardDescription>
                قم بتحديث معلوماتك الشخصية ومعلومات الاتصال
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">الاسم الكامل *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="city">المدينة</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">نبذة شخصية</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={3}
                    placeholder="اكتب نبذة مختصرة عن نفسك..."
                  />
                </div>

                {/* Professional Info */}
                <div>
                  <Label htmlFor="skills">المهارات</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    placeholder="JavaScript, Python, إدارة المشاريع..."
                  />
                </div>

                <div>
                  <Label htmlFor="experience">الخبرة</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    rows={2}
                    placeholder="وصف موجز لخبرتك المهنية..."
                  />
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      value={formData.github}
                      onChange={(e) => setFormData({...formData, github: e.target.value})}
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="portfolio">الموقع الشخصي</Label>
                    <Input
                      id="portfolio"
                      value={formData.portfolio}
                      onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                {/* Password Change */}
                <div className="border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="mb-4"
                  >
                    {showPasswordFields ? "إلغاء تغيير كلمة المرور" : "تغيير كلمة المرور"}
                  </Button>

                  {showPasswordFields && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={formData.newPassword}
                            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                            placeholder="6 أحرف على الأقل"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "جاري الحفظ..." : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      حفظ التغييرات
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
