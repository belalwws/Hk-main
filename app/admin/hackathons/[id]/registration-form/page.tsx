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
  ToggleLeft,
  Code,
  Copy,
  CheckCircle2,
  Globe,
  Clock,
  Upload,
  Image as ImageIcon,
  X,
  CreditCard,
  Palette
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'idNumber' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
  }
  conditional?: {
    enabled: boolean
    showWhen: string // ID of the field to watch
    showWhenValue: string // Value that triggers this field to show
  }
}

interface RegistrationForm {
  id?: string
  hackathonId: string
  title: string
  description: string
  coverImage?: string
  isActive: boolean
  fields: FormField[]
  settings: {
    allowMultipleSubmissions: boolean
    requireApproval: boolean
    sendConfirmationEmail: boolean
    redirectUrl?: string
  }
  colors?: {
    primary: string
    secondary: string
    accent: string
    buttonText: string
  }
}

export default function HackathonRegistrationFormPage() {
  const params = useParams()
  const router = useRouter()
  const hackathonId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [hackathon, setHackathon] = useState<any>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string>('')
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
    },
    colors: {
      primary: '#01645e',
      secondary: '#3ab666',
      accent: '#f59e0b',
      buttonText: '#ffffff'
    }
  })

  useEffect(() => {
    fetchHackathon()
    fetchExistingForm()
    fetchAPIKey()
  }, [hackathonId])

  const fetchAPIKey = async () => {
    try {
      const response = await fetch('/api/admin/api-key')
      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey)
      }
    } catch (error) {
      console.error('Error fetching API key:', error)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const generateRequestBody = () => {
    const body: any = {
      hackathonId: hackathonId
    }

    form.fields.forEach(field => {
      if (field.type === 'text' || field.type === 'email' || field.type === 'phone') {
        body[field.id] = `string${field.required ? ' (required)' : ' (optional)'}`
      } else if (field.type === 'textarea') {
        body[field.id] = `string${field.required ? ' (required)' : ' (optional)'}`
      } else if (field.type === 'select' || field.type === 'radio') {
        body[field.id] = `"${field.options?.[0] || 'option'}"${field.required ? ' (required)' : ' (optional)'}`
      } else if (field.type === 'checkbox') {
        body[field.id] = `boolean${field.required ? ' (required)' : ' (optional)'}`
      } else if (field.type === 'date') {
        body[field.id] = `"2025-01-01"${field.required ? ' (required)' : ' (optional)'}`
      }
    })

    return JSON.stringify(body, null, 2)
  }

  const generateRequestExample = () => {
    const example: any = {
      hackathonId: hackathonId
    }

    form.fields.forEach(field => {
      if (field.id === 'name') {
        example[field.id] = 'أحمد محمد'
      } else if (field.id === 'email') {
        example[field.id] = 'ahmed@example.com'
      } else if (field.id === 'phone') {
        example[field.id] = '0501234567'
      } else if (field.type === 'text') {
        example[field.id] = `مثال ${field.label}`
      } else if (field.type === 'textarea') {
        example[field.id] = `نص طويل لـ ${field.label}`
      } else if (field.type === 'select' || field.type === 'radio') {
        example[field.id] = field.options?.[0] || 'خيار 1'
      } else if (field.type === 'checkbox') {
        example[field.id] = true
      } else if (field.type === 'date') {
        example[field.id] = '2025-01-15'
      }
    })

    return JSON.stringify(example, null, 2)
  }

  const fetchHackathon = async () => {
    try {
      const response = await fetch(`/api/hackathons/${hackathonId}`)
      if (response.ok) {
        const data = await response.json()
        const hackathonData = data.hackathon || data
        setHackathon(hackathonData)
        setForm(prev => ({
          ...prev,
          title: `نموذج التسجيل - ${hackathonData.title}`,
          description: `نموذج التسجيل في ${hackathonData.title}`
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

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار صورة فقط')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت')
      return
    }

    setUploadingCover(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'hackathon-forms')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok && data.url) {
        setForm(prev => ({ ...prev, coverImage: data.url }))
        alert('✅ تم رفع صورة الغلاف بنجاح!')
      } else {
        alert('❌ فشل رفع الصورة: ' + (data.error || 'خطأ غير معروف'))
      }
    } catch (error) {
      console.error('Error uploading cover:', error)
      alert('❌ حدث خطأ أثناء رفع الصورة')
    } finally {
      setUploadingCover(false)
    }
  }

  const removeCoverImage = () => {
    setForm(prev => ({ ...prev, coverImage: undefined }))
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
      console.log('💾 Saving form:', form)

      const response = await fetch(`/api/admin/hackathons/${hackathonId}/registration-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await response.json()
      console.log('📥 Save response:', data)

      if (response.ok) {
        alert('✅ تم حفظ النموذج بنجاح!')
        // Reload the form to get the saved data
        await fetchExistingForm()
      } else {
        alert(data.error || 'حدث خطأ في حفظ النموذج')
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
      case 'idNumber': return CreditCard
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
    { value: 'idNumber', label: 'رقم الهوية' },
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

                {/* Cover Image Upload */}
                <div>
                  <Label htmlFor="coverImage" className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    صورة الغلاف
                  </Label>
                  <div className="mt-2 space-y-3">
                    {form.coverImage ? (
                      <div className="relative">
                        <img
                          src={form.coverImage}
                          alt="Cover"
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeCoverImage}
                        >
                          <X className="w-4 h-4 mr-1" />
                          حذف
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#01645e] transition-colors">
                        <input
                          type="file"
                          id="coverImage"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          disabled={uploadingCover}
                          className="hidden"
                        />
                        <label
                          htmlFor="coverImage"
                          className="cursor-pointer flex flex-col items-center gap-3"
                        >
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            {uploadingCover ? (
                              <div className="w-6 h-6 border-2 border-[#01645e] border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Upload className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {uploadingCover ? 'جاري الرفع...' : 'انقر لرفع صورة الغلاف'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, GIF حتى 5MB
                            </p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
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

            {/* Colors Customization */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#01645e]" />
                  <div>
                    <CardTitle>تخصيص الألوان</CardTitle>
                    <CardDescription>تخصيص ألوان الفورم حسب هوية الهاكاثون</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="primaryColor" className="flex items-center gap-2 mb-2">
                      اللون الأساسي
                      <div 
                        className="w-6 h-6 rounded border-2 border-gray-300"
                        style={{ backgroundColor: form.colors?.primary || '#01645e' }}
                      />
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={form.colors?.primary || '#01645e'}
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          colors: { ...prev.colors!, primary: e.target.value }
                        }))}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={form.colors?.primary || '#01645e'}
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          colors: { ...prev.colors!, primary: e.target.value }
                        }))}
                        placeholder="#01645e"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondaryColor" className="flex items-center gap-2 mb-2">
                      اللون الثانوي
                      <div 
                        className="w-6 h-6 rounded border-2 border-gray-300"
                        style={{ backgroundColor: form.colors?.secondary || '#3ab666' }}
                      />
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={form.colors?.secondary || '#3ab666'}
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          colors: { ...prev.colors!, secondary: e.target.value }
                        }))}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={form.colors?.secondary || '#3ab666'}
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          colors: { ...prev.colors!, secondary: e.target.value }
                        }))}
                        placeholder="#3ab666"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accentColor" className="flex items-center gap-2 mb-2">
                      لون التمييز
                      <div 
                        className="w-6 h-6 rounded border-2 border-gray-300"
                        style={{ backgroundColor: form.colors?.accent || '#f59e0b' }}
                      />
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={form.colors?.accent || '#f59e0b'}
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          colors: { ...prev.colors!, accent: e.target.value }
                        }))}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={form.colors?.accent || '#f59e0b'}
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          colors: { ...prev.colors!, accent: e.target.value }
                        }))}
                        placeholder="#f59e0b"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="buttonTextColor" className="flex items-center gap-2 mb-2">
                      لون نص الأزرار
                      <div 
                        className="w-6 h-6 rounded border-2 border-gray-300"
                        style={{ backgroundColor: form.colors?.buttonText || '#ffffff' }}
                      />
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="buttonTextColor"
                        type="color"
                        value={form.colors?.buttonText || '#ffffff'}
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          colors: { ...prev.colors!, buttonText: e.target.value }
                        }))}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={form.colors?.buttonText || '#ffffff'}
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          colors: { ...prev.colors!, buttonText: e.target.value }
                        }))}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="mt-6 p-6 border-2 border-dashed rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-4">معاينة الألوان:</p>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      style={{ 
                        backgroundColor: form.colors?.primary || '#01645e',
                        color: form.colors?.buttonText || '#ffffff'
                      }}
                      className="shadow-md"
                    >
                      زر بالألوان الجديدة
                    </Button>
                    <div 
                      className="px-4 py-2 rounded-md font-medium"
                      style={{ 
                        backgroundColor: form.colors?.secondary || '#3ab666',
                        color: form.colors?.buttonText || '#ffffff'
                      }}
                    >
                      اللون الثانوي
                    </div>
                    <div 
                      className="px-4 py-2 rounded-md font-medium"
                      style={{ 
                        backgroundColor: form.colors?.accent || '#f59e0b',
                        color: form.colors?.buttonText || '#ffffff'
                      }}
                    >
                      لون التمييز
                    </div>
                  </div>
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

                        {/* Conditional Logic */}
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-3">
                            <Switch
                              checked={field.conditional?.enabled || false}
                              onCheckedChange={(checked) => updateField(field.id, {
                                conditional: {
                                  enabled: checked,
                                  showWhen: field.conditional?.showWhen || '',
                                  showWhenValue: field.conditional?.showWhenValue || ''
                                }
                              })}
                            />
                            <Label className="mr-2 font-medium text-blue-900">
                              حقل شرطي (يظهر عند شرط معين)
                            </Label>
                          </div>

                          {field.conditional?.enabled && (
                            <div className="space-y-3 mt-3">
                              <div>
                                <Label className="text-sm text-blue-800">يظهر عندما:</Label>
                                <Select
                                  value={field.conditional?.showWhen || ''}
                                  onValueChange={(value) => updateField(field.id, {
                                    conditional: {
                                      ...field.conditional!,
                                      showWhen: value
                                    }
                                  })}
                                >
                                  <SelectTrigger className="mt-1 bg-white">
                                    <SelectValue placeholder="اختر الحقل..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {form.fields
                                      .filter(f => 
                                        f.id !== field.id && 
                                        (f.type === 'select' || f.type === 'radio')
                                      )
                                      .map((f) => (
                                        <SelectItem key={f.id} value={f.id}>
                                          {f.label}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {field.conditional?.showWhen && (
                                <div>
                                  <Label className="text-sm text-blue-800">يساوي:</Label>
                                  <Select
                                    value={field.conditional?.showWhenValue || ''}
                                    onValueChange={(value) => updateField(field.id, {
                                      conditional: {
                                        ...field.conditional!,
                                        showWhenValue: value
                                      }
                                    })}
                                  >
                                    <SelectTrigger className="mt-1 bg-white">
                                      <SelectValue placeholder="اختر القيمة..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {form.fields
                                        .find(f => f.id === field.conditional?.showWhen)
                                        ?.options?.map((option) => (
                                          <SelectItem key={option} value={option}>
                                            {option}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              <p className="text-xs text-blue-700 mt-2">
                                💡 هذا الحقل سيظهر فقط عندما يختار المستخدم "{field.conditional?.showWhenValue}" في حقل "{form.fields.find(f => f.id === field.conditional?.showWhen)?.label}"
                              </p>
                            </div>
                          )}
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

        {/* API Documentation Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Code className="w-6 h-6 text-[#01645e]" />
                External API Documentation
              </CardTitle>
              <CardDescription>
                استخدم هذه الـ APIs لربط موقعك الخارجي بهذا الهاكاثون
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="register" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="register">تسجيل مشارك</TabsTrigger>
                  <TabsTrigger value="countdown">العد التنازلي</TabsTrigger>
                  <TabsTrigger value="info">معلومات الهاكاثون</TabsTrigger>
                </TabsList>

                {/* Register API */}
                <TabsContent value="register" className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600">POST</Badge>
                      <code className="text-sm">
                        {typeof window !== 'undefined' ? window.location.origin : ''}/api/external/register
                      </code>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(
                        `${typeof window !== 'undefined' ? window.location.origin : ''}/api/external/register`,
                        'register-url'
                      )}
                      variant="outline"
                      size="sm"
                    >
                      {copied === 'register-url' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* API Key */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block">API Key:</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-gray-100 p-3 rounded-lg font-mono text-sm">
                        {apiKey || 'جاري التحميل...'}
                      </code>
                      <Button
                        onClick={() => copyToClipboard(apiKey, 'api-key')}
                        variant="outline"
                        size="sm"
                      >
                        {copied === 'api-key' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      أضف في الـ Header: <code className="bg-gray-100 px-2 py-1 rounded">X-API-Key: {apiKey}</code>
                    </p>
                  </div>

                  {/* Request Body Schema */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Request Body Schema:</label>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm font-mono">{generateRequestBody()}</pre>
                    </div>
                  </div>

                  {/* Request Example */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Request Example:</label>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm font-mono">{generateRequestExample()}</pre>
                    </div>
                  </div>

                  {/* cURL Example */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block">cURL Example:</label>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto relative">
                      <pre className="text-sm font-mono">
{`curl -X POST "${typeof window !== 'undefined' ? window.location.origin : ''}/api/external/register" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '${generateRequestExample()}'`}
                      </pre>
                      <Button
                        onClick={() => copyToClipboard(
                          `curl -X POST "${typeof window !== 'undefined' ? window.location.origin : ''}/api/external/register" -H "Content-Type: application/json" -H "X-API-Key: ${apiKey}" -d '${generateRequestExample()}'`,
                          'curl-register'
                        )}
                        variant="outline"
                        size="sm"
                        className="absolute top-2 left-2"
                      >
                        {copied === 'curl-register' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Response Example */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Response Example:</label>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm font-mono">
{`{
  "success": true,
  "message": "Registration successful",
  "participant": {
    "id": "...",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "status": "pending",
    "registeredAt": "2025-01-15T10:30:00.000Z"
  }
}`}
                      </pre>
                    </div>
                  </div>
                </TabsContent>

                {/* Countdown API */}
                <TabsContent value="countdown" className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600">GET</Badge>
                      <code className="text-sm">
                        {typeof window !== 'undefined' ? window.location.origin : ''}/api/external/countdown/{hackathonId}
                      </code>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(
                        `${typeof window !== 'undefined' ? window.location.origin : ''}/api/external/countdown/${hackathonId}`,
                        'countdown-url'
                      )}
                      variant="outline"
                      size="sm"
                    >
                      {copied === 'countdown-url' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* cURL Example */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block">cURL Example:</label>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm font-mono">
{`curl -X GET "${typeof window !== 'undefined' ? window.location.origin : ''}/api/external/countdown/${hackathonId}" \\
  -H "X-API-Key: ${apiKey}"`}
                      </pre>
                    </div>
                  </div>

                  {/* Response Example */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Response Example:</label>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm font-mono">
{`{
  "success": true,
  "hackathon": {
    "id": "${hackathonId}",
    "title": "${hackathon?.title || 'هاكاثون الباحة 2025'}",
    "startDate": "2025-02-15T09:00:00.000Z",
    "endDate": "2025-02-17T18:00:00.000Z",
    "status": "upcoming",
    "countdown": {
      "label": "يبدأ خلال",
      "days": 15,
      "hours": 8,
      "minutes": 30,
      "seconds": 45,
      "totalSeconds": 1324245,
      "formatted": "15 يوم، 8 ساعة، 30 دقيقة، 45 ثانية"
    }
  }
}`}
                      </pre>
                    </div>
                  </div>
                </TabsContent>

                {/* Hackathon Info API */}
                <TabsContent value="info" className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600">GET</Badge>
                      <code className="text-sm">
                        {typeof window !== 'undefined' ? window.location.origin : ''}/api/external/hackathon/{hackathonId}
                      </code>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(
                        `${typeof window !== 'undefined' ? window.location.origin : ''}/api/external/hackathon/${hackathonId}`,
                        'info-url'
                      )}
                      variant="outline"
                      size="sm"
                    >
                      {copied === 'info-url' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* cURL Example */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block">cURL Example:</label>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm font-mono">
{`curl -X GET "${typeof window !== 'undefined' ? window.location.origin : ''}/api/external/hackathon/${hackathonId}" \\
  -H "X-API-Key: ${apiKey}"`}
                      </pre>
                    </div>
                  </div>

                  {/* Response Example */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Response Example:</label>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm font-mono">
{`{
  "success": true,
  "hackathon": {
    "id": "${hackathonId}",
    "title": "${hackathon?.title || 'هاكاثون الباحة 2025'}",
    "description": "...",
    "startDate": "2025-02-15T09:00:00.000Z",
    "endDate": "2025-02-17T18:00:00.000Z",
    "location": "الباحة",
    "maxParticipants": 100,
    "currentParticipants": 45,
    "status": "upcoming",
    "registrationOpen": true,
    "registrationForm": {
      "id": "...",
      "title": "نموذج التسجيل",
      "fields": ${JSON.stringify(form.fields.map(f => ({ id: f.id, label: f.label, type: f.type, required: f.required })), null, 6)}
    }
  }
}`}
                      </pre>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
