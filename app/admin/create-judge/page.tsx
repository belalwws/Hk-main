"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Mail, User, Save, ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Judge {
  id: string
  name: string
  email: string
  isActive: boolean
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
  }
  _count: {
    scores: number
  }
}

export default function JudgeManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [judges, setJudges] = useState<Judge[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchJudges()
    }
  }, [user])

  const fetchJudges = async () => {
    try {
      const response = await fetch('/api/admin/judges')
      if (response.ok) {
        const data = await response.json()
        setJudges(data.judges || [])
      }
    } catch (error) {
      console.error('Error fetching judges:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const toggleJudgeStatus = async (judgeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/judges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ judgeId, isActive: !currentStatus })
      })

      if (response.ok) {
        await fetchJudges()
        alert(`تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} المحكم بنجاح`)
      } else {
        alert('حدث خطأ في تحديث المحكم')
      }
    } catch (error) {
      console.error('Error updating judge:', error)
      alert('حدث خطأ في تحديث المحكم')
    }
  }

  const deleteJudge = async (judgeId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المحكم؟')) return

    try {
      const response = await fetch(`/api/admin/judges?id=${judgeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchJudges()
        alert('تم حذف المحكم بنجاح')
      } else {
        alert('حدث خطأ في حذف المحكم')
      }
    } catch (error) {
      console.error('Error deleting judge:', error)
      alert('حدث خطأ في حذف المحكم')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('كلمات المرور غير متطابقة')
      return
    }

    if (formData.password.length < 6) {
      alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/create-judge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      if (response.ok) {
        alert('تم إنشاء المحكم بنجاح!')
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        })
        setShowCreateForm(false)
        await fetchJudges()
      } else {
        const error = await response.json()
        alert(error.error || 'حدث خطأ في إنشاء المحكم')
      }
    } catch (error) {
      console.error('Error creating judge:', error)
      alert('حدث خطأ في إنشاء المحكم')
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">غير مصرح</h2>
            <p className="text-gray-600">ليس لديك صلاحية للوصول لهذه الصفحة</p>
          </CardContent>
        </Card>
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
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للداشبورد
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-[#01645e]">إدارة المحكمين</h1>
              <p className="text-[#8b7632] text-lg">إدارة وإضافة المحكمين لتقييم المشاريع</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52]"
            >
              <Plus className="w-5 h-5 ml-2" />
              {showCreateForm ? 'إلغاء' : 'إضافة محكم جديد'}
            </Button>
            <Star className="w-12 h-12 text-[#c3e956]" />
          </div>
        </motion.div>

        {/* Create Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-[#01645e] flex items-center gap-2">
                <User className="w-6 h-6" />
                بيانات المحكم
              </CardTitle>
              <CardDescription>
                أدخل بيانات المحكم الجديد. سيتم إرسال بيانات الدخول عبر البريد الإلكتروني.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="أدخل الاسم الكامل للمحكم"
                      required
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="judge@example.com"
                      required
                      className="text-left"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="أدخل كلمة مرور قوية"
                      required
                      minLength={6}
                      className="text-left"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="أعد إدخال كلمة المرور"
                      required
                      minLength={6}
                      className="text-left"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">ملاحظات مهمة:</h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• سيتمكن المحكم من الدخول لنظام التقييم فقط</li>
                    <li>• سيتم إرسال بيانات الدخول عبر البريد الإلكتروني</li>
                    <li>• يمكن للمحكم تغيير كلمة المرور بعد أول دخول</li>
                    <li>• تأكد من صحة البريد الإلكتروني قبل الحفظ</li>
                  </ul>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] flex-1"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                    ) : (
                      <Save className="w-5 h-5 ml-2" />
                    )}
                    {loading ? 'جاري الإنشاء...' : 'إنشاء المحكم'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="px-8"
                    onClick={() => setShowCreateForm(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          </motion.div>
        )}

        {/* Judges List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-[#01645e] flex items-center gap-2">
                <Users className="w-6 h-6" />
                المحكمين الحاليين ({judges.length})
              </CardTitle>
              <CardDescription>
                قائمة بجميع المحكمين المسجلين في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              {judges.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">لا توجد محكمين مسجلين حتى الآن</p>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4 bg-gradient-to-r from-[#01645e] to-[#3ab666]"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أول محكم
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {judges.map((judge, index) => (
                    <motion.div
                      key={judge.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-[#01645e]">{judge.name}</h3>
                            <Badge className={`${
                              judge.isActive ? 'bg-green-500' : 'bg-red-500'
                            } text-white`}>
                              {judge.isActive ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">البريد الإلكتروني:</span>
                              <p className="text-[#01645e]">{judge.email}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">عدد التقييمات:</span>
                              <p className="text-[#01645e]">{judge._count.scores}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">تاريخ الإنضمام:</span>
                              <p className="text-[#01645e]">
                                {new Date(judge.createdAt).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mr-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleJudgeStatus(judge.id, judge.isActive)}
                            className={`${
                              judge.isActive
                                ? 'text-red-600 hover:text-red-700 border-red-600'
                                : 'text-green-600 hover:text-green-700 border-green-600'
                            }`}
                          >
                            {judge.isActive ? (
                              <EyeOff className="w-4 h-4 ml-1" />
                            ) : (
                              <Eye className="w-4 h-4 ml-1" />
                            )}
                            {judge.isActive ? 'إلغاء تفعيل' : 'تفعيل'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteJudge(judge.id)}
                            className="text-red-600 hover:text-red-700 border-red-600"
                          >
                            <Trash2 className="w-4 h-4 ml-1" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
