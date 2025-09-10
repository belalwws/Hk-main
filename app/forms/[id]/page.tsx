"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

interface FormField {
  id: string
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox'
  label: string
  required: boolean
  options?: string[]
}

interface Form {
  id: string
  title: string
  description: string
  status: 'draft' | 'published' | 'closed'
  isPublic: boolean
  fields: FormField[]
}

export default function FormPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchForm()
  }, [params.id])

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/forms/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setForm(data.form)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching form:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/forms/${params.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          userId: user?.id
        })
      })

      const data = await response.json()
      if (data.success) {
        setSubmitted(true)
      } else {
        alert(`خطأ: ${data.error}`)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('حدث خطأ في إرسال النموذج')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#01645e] text-lg">جاري تحميل النموذج...</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#01645e] mb-2">النموذج غير موجود</h2>
            <p className="text-gray-600 mb-4">النموذج المطلوب غير موجود أو تم حذفه</p>
            <Button onClick={() => router.push('/')} className="bg-[#01645e] text-white">
              العودة للصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (form.status !== 'published') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#01645e] mb-2">النموذج غير متاح</h2>
            <p className="text-gray-600 mb-4">هذا النموذج غير متاح حالياً</p>
            <Button onClick={() => router.push('/')} className="bg-[#01645e] text-white">
              العودة للصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#01645e] mb-2">تم إرسال النموذج بنجاح!</h2>
            <p className="text-gray-600 mb-4">شكراً لكم على المشاركة</p>
            <Button onClick={() => router.push('/')} className="bg-[#01645e] text-white">
              العودة للصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                <FileText className="w-6 h-6" />
                {form.title}
              </CardTitle>
              {form.description && (
                <CardDescription className="text-white/90 text-lg">
                  {form.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {form.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium text-[#01645e]">
                      {field.label}
                      {field.required && <span className="text-red-500 mr-1">*</span>}
                    </label>
                    
                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01645e]"
                      />
                    )}
                    
                    {field.type === 'textarea' && (
                      <textarea
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01645e]"
                      />
                    )}
                    
                    {field.type === 'select' && field.options && (
                      <select
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01645e]"
                      >
                        <option value="">اختر...</option>
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {field.type === 'radio' && field.options && (
                      <div className="space-y-2">
                        {field.options.map((option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="radio"
                              name={field.id}
                              value={option}
                              checked={formData[field.id] === option}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              required={field.required}
                              className="ml-2"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {field.type === 'checkbox' && field.options && (
                      <div className="space-y-2">
                        {field.options.map((option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="checkbox"
                              value={option}
                              checked={formData[field.id]?.includes(option) || false}
                              onChange={(e) => {
                                const currentValues = formData[field.id] || []
                                if (e.target.checked) {
                                  handleInputChange(field.id, [...currentValues, option])
                                } else {
                                  handleInputChange(field.id, currentValues.filter((v: string) => v !== option))
                                }
                              }}
                              className="ml-2"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="flex gap-4 justify-end">
                  <Button
                    type="button"
                    onClick={() => router.push('/')}
                    variant="outline"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#01645e] text-white hover:bg-[#3ab666]"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 ml-2" />
                        إرسال
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
