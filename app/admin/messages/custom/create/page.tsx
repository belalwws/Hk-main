"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ArrowLeft, 
  Send, 
  Save, 
  Eye, 
  Users, 
  Target,
  Mail,
  Calendar,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Hackathon {
  id: string
  title: string
  participantCount: number
}

interface FilterOptions {
  hackathons: Hackathon[]
  nationalities: string[]
  cities: string[]
  roles: string[]
}

export default function CreateCustomMessagePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    hackathons: [],
    nationalities: [],
    cities: [],
    roles: []
  })
  
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    targetAudience: 'all', // all, hackathon_participants, users, judges, admins
    filters: {
      hackathonId: '',
      nationality: '',
      city: '',
      role: '',
      status: '' // approved, pending, rejected
    },
    scheduledFor: '',
    sendImmediately: true
  })

  const [recipientCount, setRecipientCount] = useState(0)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  useEffect(() => {
    calculateRecipientCount()
  }, [formData.targetAudience, formData.filters])

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/admin/messages/filter-options')
      if (response.ok) {
        const data = await response.json()
        setFilterOptions(data)
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const calculateRecipientCount = async () => {
    try {
      const response = await fetch('/api/admin/messages/calculate-recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetAudience: formData.targetAudience,
          filters: formData.filters
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setRecipientCount(data.count)
      }
    } catch (error) {
      console.error('Error calculating recipients:', error)
    }
  }

  const handleSubmit = async (action: 'save' | 'send') => {
    if (!formData.subject.trim() || !formData.content.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    if (recipientCount === 0) {
      alert('لا يوجد مستلمين للرسالة')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/messages/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          action,
          recipientCount
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (action === 'send') {
          alert(`تم إرسال الرسالة بنجاح إلى ${data.sentCount} مستلم`)
        } else {
          alert('تم حفظ الرسالة كمسودة')
        }
        router.push('/admin/messages')
      } else {
        const error = await response.json()
        alert(error.error || 'حدث خطأ في العملية')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ في العملية')
    } finally {
      setLoading(false)
    }
  }

  const targetAudienceOptions = [
    { value: 'all', label: 'جميع المستخدمين', icon: Users },
    { value: 'hackathon_participants', label: 'المشاركين في الهاكاثونات', icon: Target },
    { value: 'users', label: 'المستخدمين العاديين', icon: Users },
    { value: 'judges', label: 'المحكمين', icon: Users },
    { value: 'admins', label: 'المديرين', icon: Users }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/messages">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                العودة
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Mail className="w-8 h-8 text-[#01645e]" />
              إنشاء رسالة مخصصة
            </h1>
          </div>
          <p className="text-gray-600">
            إنشاء وإرسال رسالة مخصصة لمجموعة محددة من المستخدمين
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Message Content */}
            <Card>
              <CardHeader>
                <CardTitle>محتوى الرسالة</CardTitle>
                <CardDescription>اكتب عنوان ومحتوى الرسالة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">عنوان الرسالة *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="اكتب عنوان الرسالة..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="content">محتوى الرسالة *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="اكتب محتوى الرسالة..."
                    rows={8}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    يمكنك استخدام المتغيرات: {'{'}name{'}'}, {'{'}email{'}'}, {'{'}hackathonTitle{'}'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Target Audience */}
            <Card>
              <CardHeader>
                <CardTitle>الجمهور المستهدف</CardTitle>
                <CardDescription>حدد من سيستلم هذه الرسالة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>نوع الجمهور</Label>
                  <Select
                    value={formData.targetAudience}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      targetAudience: value,
                      filters: { hackathonId: '', nationality: '', city: '', role: '', status: '' }
                    }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {targetAudienceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="w-4 h-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filters */}
                {formData.targetAudience === 'hackathon_participants' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Filter className="w-4 h-4" />
                      فلاتر إضافية
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>الهاكاثون</Label>
                        <Select
                          value={formData.filters.hackathonId}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            filters: { ...prev.filters, hackathonId: value }
                          }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="جميع الهاكاثونات" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">جميع الهاكاثونات</SelectItem>
                            {filterOptions.hackathons.map((hackathon) => (
                              <SelectItem key={hackathon.id} value={hackathon.id}>
                                {hackathon.title} ({hackathon.participantCount} مشارك)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>حالة المشاركة</Label>
                        <Select
                          value={formData.filters.status}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            filters: { ...prev.filters, status: value }
                          }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="جميع الحالات" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">جميع الحالات</SelectItem>
                            <SelectItem value="approved">مقبول</SelectItem>
                            <SelectItem value="pending">في الانتظار</SelectItem>
                            <SelectItem value="rejected">مرفوض</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>الجنسية</Label>
                        <Select
                          value={formData.filters.nationality}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            filters: { ...prev.filters, nationality: value }
                          }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="جميع الجنسيات" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">جميع الجنسيات</SelectItem>
                            {filterOptions.nationalities.map((nationality) => (
                              <SelectItem key={nationality} value={nationality}>
                                {nationality}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>المدينة</Label>
                        <Select
                          value={formData.filters.city}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            filters: { ...prev.filters, city: value }
                          }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="جميع المدن" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">جميع المدن</SelectItem>
                            {filterOptions.cities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle>جدولة الإرسال</CardTitle>
                <CardDescription>حدد متى تريد إرسال الرسالة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendImmediately"
                    checked={formData.sendImmediately}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      sendImmediately: checked as boolean,
                      scheduledFor: checked ? '' : prev.scheduledFor
                    }))}
                  />
                  <Label htmlFor="sendImmediately" className="mr-2">
                    إرسال فوري
                  </Label>
                </div>

                {!formData.sendImmediately && (
                  <div>
                    <Label htmlFor="scheduledFor">تاريخ ووقت الإرسال</Label>
                    <Input
                      id="scheduledFor"
                      type="datetime-local"
                      value={formData.scheduledFor}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recipient Count */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  المستلمين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#01645e] mb-2">
                    {recipientCount.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">مستلم سيحصل على الرسالة</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>الإجراءات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setPreviewMode(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  معاينة الرسالة
                </Button>

                <Button
                  onClick={() => handleSubmit('save')}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  حفظ كمسودة
                </Button>

                <Button
                  onClick={() => handleSubmit('send')}
                  className="w-full bg-[#3ab666] hover:bg-[#3ab666]/90"
                  disabled={loading || recipientCount === 0}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {formData.sendImmediately ? 'إرسال الآن' : 'جدولة الإرسال'}
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>نصائح</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• استخدم عنوان واضح وجذاب</p>
                <p>• اكتب محتوى مفيد ومختصر</p>
                <p>• تأكد من اختيار الجمهور المناسب</p>
                <p>• راجع الرسالة قبل الإرسال</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
