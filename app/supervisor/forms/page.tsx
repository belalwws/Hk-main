"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Eye, Users, BarChart3, ExternalLink, MessageSquare, Award, UserCheck, Palette, Settings, Download, Mail, Copy, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

interface Hackathon {
  id: string
  title: string
  description: string
  status: string
}

export default function SupervisorFormsManagement() {
  const [loading, setLoading] = useState(true)
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [selectedHackathon, setSelectedHackathon] = useState<string>('')

  useEffect(() => {
    fetchHackathons()
  }, [])

  const fetchHackathons = async () => {
    try {
      const response = await fetch('/api/supervisor/hackathons')
      if (response.ok) {
        const data = await response.json()
        const hackathonsArray = Array.isArray(data.hackathons) ? data.hackathons : []
        setHackathons(hackathonsArray)
        if (hackathonsArray.length > 0) {
          setSelectedHackathon(hackathonsArray[0].id)
        }
      } else {
        setHackathons([])
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error)
      setHackathons([])
    } finally {
      setLoading(false)
    }
  }

  const copyLink = async (url: string, label: string) => {
    try {
      await navigator.clipboard.writeText(url)
      alert(`تم نسخ رابط ${label} بنجاح!`)
    } catch (error) {
      console.error('Error copying link:', error)
      alert('حدث خطأ في نسخ الرابط')
    }
  }

  const downloadSubmissions = async (formType: string, formTitle: string) => {
    try {
      const response = await fetch(`/api/supervisor/forms/export?hackathonId=${selectedHackathon}&formType=${formType}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${formTitle}_${new Date().toLocaleDateString('ar-EG')}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('حدث خطأ في تحميل الملف')
      }
    } catch (error) {
      console.error('Error downloading submissions:', error)
      alert('حدث خطأ في تحميل الملف')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 font-semibold">جاري تحميل الفورمات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8" />
          إدارة الفورمات
        </h1>
        <p className="text-gray-600">
          متابعة جميع فورمات الهاكاثون والردود المرسلة
        </p>
      </div>

      {/* Hackathon Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اختر الهاكاثون
              </label>
              <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر هاكاثون" />
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
            {selectedHackathon && (
              <div className="text-sm text-gray-600">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {hackathons.find(h => h.id === selectedHackathon)?.status}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Forms Grid */}
      {selectedHackathon && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
            <Tabs defaultValue="judges" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="judges">
                  <Award className="w-4 h-4 ml-2" />
                  فورم المحكمين
                </TabsTrigger>
                <TabsTrigger value="experts">
                  <Users className="w-4 h-4 ml-2" />
                  فورم الخبراء
                </TabsTrigger>
                <TabsTrigger value="supervision">
                  <UserCheck className="w-4 h-4 ml-2" />
                  فورم الإشراف
                </TabsTrigger>
                <TabsTrigger value="feedback">
                  <MessageSquare className="w-4 h-4 ml-2" />
                  فورم التقييم
                </TabsTrigger>
                <TabsTrigger value="registration">
                  <Users className="w-4 h-4 ml-2" />
                  فورم التسجيل
                </TabsTrigger>
              </TabsList>
            
            {/* Judge Forms Tab */}
            <TabsContent value="judges">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Judge Application Form */}
                <Card className="hover:shadow-xl transition-shadow border-2 border-orange-200">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                    <div className="flex items-center justify-between">
                      <Award className="w-8 h-8 text-orange-600" />
                      <Badge className="bg-orange-600 text-white">محكمين</Badge>
                    </div>
                    <CardTitle className="text-xl text-orange-900 mt-4">
                      فورم طلب الانضمام كمحكم
                    </CardTitle>
                    <CardDescription>
                      فورم ديناميكي لاستقبال طلبات المحكمين - أضف الحقول التي تريدها
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col gap-2">
                      <Link href={`/supervisor/judge-form-builder/${selectedHackathon}`}>
                        <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                          <Settings className="w-4 h-4 ml-2" />
                          بناء الفورم
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                        onClick={() => window.open(`/judge/apply/${selectedHackathon}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 ml-2" />
                        معاينة الفورم
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => copyLink(`${window.location.origin}/judge/apply/${selectedHackathon}`, 'فورم المحكمين')}
                      >
                        <Copy className="w-4 h-4 ml-2" />
                        نسخ الرابط
                      </Button>

                      <Link href="/admin/judge-applications">
                        <Button variant="outline" className="w-full border-orange-300">
                          <Users className="w-4 h-4 ml-2" />
                          إدارة الطلبات
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Judge Invitation Form */}
                <Card className="hover:shadow-xl transition-shadow border-2 border-blue-200">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                      <Mail className="w-8 h-8 text-blue-600" />
                      <Badge className="bg-blue-600 text-white">دعوات</Badge>
                    </div>
                    <CardTitle className="text-xl text-blue-900 mt-4">
                      نظام دعوات المحكمين
                    </CardTitle>
                    <CardDescription>
                      إرسال دعوات مخصصة للمحكمين عبر البريد الإلكتروني
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col gap-2">
                      <Link href="/admin/judge-applications">
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                          <Mail className="w-4 h-4 ml-2" />
                          إدارة الدعوات
                        </Button>
                      </Link>

                      <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                        <p className="font-medium mb-1">📧 نظام الدعوات</p>
                        <p className="text-xs">يمكنك إرسال دعوات مخصصة للمحكمين مع روابط تسجيل فريدة</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Expert Forms Tab */}
            <TabsContent value="experts">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Expert Application Form */}
                <Card className="hover:shadow-xl transition-shadow border-2 border-cyan-200">
                  <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
                    <div className="flex items-center justify-between">
                      <Users className="w-8 h-8 text-cyan-600" />
                      <Badge className="bg-cyan-600 text-white">خبراء</Badge>
                    </div>
                    <CardTitle className="text-xl text-cyan-900 mt-4">
                      فورم طلب الانضمام كخبير
                    </CardTitle>
                    <CardDescription>
                      فورم ديناميكي لاستقبال طلبات الخبراء - أضف الحقول والصور التي تريدها
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col gap-2">
                      <Link href={`/supervisor/expert-form-builder/${selectedHackathon}`}>
                        <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                          <Settings className="w-4 h-4 ml-2" />
                          بناء الفورم
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        className="w-full border-cyan-500 text-cyan-600 hover:bg-cyan-50"
                        onClick={() => window.open(`/expert/apply/${selectedHackathon}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 ml-2" />
                        معاينة الفورم
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => copyLink(`${window.location.origin}/expert/apply/${selectedHackathon}`, 'فورم الخبراء')}
                      >
                        <Copy className="w-4 h-4 ml-2" />
                        نسخ الرابط
                      </Button>

                      <Link href="/supervisor/expert-applications">
                        <Button variant="outline" className="w-full border-cyan-300">
                          <Users className="w-4 h-4 ml-2" />
                          إدارة الطلبات
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="bg-cyan-50 p-3 rounded-lg text-sm text-cyan-800 mt-4">
                      <p className="font-medium mb-1">✨ مميزات الفورم</p>
                      <ul className="text-xs space-y-1">
                        <li>• رفع صورة الخبير على Cloudinary</li>
                        <li>• حقول ديناميكية قابلة للتخصيص</li>
                        <li>• دعم المرفقات والملفات</li>
                        <li>• معلومات احترافية للخبير</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Expert Invitation Form */}
                <Card className="hover:shadow-xl transition-shadow border-2 border-teal-200">
                  <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
                    <div className="flex items-center justify-between">
                      <Mail className="w-8 h-8 text-teal-600" />
                      <Badge className="bg-teal-600 text-white">دعوات</Badge>
                    </div>
                    <CardTitle className="text-xl text-teal-900 mt-4">
                      نظام دعوات الخبراء
                    </CardTitle>
                    <CardDescription>
                      إرسال دعوات مخصصة للخبراء عبر البريد الإلكتروني
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col gap-2">
                      <Link href="/supervisor/expert-applications">
                        <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                          <Mail className="w-4 h-4 ml-2" />
                          إدارة الدعوات
                        </Button>
                      </Link>

                      <div className="bg-teal-50 p-3 rounded-lg text-sm text-teal-800">
                        <p className="font-medium mb-1">📧 نظام الدعوات</p>
                        <p className="text-xs">يمكنك إرسال دعوات مخصصة للخبراء مع روابط تسجيل فريدة</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Supervision Forms Tab */}
            <TabsContent value="supervision">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow border-2 border-purple-200">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center justify-between">
                      <UserCheck className="w-8 h-8 text-purple-600" />
                      <Badge className="bg-purple-600 text-white">إشراف</Badge>
                    </div>
                    <CardTitle className="text-xl text-purple-900 mt-4">
                      فورم طلب الانضمام للإشراف
                    </CardTitle>
                    <CardDescription>
                      متابعة طلبات الإشراف وتحميل البيانات
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        className="w-full border-purple-500 text-purple-600 hover:bg-purple-50"
                        onClick={() => window.open(`/supervision/${selectedHackathon}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 ml-2" />
                        معاينة الفورم
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => copyLink(`${window.location.origin}/supervision/${selectedHackathon}`, 'فورم الإشراف')}
                      >
                        <Copy className="w-4 h-4 ml-2" />
                        نسخ الرابط
                      </Button>

                      <Link href={`/supervisor/supervision-submissions/${selectedHackathon}`}>
                        <Button variant="outline" className="w-full border-purple-300">
                          <Users className="w-4 h-4 ml-2" />
                          متابعة الردود
                        </Button>
                      </Link>

                      <Button
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        onClick={() => downloadSubmissions('supervision', 'طلبات_الإشراف')}
                      >
                        <Download className="w-4 h-4 ml-2" />
                        تحميل Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Feedback Forms Tab */}
            <TabsContent value="feedback">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow border-2 border-green-200">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                    <div className="flex items-center justify-between">
                      <MessageSquare className="w-8 h-8 text-green-600" />
                      <Badge className="bg-green-600 text-white">تقييم</Badge>
                    </div>
                    <CardTitle className="text-xl text-green-900 mt-4">
                      فورم تقييم الهاكاثون
                    </CardTitle>
                    <CardDescription>
                      متابعة تقييمات المشاركين وتحليل النتائج
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        className="w-full border-green-500 text-green-600 hover:bg-green-50"
                        onClick={() => window.open(`/feedback/${selectedHackathon}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 ml-2" />
                        معاينة الفورم
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => copyLink(`${window.location.origin}/feedback/${selectedHackathon}`, 'فورم التقييم')}
                      >
                        <Copy className="w-4 h-4 ml-2" />
                        نسخ الرابط
                      </Button>

                      <Link href={`/supervisor/hackathons/${selectedHackathon}/feedback-results`}>
                        <Button variant="outline" className="w-full border-green-300">
                          <BarChart3 className="w-4 h-4 ml-2" />
                          عرض النتائج
                        </Button>
                      </Link>

                      <Button
                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                        onClick={() => downloadSubmissions('feedback', 'تقييمات_الهاكاثون')}
                      >
                        <Download className="w-4 h-4 ml-2" />
                        تحميل Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Registration Forms Tab */}
            <TabsContent value="registration">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow border-2 border-blue-200">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                      <Users className="w-8 h-8 text-blue-600" />
                      <Badge className="bg-blue-600 text-white">تسجيل</Badge>
                    </div>
                    <CardTitle className="text-xl text-blue-900 mt-4">
                      فورم تسجيل المشاركين
                    </CardTitle>
                    <CardDescription>
                      متابعة تسجيلات المشاركين وتحميل البيانات
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(`/hackathons/${selectedHackathon}/register-form`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 ml-2" />
                        معاينة الفورم
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => copyLink(`${window.location.origin}/hackathons/${selectedHackathon}/register-form`, 'فورم التسجيل')}
                      >
                        <Copy className="w-4 h-4 ml-2" />
                        نسخ الرابط
                      </Button>

                      <Link href={`/supervisor/hackathons/${selectedHackathon}/form-submissions`}>
                        <Button variant="outline" className="w-full border-blue-300">
                          <FileText className="w-4 h-4 ml-2" />
                          متابعة الردود
                        </Button>
                      </Link>

                      <Button
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                        onClick={() => downloadSubmissions('registration', 'تسجيلات_المشاركين')}
                      >
                        <Download className="w-4 h-4 ml-2" />
                        تحميل Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}

      {/* Empty State */}
      {!selectedHackathon && hackathons.length === 0 && (
        <Card className="text-center p-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            لا توجد هاكاثونات مخصصة لك
          </h3>
          <p className="text-gray-500">
            لم يتم تخصيص أي هاكاثون لك بعد
          </p>
        </Card>
      )}
    </div>
  )
}
