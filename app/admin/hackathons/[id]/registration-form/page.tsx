"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Eye, 
  Settings,
  FormInput,
  List,
  Calendar,
  Mail,
  Phone,
  User,
  FileText,
  ToggleLeft
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
  }
}

interface RegistrationForm {
  id?: string
  hackathonId: string
  title: string
  description: string
  isActive: boolean
  fields: FormField[]
  settings: {
    allowMultipleSubmissions: boolean
    requireApproval: boolean
    sendConfirmationEmail: boolean
    redirectUrl?: string
  }
}

export default function HackathonRegistrationFormPage() {
  const params = useParams()
  const router = useRouter()
  const hackathonId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [hackathon, setHackathon] = useState<any>(null)
  const [form, setForm] = useState<RegistrationForm>({
    hackathonId,
    title: 'نموذج التسجيل',
    description: 'نموذج التسجيل في الهاكاثون',
    isActive: true,
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'الاسم الكامل',
        placeholder: 'اكتب اسمك الكامل',
        required: true,
        validation: { minLength: 2, maxLength: 100 }
      },
      {
        id: 'email',
        type: 'email',
        label: 'البريد الإلكتروني',
        placeholder: 'example@email.com',
        required: true
      },
      {
        id: 'phone',
        type: 'phone',
        label: 'رقم الهاتف',
        placeholder: '+966xxxxxxxxx',
        required: true
      }
    ],
    settings: {
      allowMultipleSubmissions: false,
      requireApproval: true,
      sendConfirmationEmail: true
    }
  })

  useEffect(() => {
    fetchHackathon()
    fetchExistingForm()
  }, [hackathonId])

  const fetchHackathon = async () => {
    try {
      const response = await fetch(`/api/hackathons/${hackathonId}`)
      if (response.ok) {
        const data = await response.json()
        setHackathon(data)
        setForm(prev => ({
          ...prev,
          title: `نموذج التسجيل - ${data.title}`,
          description: `نموذج التسجيل في ${data.title}`
        }))
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error)
    }
  }

  const fetchExistingForm = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/registration-form`)
      if (response.ok) {
        const data = await response.json()
        if (data.form) {
          setForm(data.form)
        }
      }
    } catch (error) {
      console.error('Error fetching form:', error)
    }
  }

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'حقل جديد',
      placeholder: '',
      required: false
    }
    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }))
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }))
  }

  const removeField = (fieldId: string) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }))
  }

  const addOption = (fieldId: string) => {
    updateField(fieldId, {
      options: [...(form.fields.find(f => f.id === fieldId)?.options || []), 'خيار جديد']
    })
  }

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = form.fields.find(f => f.id === fieldId)
    if (field?.options) {
      const newOptions = [...field.options]
      newOptions[optionIndex] = value
      updateField(fieldId, { options: newOptions })
    }
  }

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = form.fields.find(f => f.id === fieldId)
    if (field?.options) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex)
      updateField(fieldId, { options: newOptions })
    }
  }

  const saveForm = async () => {
    if (!form.title.trim()) {
      alert('يرجى إدخال عنوان النموذج')
      return
    }

    if (form.fields.length === 0) {
      alert('يرجى إضافة حقل واحد على الأقل')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/registration-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        alert('تم حفظ النموذج بنجاح')
        router.push(`/admin/hackathons/${hackathonId}`)
      } else {
        const error = await response.json()
        alert(error.error || 'حدث خطأ في حفظ النموذج')
      }
    } catch (error) {
      console.error('Error saving form:', error)
      alert('حدث خطأ في حفظ النموذج')
    } finally {
      setLoading(false)
    }
  }

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text': return User
      case 'email': return Mail
      case 'phone': return Phone
      case 'textarea': return FileText
      case 'select': return List
      case 'checkbox': return ToggleLeft
      case 'radio': return ToggleLeft
      case 'date': return Calendar
      case 'file': return FileText
      default: return FormInput
    }
  }

  const fieldTypes = [
    { value: 'text', label: 'نص' },
    { value: 'email', label: 'بريد إلكتروني' },
    { value: 'phone', label: 'رقم هاتف' },
    { value: 'textarea', label: 'نص طويل' },
    { value: 'select', label: 'قائمة منسدلة' },
    { value: 'checkbox', label: 'مربع اختيار' },
    { value: 'radio', label: 'اختيار واحد' },
    { value: 'date', label: 'تاريخ' },
    { value: 'file', label: 'رفع ملف' }
  ]

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
            <Link href={`/admin/hackathons/${hackathonId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                العودة
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FormInput className="w-8 h-8 text-[#01645e]" />
              نموذج التسجيل الديناميكي
            </h1>
          </div>
          {hackathon && (
            <p className="text-gray-600">
              إنشاء وتخصيص نموذج التسجيل لـ {hackathon.title}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form Settings */}
            <Card>
              <CardHeader>
                <CardTitle>إعدادات النموذج</CardTitle>
                <CardDescription>الإعدادات الأساسية للنموذج</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">عنوان النموذج</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="عنوان النموذج"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">وصف النموذج</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف النموذج"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={form.isActive}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive" className="mr-2">
                    النموذج مفعل
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Form Fields */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>حقول النموذج</CardTitle>
                    <CardDescription>إضافة وتخصيص حقول النموذج</CardDescription>
                  </div>
                  <Button onClick={addField} className="bg-[#3ab666] hover:bg-[#3ab666]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة حقل
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {form.fields.map((field, index) => {
                    const FieldIcon = getFieldIcon(field.type)
                    
                    return (
                      <div key={field.id} className="p-4 border rounded-lg bg-white">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <FieldIcon className="w-5 h-5 text-[#01645e]" />
                            <span className="font-medium">حقل {index + 1}</span>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeField(field.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>نوع الحقل</Label>
                            <Select
                              value={field.type}
                              onValueChange={(value: any) => updateField(field.id, { type: value })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>تسمية الحقل</Label>
                            <Input
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              placeholder="تسمية الحقل"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label>النص التوضيحي</Label>
                            <Input
                              value={field.placeholder || ''}
                              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                              placeholder="النص التوضيحي"
                              className="mt-1"
                            />
                          </div>

                          <div className="flex items-center space-x-2 pt-6">
                            <Switch
                              checked={field.required}
                              onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                            />
                            <Label className="mr-2">حقل مطلوب</Label>
                          </div>
                        </div>

                        {/* Options for select/radio/checkbox */}
                        {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <Label>الخيارات</Label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addOption(field.id)}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                إضافة خيار
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {field.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                                    placeholder={`خيار ${optionIndex + 1}`}
                                  />
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeOption(field.id, optionIndex)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Form Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  إعدادات متقدمة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={form.settings.allowMultipleSubmissions}
                    onCheckedChange={(checked) => setForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings, allowMultipleSubmissions: checked }
                    }))}
                  />
                  <Label className="mr-2 text-sm">السماح بتسجيلات متعددة</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={form.settings.requireApproval}
                    onCheckedChange={(checked) => setForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings, requireApproval: checked }
                    }))}
                  />
                  <Label className="mr-2 text-sm">يتطلب موافقة الأدمن</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={form.settings.sendConfirmationEmail}
                    onCheckedChange={(checked) => setForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings, sendConfirmationEmail: checked }
                    }))}
                  />
                  <Label className="mr-2 text-sm">إرسال إيميل تأكيد</Label>
                </div>

                <div>
                  <Label className="text-sm">رابط التوجيه بعد التسجيل</Label>
                  <Input
                    value={form.settings.redirectUrl || ''}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings, redirectUrl: e.target.value }
                    }))}
                    placeholder="https://example.com/success"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>الإجراءات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/hackathons/${hackathonId}/register-form`} target="_blank">
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    معاينة النموذج
                  </Button>
                </Link>

                <Button
                  onClick={saveForm}
                  className="w-full bg-[#01645e] hover:bg-[#01645e]/90"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  حفظ النموذج
                </Button>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• عدد الحقول: {form.fields.length}</p>
                <p>• الحقول المطلوبة: {form.fields.filter(f => f.required).length}</p>
                <p>• الحالة: {form.isActive ? 'مفعل' : 'معطل'}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
