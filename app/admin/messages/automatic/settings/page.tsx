"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Save, 
  Settings, 
  Mail,
  UserPlus,
  Trophy,
  CheckCircle,
  XCircle,
  Users,
  Award,
  Bell,
  Eye
} from 'lucide-react'
import Link from 'next/link'

interface AutoMessageTemplate {
  id: string
  type: string
  name: string
  description: string
  subject: string
  content: string
  isActive: boolean
  variables: string[]
}

export default function AutomaticMessagesSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<AutoMessageTemplate[]>([])
  const [activeTab, setActiveTab] = useState('')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/messages/automatic/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
        if (data.templates.length > 0 && !activeTab) {
          setActiveTab(data.templates[0].type)
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const updateTemplate = async (templateId: string, updates: Partial<AutoMessageTemplate>) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/messages/automatic/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        await fetchTemplates()
        alert('تم حفظ التغييرات بنجاح')
      } else {
        alert('حدث خطأ في حفظ التغييرات')
      }
    } catch (error) {
      console.error('Error updating template:', error)
      alert('حدث خطأ في حفظ التغييرات')
    } finally {
      setLoading(false)
    }
  }

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return UserPlus
      case 'hackathon_registration': return Users
      case 'registration_approved': return CheckCircle
      case 'registration_rejected': return XCircle
      case 'team_formation': return Users
      case 'evaluation_start': return Trophy
      case 'certificate_ready': return Award
      case 'password_sent': return Mail
      default: return Bell
    }
  }

  const getTemplateColor = (type: string) => {
    switch (type) {
      case 'user_registration': return 'text-blue-600'
      case 'hackathon_registration': return 'text-green-600'
      case 'registration_approved': return 'text-green-600'
      case 'registration_rejected': return 'text-red-600'
      case 'team_formation': return 'text-purple-600'
      case 'evaluation_start': return 'text-yellow-600'
      case 'certificate_ready': return 'text-[#01645e]'
      case 'password_sent': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const currentTemplate = templates.find(t => t.type === activeTab)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
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
              <Settings className="w-8 h-8 text-[#01645e]" />
              إعدادات الرسائل التلقائية
            </h1>
          </div>
          <p className="text-gray-600">
            إدارة وتخصيص الرسائل التي ترسل تلقائياً عند أحداث معينة في النظام
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Templates List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">أنواع الرسائل</CardTitle>
                <CardDescription>اختر نوع الرسالة لتعديلها</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {templates.map((template) => {
                    const Icon = getTemplateIcon(template.type)
                    const colorClass = getTemplateColor(template.type)
                    
                    return (
                      <button
                        key={template.id}
                        onClick={() => setActiveTab(template.type)}
                        className={`w-full text-right p-3 rounded-lg transition-colors ${
                          activeTab === template.type
                            ? 'bg-[#01645e] text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${activeTab === template.type ? 'text-white' : colorClass}`} />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{template.name}</div>
                            <div className={`text-xs ${activeTab === template.type ? 'text-gray-200' : 'text-gray-500'}`}>
                              {template.isActive ? 'مفعل' : 'معطل'}
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            template.isActive 
                              ? (activeTab === template.type ? 'bg-green-300' : 'bg-green-500')
                              : (activeTab === template.type ? 'bg-gray-300' : 'bg-gray-400')
                          }`} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Template Editor */}
          <div className="lg:col-span-3">
            {currentTemplate ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {React.createElement(getTemplateIcon(currentTemplate.type), {
                        className: `w-6 h-6 ${getTemplateColor(currentTemplate.type)}`
                      })}
                      <div>
                        <CardTitle>{currentTemplate.name}</CardTitle>
                        <CardDescription>{currentTemplate.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`active-${currentTemplate.id}`}>مفعل</Label>
                        <Switch
                          id={`active-${currentTemplate.id}`}
                          checked={currentTemplate.isActive}
                          onCheckedChange={(checked) => 
                            updateTemplate(currentTemplate.id, { isActive: checked })
                          }
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        معاينة
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Subject */}
                  <div>
                    <Label htmlFor="subject">عنوان الرسالة</Label>
                    <Input
                      id="subject"
                      value={currentTemplate.subject}
                      onChange={(e) => {
                        const updatedTemplates = templates.map(t => 
                          t.id === currentTemplate.id 
                            ? { ...t, subject: e.target.value }
                            : t
                        )
                        setTemplates(updatedTemplates)
                      }}
                      className="mt-1"
                      placeholder="اكتب عنوان الرسالة..."
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <Label htmlFor="content">محتوى الرسالة</Label>
                    <Textarea
                      id="content"
                      value={currentTemplate.content}
                      onChange={(e) => {
                        const updatedTemplates = templates.map(t => 
                          t.id === currentTemplate.id 
                            ? { ...t, content: e.target.value }
                            : t
                        )
                        setTemplates(updatedTemplates)
                      }}
                      rows={12}
                      className="mt-1"
                      placeholder="اكتب محتوى الرسالة..."
                    />
                  </div>

                  {/* Variables */}
                  {currentTemplate.variables.length > 0 && (
                    <div>
                      <Label>المتغيرات المتاحة</Label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                          يمكنك استخدام هذه المتغيرات في عنوان ومحتوى الرسالة:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {currentTemplate.variables.map((variable) => (
                            <code
                              key={variable}
                              className="px-2 py-1 bg-white border rounded text-sm text-[#01645e] cursor-pointer hover:bg-gray-100"
                              onClick={() => {
                                navigator.clipboard.writeText(`{${variable}}`)
                                alert(`تم نسخ {${variable}} إلى الحافظة`)
                              }}
                            >
                              {'{' + variable + '}'}
                            </code>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          انقر على أي متغير لنسخه إلى الحافظة
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => fetchTemplates()}
                    >
                      إلغاء التغييرات
                    </Button>
                    <Button
                      onClick={() => updateTemplate(currentTemplate.id, {
                        subject: currentTemplate.subject,
                        content: currentTemplate.content
                      })}
                      disabled={loading}
                      className="bg-[#01645e] hover:bg-[#01645e]/90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      حفظ التغييرات
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>اختر نوع رسالة من القائمة لبدء التعديل</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
