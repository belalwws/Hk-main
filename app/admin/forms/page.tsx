"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, FileText, Eye, Edit, Trash2, Users, Calendar, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Form {
  id: string
  title: string
  description: string
  status: 'draft' | 'published' | 'closed'
  isPublic: boolean
  createdAt: string
  updatedAt: string
  _count: {
    responses: number
  }
}

export default function FormsManagement() {
  const { user } = useAuth()
  const router = useRouter()
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }
    fetchForms()
  }, [user, router])

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/admin/forms')
      if (response.ok) {
        const data = await response.json()
        setForms(data.forms)
      }
    } catch (error) {
      console.error('Error fetching forms:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteForm = async (formId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا النموذج؟ سيتم حذف جميع الردود أيضاً.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/forms/${formId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setForms(forms.filter(form => form.id !== formId))
        alert('تم حذف النموذج بنجاح')
      } else {
        alert('فشل في حذف النموذج')
      }
    } catch (error) {
      console.error('Error deleting form:', error)
      alert('حدث خطأ في حذف النموذج')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'مسودة', color: 'bg-gray-500' },
      published: { label: 'منشور', color: 'bg-green-500' },
      closed: { label: 'مغلق', color: 'bg-red-500' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#01645e] font-medium">جاري تحميل النماذج...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#01645e] mb-2">إدارة النماذج</h1>
              <p className="text-[#8b7632] text-lg">إنشاء وإدارة النماذج ومتابعة الردود</p>
            </div>
            <Link href="/admin/forms/create">
              <Button className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-5 h-5 ml-2" />
                إنشاء نموذج جديد
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">إجمالي النماذج</p>
                  <p className="text-3xl font-bold">{forms.length}</p>
                </div>
                <FileText className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#3ab666] to-[#c3e956] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">النماذج المنشورة</p>
                  <p className="text-3xl font-bold">{forms.filter(f => f.status === 'published').length}</p>
                </div>
                <Eye className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#8b7632] to-[#c3e956] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">إجمالي الردود</p>
                  <p className="text-3xl font-bold">{forms.reduce((sum, form) => sum + form._count.responses, 0)}</p>
                </div>
                <Users className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#6c757d] to-[#8b7632] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">المسودات</p>
                  <p className="text-3xl font-bold">{forms.filter(f => f.status === 'draft').length}</p>
                </div>
                <Edit className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Forms List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {forms.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="w-16 h-16 text-[#01645e]/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#01645e] mb-2">لا توجد نماذج</h3>
                <p className="text-[#8b7632] mb-6">ابدأ بإنشاء نموذج جديد لجمع البيانات من المستخدمين</p>
                <Link href="/admin/forms/create">
                  <Button className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white">
                    <Plus className="w-4 h-4 ml-2" />
                    إنشاء أول نموذج
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form, index) => (
                <motion.div
                  key={form.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-[#01645e] text-lg mb-2">{form.title}</CardTitle>
                          <CardDescription className="text-sm text-[#8b7632]">
                            {form.description || 'لا يوجد وصف'}
                          </CardDescription>
                        </div>
                        {getStatusBadge(form.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#8b7632]">عدد الردود:</span>
                          <span className="font-semibold text-[#01645e]">{form._count.responses}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#8b7632]">تاريخ الإنشاء:</span>
                          <span className="text-[#01645e]">{new Date(form.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#8b7632]">عام:</span>
                          <Badge variant="outline" className={form.isPublic ? 'border-green-500 text-green-600' : 'border-orange-500 text-orange-600'}>
                            {form.isPublic ? 'عام' : 'خاص'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-6">
                        <Link href={`/admin/forms/${form.id}/responses`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full border-[#3ab666] text-[#3ab666] hover:bg-[#3ab666] hover:text-white">
                            <BarChart3 className="w-4 h-4 ml-1" />
                            الردود
                          </Button>
                        </Link>
                        <Link href={`/admin/forms/${form.id}/edit`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full border-[#01645e] text-[#01645e] hover:bg-[#01645e] hover:text-white">
                            <Edit className="w-4 h-4 ml-1" />
                            تعديل
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteForm(form.id)}
                          className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
