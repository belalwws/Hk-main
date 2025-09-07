'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Calendar, FileText, Users, Trophy, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'

interface Hackathon {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxParticipants?: number
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'COMPLETED'
  prizes?: {
    first?: string
    second?: string
    third?: string
  }
  requirements?: string[]
  categories?: string[]
}

export default function EditHackathonPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: '',
    status: 'DRAFT' as const,
    prizes: {
      first: '',
      second: '',
      third: ''
    },
    requirements: [''],
    categories: ['']
  })

  useEffect(() => {
    fetchHackathon()
  }, [params.id])

  const fetchHackathon = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        const h = data.hackathon
        setHackathon(h)
        
        // Format dates for input fields
        const formatDate = (dateString: string) => {
          const date = new Date(dateString)
          return date.toISOString().slice(0, 16) // YYYY-MM-DDTHH:MM format
        }

        setFormData({
          title: h.title || '',
          description: h.description || '',
          startDate: formatDate(h.startDate),
          endDate: formatDate(h.endDate),
          registrationDeadline: formatDate(h.registrationDeadline),
          maxParticipants: h.maxParticipants?.toString() || '',
          status: h.status || 'DRAFT',
          prizes: {
            first: h.prizes?.first || '',
            second: h.prizes?.second || '',
            third: h.prizes?.third || ''
          },
          requirements: h.requirements?.length ? h.requirements : [''],
          categories: h.categories?.length ? h.categories : ['']
        })
      } else {
        alert('فشل في جلب بيانات الهاكاثون')
        router.push('/admin/hackathons')
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error)
      alert('حدث خطأ في جلب البيانات')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Clean up empty requirements and categories
      const cleanedData = {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        categories: formData.categories.filter(cat => cat.trim() !== '')
      }

      const response = await fetch(`/api/admin/hackathons/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData)
      })

      if (response.ok) {
        alert('تم تحديث الهاكاثون بنجاح')
        router.push(`/admin/hackathons/${params.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'حدث خطأ في تحديث الهاكاثون')
      }
    } catch (error) {
      console.error('Error updating hackathon:', error)
      alert('حدث خطأ في تحديث الهاكاثون')
    } finally {
      setSaving(false)
    }
  }

  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, '']
    })
  }

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    })
  }

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...formData.requirements]
    newRequirements[index] = value
    setFormData({
      ...formData,
      requirements: newRequirements
    })
  }

  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [...formData.categories, '']
    })
  }

  const removeCategory = (index: number) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((_, i) => i !== index)
    })
  }

  const updateCategory = (index: number, value: string) => {
    const newCategories = [...formData.categories]
    newCategories[index] = value
    setFormData({
      ...formData,
      categories: newCategories
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#01645e] text-lg font-medium">جاري تحميل بيانات الهاكاثون...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link href={`/admin/hackathons/${params.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 ml-2" />
                رجوع
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#01645e]">تعديل الهاكاثون</h1>
              <p className="text-[#8b7632]">{hackathon?.title}</p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#01645e]">
                  <FileText className="w-5 h-5" />
                  المعلومات الأساسية
                </CardTitle>
                <CardDescription>معلومات عامة عن الهاكاثون</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title">عنوان الهاكاثون *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="مثال: هاكاثون الذكاء الاصطناعي"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">وصف الهاكاثون *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="وصف مفصل عن الهاكاثون وأهدافه..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">حالة الهاكاثون</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">مسودة</SelectItem>
                      <SelectItem value="OPEN">مفتوح للتسجيل</SelectItem>
                      <SelectItem value="CLOSED">مغلق</SelectItem>
                      <SelectItem value="COMPLETED">مكتمل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Dates and Timing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#01645e]">
                  <Calendar className="w-5 h-5" />
                  المواعيد والتوقيت
                </CardTitle>
                <CardDescription>تحديد مواعيد الهاكاثون والتسجيل</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="startDate">تاريخ البداية *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">تاريخ النهاية *</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="registrationDeadline">آخر موعد للتسجيل *</Label>
                    <Input
                      id="registrationDeadline"
                      type="datetime-local"
                      value={formData.registrationDeadline}
                      onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxParticipants">الحد الأقصى للمشاركين</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                      placeholder="اتركه فارغاً لعدم وضع حد أقصى"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Prizes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#01645e]">
                  <Trophy className="w-5 h-5" />
                  الجوائز
                </CardTitle>
                <CardDescription>تحديد جوائز المراكز الأولى</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="firstPrize">جائزة المركز الأول</Label>
                    <Input
                      id="firstPrize"
                      value={formData.prizes.first}
                      onChange={(e) => setFormData({
                        ...formData,
                        prizes: { ...formData.prizes, first: e.target.value }
                      })}
                      placeholder="مثال: 10,000 ريال"
                    />
                  </div>

                  <div>
                    <Label htmlFor="secondPrize">جائزة المركز الثاني</Label>
                    <Input
                      id="secondPrize"
                      value={formData.prizes.second}
                      onChange={(e) => setFormData({
                        ...formData,
                        prizes: { ...formData.prizes, second: e.target.value }
                      })}
                      placeholder="مثال: 5,000 ريال"
                    />
                  </div>

                  <div>
                    <Label htmlFor="thirdPrize">جائزة المركز الثالث</Label>
                    <Input
                      id="thirdPrize"
                      value={formData.prizes.third}
                      onChange={(e) => setFormData({
                        ...formData,
                        prizes: { ...formData.prizes, third: e.target.value }
                      })}
                      placeholder="مثال: 2,500 ريال"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#01645e]">
                  <Users className="w-5 h-5" />
                  متطلبات المشاركة
                </CardTitle>
                <CardDescription>شروط ومتطلبات المشاركة في الهاكاثون</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.requirements.map((requirement, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={requirement}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder={`متطلب ${index + 1}`}
                      className="flex-1"
                    />
                    {formData.requirements.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                      >
                        حذف
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRequirement}
                  className="w-full"
                >
                  إضافة متطلب جديد
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#01645e]">
                  <Settings className="w-5 h-5" />
                  فئات المشاريع
                </CardTitle>
                <CardDescription>تصنيفات المشاريع المقبولة في الهاكاثون</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.categories.map((category, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={category}
                      onChange={(e) => updateCategory(index, e.target.value)}
                      placeholder={`فئة ${index + 1}`}
                      className="flex-1"
                    />
                    {formData.categories.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCategory(index)}
                      >
                        حذف
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCategory}
                  className="w-full"
                >
                  إضافة فئة جديدة
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-end gap-4"
          >
            <Link href={`/admin/hackathons/${params.id}`}>
              <Button variant="outline" type="button">
                إلغاء
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] text-white"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}
