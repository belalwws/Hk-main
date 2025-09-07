'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, Eye, Edit, Trash2, UserCheck, UserX, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

interface Judge {
  id: string
  userId: string
  hackathonId: string
  isActive: boolean
  assignedAt: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
    role: string
  }
  hackathon: {
    id: string
    title: string
  }
}

interface Hackathon {
  id: string
  title: string
  status: string
}

export default function AdminJudgesPage() {
  const [judges, setJudges] = useState<Judge[]>([])
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    hackathonId: ''
  })

  useEffect(() => {
    fetchJudges()
    fetchHackathons()
  }, [])

  const fetchJudges = async () => {
    try {
      const response = await fetch('/api/admin/judges')
      if (response.ok) {
        const data = await response.json()
        setJudges(data.judges || [])
      }
    } catch (error) {
      console.error('Error fetching judges:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHackathons = async () => {
    try {
      const response = await fetch('/api/admin/hackathons')
      if (response.ok) {
        const data = await response.json()
        setHackathons(data.hackathons || [])
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error)
    }
  }

  const createJudge = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.hackathonId) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      const response = await fetch('/api/admin/judges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        alert('تم إنشاء المحكم بنجاح!')
        setShowCreateDialog(false)
        setFormData({ name: '', email: '', phone: '', password: '', hackathonId: '' })
        fetchJudges()
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في إنشاء المحكم')
      }
    } catch (error) {
      console.error('Error creating judge:', error)
      alert('حدث خطأ في إنشاء المحكم')
    }
  }

  const toggleJudgeStatus = async (judgeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/judges/${judgeId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        fetchJudges()
        alert(`تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} المحكم بنجاح`)
      } else {
        alert('فشل في تحديث حالة المحكم')
      }
    } catch (error) {
      console.error('Error toggling judge status:', error)
      alert('حدث خطأ في تحديث حالة المحكم')
    }
  }

  const deleteJudge = async (judgeId: string, judgeName: string) => {
    if (!confirm(`هل أنت متأكد من حذف المحكم "${judgeName}"؟`)) return

    try {
      const response = await fetch(`/api/admin/judges/${judgeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchJudges()
        alert('تم حذف المحكم بنجاح')
      } else {
        alert('فشل في حذف المحكم')
      }
    } catch (error) {
      console.error('Error deleting judge:', error)
      alert('حدث خطأ في حذف المحكم')
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge className={`${isActive ? 'bg-green-500' : 'bg-red-500'} text-white`}>
        {isActive ? 'نشط' : 'معطل'}
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
              <p className="text-[#01645e] font-semibold">جاري تحميل المحكمين...</p>
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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-[#01645e] mb-2">إدارة المحكمين</h1>
            <p className="text-[#8b7632] text-lg">إنشاء وإدارة المحكمين وربطهم بالهاكاثونات</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#01645e] to-[#3ab666]">
                <Plus className="w-5 h-5 ml-2" />
                إضافة محكم جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>إضافة محكم جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات المحكم الجديد وحدد الهاكاثون المراد ربطه به
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">الاسم *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="col-span-3"
                    placeholder="اسم المحكم"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">الإيميل *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="col-span-3"
                    placeholder="judge@example.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">الهاتف</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="col-span-3"
                    placeholder="رقم الهاتف"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">كلمة المرور *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="col-span-3"
                    placeholder="كلمة مرور قوية"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="hackathon" className="text-right">الهاكاثون *</Label>
                  <Select value={formData.hackathonId} onValueChange={(value) => setFormData({...formData, hackathonId: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر الهاكاثون" />
                    </SelectTrigger>
                    <SelectContent>
                      {hackathons.map((hackathon) => (
                        <SelectItem key={hackathon.id} value={hackathon.id}>
                          {hackathon.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={createJudge}>إنشاء المحكم</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">إجمالي المحكمين</p>
                  <p className="text-3xl font-bold text-[#01645e]">{judges.length}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-[#01645e] to-[#3ab666]">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">المحكمين النشطين</p>
                  <p className="text-3xl font-bold text-green-600">{judges.filter(j => j.isActive).length}</p>
                </div>
                <div className="p-3 rounded-full bg-green-500">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">المحكمين المعطلين</p>
                  <p className="text-3xl font-bold text-red-600">{judges.filter(j => !j.isActive).length}</p>
                </div>
                <div className="p-3 rounded-full bg-red-500">
                  <UserX className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Judges List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-[#01645e]">قائمة المحكمين</CardTitle>
              <CardDescription>جميع المحكمين المسجلين في النظام</CardDescription>
            </CardHeader>
            <CardContent>
              {judges.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-[#01645e] mb-2">لا يوجد محكمين</h3>
                  <p className="text-[#8b7632] mb-6">ابدأ بإضافة أول محكم</p>
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-gradient-to-r from-[#01645e] to-[#3ab666]"
                  >
                    <Plus className="w-5 h-5 ml-2" />
                    إضافة محكم جديد
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {judges.map((judge) => (
                    <motion.div
                      key={judge.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-[#01645e]">{judge.user.name}</h3>
                            {getStatusBadge(judge.isActive)}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-semibold text-[#01645e]">الإيميل:</span>
                              <br />
                              {judge.user.email}
                            </div>
                            <div>
                              <span className="font-semibold text-[#01645e]">الهاتف:</span>
                              <br />
                              {judge.user.phone || 'غير محدد'}
                            </div>
                            <div>
                              <span className="font-semibold text-[#01645e]">الهاكاثون:</span>
                              <br />
                              {judge.hackathon.title}
                            </div>
                            <div>
                              <span className="font-semibold text-[#01645e]">تاريخ التعيين:</span>
                              <br />
                              {new Date(judge.assignedAt).toLocaleDateString('ar-SA')}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mr-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${judge.isActive 
                              ? 'text-red-600 hover:text-red-700 border-red-600 hover:border-red-700'
                              : 'text-green-600 hover:text-green-700 border-green-600 hover:border-green-700'
                            }`}
                            onClick={() => toggleJudgeStatus(judge.id, judge.isActive)}
                          >
                            {judge.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700"
                            onClick={() => deleteJudge(judge.id, judge.user.name)}
                          >
                            <Trash2 className="w-4 h-4" />
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
