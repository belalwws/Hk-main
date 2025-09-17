"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Save, RotateCcw, Copy, Eye, Settings, FileText, Users, CheckCircle, XCircle, UserPlus, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/auth-context'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface EmailTemplate {
  subject: string
  body: string
}

interface EmailTemplates {
  registration_confirmation: EmailTemplate
  acceptance: EmailTemplate
  rejection: EmailTemplate
  team_formation: EmailTemplate
  evaluation_results: EmailTemplate
  reminder: EmailTemplate
  welcome: EmailTemplate
  certificate_ready: EmailTemplate
}

const TEMPLATE_NAMES = {
  registration_confirmation: 'تأكيد التسجيل',
  acceptance: 'إيميل القبول',
  rejection: 'إيميل الرفض',
  team_formation: 'تكوين الفريق',
  evaluation_results: 'نتائج التقييم',
  reminder: 'التذكير',
  welcome: 'رسالة الترحيب',
  certificate_ready: 'الشهادة جاهزة'
}

const TEMPLATE_DESCRIPTIONS = {
  registration_confirmation: 'يتم إرساله عند تسجيل المشارك في الهاكاثون',
  acceptance: 'يتم إرساله عند قبول المشارك في الهاكاثون',
  rejection: 'يتم إرساله عند رفض طلب المشاركة',
  team_formation: 'يتم إرساله عند تكوين الفرق',
  evaluation_results: 'يتم إرساله مع نتائج التقييم',
  reminder: 'يتم إرساله كتذكير للمشاركين',
  welcome: 'يتم إرساله كرسالة ترحيب للمستخدمين الجدد',
  certificate_ready: 'يتم إرساله عند جاهزية الشهادة للتحميل'
}

const TEMPLATE_ICONS = {
  registration_confirmation: UserPlus,
  acceptance: CheckCircle,
  rejection: XCircle,
  team_formation: Users,
  evaluation_results: FileText,
  reminder: Bell,
  welcome: Mail,
  certificate_ready: Settings
}

const AVAILABLE_VARIABLES = {
  common: [
    '{{participantName}}', '{{participantEmail}}', '{{hackathonTitle}}', 
    '{{hackathonDate}}', '{{hackathonTime}}', '{{hackathonLocation}}',
    '{{registrationDate}}', '{{organizerName}}', '{{organizerEmail}}'
  ],
  team: [
    '{{teamName}}', '{{teamNumber}}', '{{teamRole}}', '{{teamMembers}}'
  ],
  evaluation: [
    '{{teamRank}}', '{{totalScore}}', '{{isWinner}}', '{{certificateUrl}}'
  ],
  reminder: [
    '{{reminderType}}', '{{reminderMessage}}', '{{deadlineDate}}'
  ]
}

export default function EmailTemplatesPage() {
  const { user, loading: authLoading } = useAuth()
  const [templates, setTemplates] = useState<EmailTemplates | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTemplate, setActiveTemplate] = useState<keyof EmailTemplates>('registration_confirmation')
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      fetchTemplates()
    }
  }, [authLoading, user])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
      } else {
        console.error('Failed to fetch email templates')
      }
    } catch (error) {
      console.error('Error fetching email templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTemplates = async () => {
    if (!templates) return

    setSaving(true)
    try {
      const response = await fetch('/api/admin/email-templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ templates })
      })

      if (response.ok) {
        alert('✅ تم حفظ قوالب الإيميلات بنجاح!')
      } else {
        const error = await response.json()
        alert(`❌ خطأ في حفظ القوالب: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving email templates:', error)
      alert('❌ حدث خطأ في حفظ القوالب')
    } finally {
      setSaving(false)
    }
  }

  const resetToDefault = async (templateType: keyof EmailTemplates) => {
    if (!confirm('هل أنت متأكد من إعادة تعيين هذا القالب للإعدادات الافتراضية؟')) return

    try {
      const response = await fetch(`/api/admin/email-templates/default/${templateType}`)
      if (response.ok) {
        const data = await response.json()
        setTemplates(prev => prev ? {
          ...prev,
          [templateType]: data.template
        } : null)
        alert('✅ تم إعادة تعيين القالب للإعدادات الافتراضية')
      }
    } catch (error) {
      console.error('Error resetting template:', error)
      alert('❌ حدث خطأ في إعادة تعيين القالب')
    }
  }

  const updateTemplate = (templateType: keyof EmailTemplates, field: 'subject' | 'body', value: string) => {
    if (!templates) return
    
    setTemplates(prev => ({
      ...prev!,
      [templateType]: {
        ...prev![templateType],
        [field]: value
      }
    }))
  }

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable)
    alert(`تم نسخ المتغير: ${variable}`)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#01645e] font-medium">جاري تحميل قوالب الإيميلات...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#01645e] mb-2">غير مصرح</h1>
          <p className="text-[#8b7632]">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        </div>
      </div>
    )
  }

  if (!templates) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#01645e] mb-2">خطأ في تحميل القوالب</h1>
          <p className="text-[#8b7632]">حدث خطأ في تحميل قوالب الإيميلات</p>
          <Button onClick={fetchTemplates} className="mt-4">
            إعادة المحاولة
          </Button>
        </div>
      </div>
    )
  }

  const IconComponent = TEMPLATE_ICONS[activeTemplate]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-[#01645e] mb-2">إدارة قوالب الإيميلات</h1>
            <p className="text-[#8b7632] text-lg">تخصيص وإدارة قوالب الإيميلات التلقائية للنظام</p>
          </div>
          
          <div className="flex space-x-4 rtl:space-x-reverse">
            <Button
              onClick={handleSaveTemplates}
              disabled={saving}
              className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52]"
            >
              <Save className="w-5 h-5 ml-2" />
              {saving ? 'جاري الحفظ...' : 'حفظ جميع القوالب'}
            </Button>
            <Button
              onClick={() => setPreviewMode(!previewMode)}
              variant="outline"
            >
              <Eye className="w-5 h-5 ml-2" />
              {previewMode ? 'وضع التحرير' : 'وضع المعاينة'}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Templates List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[#01645e] flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  قوالب الإيميلات
                </CardTitle>
                <CardDescription>اختر القالب للتحرير</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(TEMPLATE_NAMES).map(([key, name]) => {
                  const IconComp = TEMPLATE_ICONS[key as keyof EmailTemplates]
                  return (
                    <Button
                      key={key}
                      onClick={() => setActiveTemplate(key as keyof EmailTemplates)}
                      variant={activeTemplate === key ? "default" : "ghost"}
                      className="w-full justify-start h-auto p-3"
                    >
                      <div className="flex items-center gap-3">
                        <IconComp className="w-4 h-4" />
                        <div className="text-right">
                          <div className="font-medium">{name}</div>
                          <div className="text-xs opacity-70">
                            {TEMPLATE_DESCRIPTIONS[key as keyof EmailTemplates]}
                          </div>
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Template Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-6 h-6 text-[#01645e]" />
                    <div>
                      <CardTitle className="text-xl text-[#01645e]">
                        {TEMPLATE_NAMES[activeTemplate]}
                      </CardTitle>
                      <CardDescription>
                        {TEMPLATE_DESCRIPTIONS[activeTemplate]}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={() => resetToDefault(activeTemplate)}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCcw className="w-4 h-4 ml-2" />
                    إعادة تعيين
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-[#01645e] mb-2">
                    عنوان الرسالة
                  </label>
                  <Input
                    value={templates[activeTemplate]?.subject || ''}
                    onChange={(e) => updateTemplate(activeTemplate, 'subject', e.target.value)}
                    placeholder="عنوان الرسالة..."
                    className="text-right"
                    disabled={previewMode}
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="block text-sm font-medium text-[#01645e] mb-2">
                    محتوى الرسالة
                  </label>
                  {previewMode ? (
                    <div
                      className="min-h-[300px] p-4 border rounded-md bg-gray-50 whitespace-pre-wrap text-right"
                      dangerouslySetInnerHTML={{
                        __html: templates[activeTemplate]?.body?.replace(/\n/g, '<br>') || ''
                      }}
                    />
                  ) : (
                    <Textarea
                      value={templates[activeTemplate]?.body || ''}
                      onChange={(e) => updateTemplate(activeTemplate, 'body', e.target.value)}
                      placeholder="محتوى الرسالة..."
                      className="min-h-[300px] text-right"
                      dir="rtl"
                    />
                  )}
                </div>

                {/* Template Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveTemplates}
                    disabled={saving}
                    size="sm"
                  >
                    <Save className="w-4 h-4 ml-2" />
                    حفظ
                  </Button>
                  <Button
                    onClick={() => resetToDefault(activeTemplate)}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCcw className="w-4 h-4 ml-2" />
                    إعادة تعيين
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Variables Helper */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="space-y-6">
              {/* Available Variables */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#01645e]">المتغيرات المتاحة</CardTitle>
                  <CardDescription>انقر على المتغير لنسخه</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="common" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="common">عامة</TabsTrigger>
                      <TabsTrigger value="specific">خاصة</TabsTrigger>
                    </TabsList>

                    <TabsContent value="common" className="space-y-2">
                      <div className="text-sm font-medium text-[#01645e] mb-2">متغيرات عامة</div>
                      {AVAILABLE_VARIABLES.common.map((variable) => (
                        <Badge
                          key={variable}
                          variant="outline"
                          className="cursor-pointer hover:bg-[#01645e] hover:text-white transition-colors mr-1 mb-1"
                          onClick={() => copyVariable(variable)}
                        >
                          {variable}
                        </Badge>
                      ))}
                    </TabsContent>

                    <TabsContent value="specific" className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-[#01645e] mb-2">متغيرات الفريق</div>
                        {AVAILABLE_VARIABLES.team.map((variable) => (
                          <Badge
                            key={variable}
                            variant="outline"
                            className="cursor-pointer hover:bg-[#3ab666] hover:text-white transition-colors mr-1 mb-1"
                            onClick={() => copyVariable(variable)}
                          >
                            {variable}
                          </Badge>
                        ))}
                      </div>

                      <div>
                        <div className="text-sm font-medium text-[#01645e] mb-2">متغيرات التقييم</div>
                        {AVAILABLE_VARIABLES.evaluation.map((variable) => (
                          <Badge
                            key={variable}
                            variant="outline"
                            className="cursor-pointer hover:bg-[#c3e956] hover:text-black transition-colors mr-1 mb-1"
                            onClick={() => copyVariable(variable)}
                          >
                            {variable}
                          </Badge>
                        ))}
                      </div>

                      <div>
                        <div className="text-sm font-medium text-[#01645e] mb-2">متغيرات التذكير</div>
                        {AVAILABLE_VARIABLES.reminder.map((variable) => (
                          <Badge
                            key={variable}
                            variant="outline"
                            className="cursor-pointer hover:bg-[#8b7632] hover:text-white transition-colors mr-1 mb-1"
                            onClick={() => copyVariable(variable)}
                          >
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Usage Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#01645e]">نصائح الاستخدام</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      استخدم المتغيرات لتخصيص المحتوى تلقائياً لكل مستخدم
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <Copy className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      انقر على أي متغير لنسخه إلى الحافظة
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <Eye className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      استخدم وضع المعاينة لرؤية شكل الرسالة النهائي
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
