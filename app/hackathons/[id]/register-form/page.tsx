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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  ArrowLeft, 
  Send, 
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Users,
  Trophy
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
  id: string
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

export default function HackathonRegisterFormPage() {
  const params = useParams()
  const router = useRouter()
  const hackathonId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [hackathon, setHackathon] = useState<any>(null)
  const [form, setForm] = useState<RegistrationForm | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchHackathon()
    fetchForm()
  }, [hackathonId])

  const fetchHackathon = async () => {
    try {
      const response = await fetch(`/api/hackathons/${hackathonId}`)
      if (response.ok) {
        const data = await response.json()
        setHackathon(data)
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error)
    }
  }

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/hackathons/${hackathonId}/register-form`)
      if (response.ok) {
        const data = await response.json()
        if (data.form) {
          setForm(data.form)
          // Initialize form data with default values
          const initialData: Record<string, any> = {}
          data.form.fields.forEach((field: FormField) => {
            if (field.type === 'checkbox') {
              initialData[field.id] = []
            } else {
              initialData[field.id] = ''
            }
          })
          setFormData(initialData)
        }
      }
    } catch (error) {
      console.error('Error fetching form:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} مطلوب`
    }

    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'البريد الإلكتروني غير صحيح'
    }

    if (field.type === 'phone' && value && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(value)) {
      return 'رقم الهاتف غير صحيح'
    }

    if (field.validation?.minLength && value && value.length < field.validation.minLength) {
      return `يجب أن يكون ${field.label} ${field.validation.minLength} أحرف على الأقل`
    }

    if (field.validation?.maxLength && value && value.length > field.validation.maxLength) {
      return `يجب أن يكون ${field.label} ${field.validation.maxLength} أحرف كحد أقصى`
    }

    return null
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }))
    }
  }

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const currentValues = formData[fieldId] || []
    let newValues
    
    if (checked) {
      newValues = [...currentValues, option]
    } else {
      newValues = currentValues.filter((v: string) => v !== option)
    }
    
    handleFieldChange(fieldId, newValues)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form) return

    // Validate all fields
    const newErrors: Record<string, string> = {}
    form.fields.forEach(field => {
      const error = validateField(field, formData[field.id])
      if (error) {
        newErrors[field.id] = error
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/hackathons/${hackathonId}/register-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: form.id,
          data: formData
        })
      })

      if (response.ok) {
        const result = await response.json()
        setSubmitted(true)
        
        if (form.settings.redirectUrl) {
          setTimeout(() => {
            window.location.href = form.settings.redirectUrl!
          }, 3000)
        }
      } else {
        const error = await response.json()
        alert(error.error || 'حدث خطأ في التسجيل')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('حدث خطأ في التسجيل')
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const error = errors[field.id]
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div key={field.id}>
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={`mt-1 ${error ? 'border-red-500' : ''}`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.id}>
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={`mt-1 ${error ? 'border-red-500' : ''}`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )

      case 'select':
        return (
          <div key={field.id}>
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={formData[field.id] || ''}
              onValueChange={(value) => handleFieldChange(field.id, value)}
            >
              <SelectTrigger className={`mt-1 ${error ? 'border-red-500' : ''}`}>
                <SelectValue placeholder={field.placeholder || `اختر ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )

      case 'radio':
        return (
          <div key={field.id}>
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <RadioGroup
              value={formData[field.id] || ''}
              onValueChange={(value) => handleFieldChange(field.id, value)}
              className="mt-2"
            >
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}_${option}`} />
                  <Label htmlFor={`${field.id}_${option}`} className="mr-2">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.id}>
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="mt-2 space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}_${option}`}
                    checked={(formData[field.id] || []).includes(option)}
                    onCheckedChange={(checked) => handleCheckboxChange(field.id, option, checked as boolean)}
                  />
                  <Label htmlFor={`${field.id}_${option}`} className="mr-2">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )

      case 'date':
        return (
          <div key={field.id}>
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={`mt-1 ${error ? 'border-red-500' : ''}`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )

      case 'file':
        return (
          <div key={field.id}>
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type="file"
              onChange={(e) => handleFieldChange(field.id, e.target.files?.[0])}
              className={`mt-1 ${error ? 'border-red-500' : ''}`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    )
  }

  if (!form || !form.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">النموذج غير متاح</h2>
            <p className="text-gray-600 mb-4">
              نموذج التسجيل غير متاح حالياً أو تم إلغاء تفعيله
            </p>
            <Link href={`/hackathons/${hackathonId}`}>
              <Button>العودة للهاكاثون</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">تم التسجيل بنجاح!</h2>
            <p className="text-gray-600 mb-4">
              {form.settings.requireApproval 
                ? 'تم استلام طلبك وسيتم مراجعته قريباً'
                : 'تم تأكيد تسجيلك في الهاكاثون'
              }
            </p>
            {form.settings.sendConfirmationEmail && (
              <p className="text-sm text-gray-500 mb-4">
                ستصلك رسالة تأكيد على البريد الإلكتروني
              </p>
            )}
            <Link href={`/hackathons/${hackathonId}`}>
              <Button>العودة للهاكاثون</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

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
            <Link href={`/hackathons/${hackathonId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                العودة
              </Button>
            </Link>
          </div>
          
          {hackathon && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Trophy className="w-12 h-12 text-[#01645e] mt-1" />
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {hackathon.title}
                    </h1>
                    <p className="text-gray-600 mb-4">{hackathon.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(hackathon.startDate).toLocaleDateString('ar-SA')}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {hackathon.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {hackathon.participantCount || 0} مشارك
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>{form.title}</CardTitle>
            {form.description && (
              <CardDescription>{form.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields.map(renderField)}
              
              <div className="flex justify-end pt-6 border-t">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#01645e] hover:bg-[#01645e]/90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'جاري التسجيل...' : 'تسجيل'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
