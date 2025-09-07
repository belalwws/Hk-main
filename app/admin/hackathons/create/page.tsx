"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Trophy, Users, FileText, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateHackathonPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: '',
    status: 'DRAFT',
    prizes: {
      first: '',
      second: '',
      third: ''
    },
    requirements: [''],
    categories: ['']
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Clean up empty requirements and categories
      const cleanedData = {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        categories: formData.categories.filter(cat => cat.trim() !== '')
      }

      const response = await fetch('/api/admin/hackathons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData)
      })

      if (response.ok) {
        router.push('/admin/hackathons')
      } else {
        const error = await response.json()
        alert(error.error || 'حدث خطأ في إنشاء الهاكاثون')
      }
    } catch (error) {
      console.error('Error creating hackathon:', error)
      alert('حدث خطأ في إنشاء الهاكاثون')
    } finally {
      setLoading(false)
    }
  }

  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, '']
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

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    })
  }

  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [...formData.categories, '']
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

  const removeCategory = (index: number) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link href="/admin/hackathons">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-[#01645e]">إنشاء هاكاثون جديد</h1>
            <p className="text-[#8b7632] text-lg">إعداد هاكاثون جديد للمشاركين</p>
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
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
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

          {/* Dates and Limits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#01645e]">
                  <Calendar className="w-5 h-5" />
                  التواريخ والحدود
                </CardTitle>
                <CardDescription>تواريخ الهاكاثون وحدود المشاركة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="registrationDeadline">انتهاء التسجيل *</Label>
                    <Input
                      id="registrationDeadline"
                      type="datetime-local"
                      value={formData.registrationDeadline}
                      onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                      required
                    />
                  </div>
                  
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
                <CardDescription>جوائز الهاكاثون</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="firstPrize">الجائزة الأولى</Label>
                    <Input
                      id="firstPrize"
                      value={formData.prizes.first}
                      onChange={(e) => setFormData({
                        ...formData,
                        prizes: {...formData.prizes, first: e.target.value}
                      })}
                      placeholder="مثال: 50,000 ريال"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="secondPrize">الجائزة الثانية</Label>
                    <Input
                      id="secondPrize"
                      value={formData.prizes.second}
                      onChange={(e) => setFormData({
                        ...formData,
                        prizes: {...formData.prizes, second: e.target.value}
                      })}
                      placeholder="مثال: 30,000 ريال"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="thirdPrize">الجائزة الثالثة</Label>
                    <Input
                      id="thirdPrize"
                      value={formData.prizes.third}
                      onChange={(e) => setFormData({
                        ...formData,
                        prizes: {...formData.prizes, third: e.target.value}
                      })}
                      placeholder="مثال: 20,000 ريال"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end gap-4"
          >
            <Link href="/admin/hackathons">
              <Button variant="outline">إلغاء</Button>
            </Link>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52]"
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء الهاكاثون'}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}
