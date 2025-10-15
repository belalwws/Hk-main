"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, FileText, Eye, Edit, Trash2, Users, Calendar, BarChart3, Share2, Mail, Copy, Send, Award, UserCheck, Palette, ExternalLink, Settings, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Hackathon {
  id: string
  title: string
  description: string
  status: string
}

export default function FormsManagement() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [selectedHackathon, setSelectedHackathon] = useState<string>('')

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }
    fetchHackathons()
  }, [user, router])

  const fetchHackathons = async () => {
    try {
      const response = await fetch('/api/hackathons?all=true')
      if (response.ok) {
        const data = await response.json()
        // API returns { hackathons: [...] }
        const hackathonsArray = Array.isArray(data.hackathons) ? data.hackathons : (Array.isArray(data) ? data : [])
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#01645e] mx-auto mb-4"></div>
          <p className="text-[#01645e] font-semibold">جاري تحميل الفورمات...</p>
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
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[#01645e] mb-2 flex items-center gap-3">
                <FileText className="w-10 h-10" />
                إدارة الفورمات
              </h1>
              <p className="text-[#8b7632] text-lg">
                إدارة جميع فورمات الهاكاثون من مكان واحد
              </p>
            </div>
          </div>

          {/* Hackathon Selector */}
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#01645e] mb-2">
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
                    <Badge variant="outline" className="bg-[#c3e956]/20 text-[#8b7632] border-[#c3e956]">
                      {hackathons.find(h => h.id === selectedHackathon)?.status}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Forms Grid */}
        {selectedHackathon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="judges" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="judges">
                  <Award className="w-4 h-4 ml-2" />
                  فورم المحكمين
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
                        <Link href={`/admin/judge-form-builder/${selectedHackathon}`}>
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

                        <Link href="/admin/judges">
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
                        <Link href="/admin/judges">
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

              {/* Supervision Forms Tab */}
              <TabsContent value="supervision">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Supervision Application Form */}
                  <Card className="hover:shadow-xl transition-shadow border-2 border-purple-200">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="flex items-center justify-between">
                        <UserCheck className="w-8 h-8 text-purple-600" />
                        <Badge className="bg-purple-600 text-white">إشراف</Badge>
                      </div>
                      <CardTitle className="text-xl text-purple-900 mt-4">
                        فورم طلب الانضمام للإشراف
                      </CardTitle>
                      <CardDescription>
                        فورم ديناميكي لاستقبال طلبات الإشراف - أضف الحقول والصور التي تريدها
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex flex-col gap-2">
                        <Link href={`/admin/supervision-form-builder/${selectedHackathon}`}>
                          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                            <Settings className="w-4 h-4 ml-2" />
                            بناء الفورم
                          </Button>
                        </Link>
                        
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

                        <Link href={`/admin/supervision-submissions/${selectedHackathon}`}>
                          <Button variant="outline" className="w-full border-purple-300">
                            <Users className="w-4 h-4 ml-2" />
                            إدارة الطلبات
                          </Button>
                        </Link>
                      </div>
                      
                      <div className="bg-purple-50 p-3 rounded-lg text-sm text-purple-800 mt-4">
                        <p className="font-medium mb-1">✨ مميزات الفورم</p>
                        <ul className="text-xs space-y-1">
                          <li>• رفع صور الغلاف على Cloudinary</li>
                          <li>• حقول ديناميكية قابلة للتخصيص</li>
                          <li>• دعم المرفقات والملفات</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>



              {/* Feedback Forms Tab */}
              <TabsContent value="feedback">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Hackathon Feedback Form */}
                  <Card className="hover:shadow-xl transition-shadow border-2 border-green-200">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                      <div className="flex items-center justify-between">
                        <MessageSquare className="w-8 h-8 text-green-600" />
                        <Badge className="bg-green-600 text-white">تقييم</Badge>
                      </div>
                      <CardTitle className="text-xl text-green-900 mt-4">
                        فورم تقييم الهاكاثون
                      </CardTitle>
                      <CardDescription>
                        فورم ديناميكي لجمع آراء وتقييمات المشاركين - أضف الحقول التي تريدها
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex flex-col gap-2">
                        <Link href={`/admin/feedback-form-builder/${selectedHackathon}`}>
                          <Button className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                            <Settings className="w-4 h-4 ml-2" />
                            بناء الفورم
                          </Button>
                        </Link>

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

                        <Link href={`/admin/hackathons/${selectedHackathon}/feedback-results`}>
                          <Button variant="outline" className="w-full border-green-300">
                            <BarChart3 className="w-4 h-4 ml-2" />
                            عرض النتائج
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Registration Forms Tab */}
              <TabsContent value="registration">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Registration Form */}
                  <Card className="hover:shadow-xl transition-shadow border-2 border-[#01645e]/30">
                    <CardHeader className="bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10">
                      <div className="flex items-center justify-between">
                        <Users className="w-8 h-8 text-[#01645e]" />
                        <Badge className="bg-[#01645e] text-white">تسجيل</Badge>
                      </div>
                      <CardTitle className="text-xl text-[#01645e] mt-4">
                        فورم تسجيل المشاركين
                      </CardTitle>
                      <CardDescription>
                        فورم التسجيل الديناميكي للمشاركين في الهاكاثون
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex flex-col gap-2">
                        <Link href={`/admin/hackathons/${selectedHackathon}/registration-form`}>
                          <Button className="w-full bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#01645e]/90 hover:to-[#3ab666]/90">
                            <Settings className="w-4 h-4 ml-2" />
                            إعداد الفورم
                          </Button>
                        </Link>

                        <Link href={`/admin/hackathons/${selectedHackathon}/register-form-design`}>
                          <Button variant="outline" className="w-full border-[#01645e] text-[#01645e]">
                            <Palette className="w-4 h-4 ml-2" />
                            تصميم الفورم
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(`/hackathons/${selectedHackathon}/register-form?preview=1`, '_blank')}
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

                        <Link href={`/admin/hackathons/${selectedHackathon}/form-submissions`}>
                          <Button variant="outline" className="w-full border-[#3ab666] text-[#3ab666]">
                            <FileText className="w-4 h-4 ml-2" />
                            النماذج المرسلة
                          </Button>
                        </Link>
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
              لا توجد هاكاثونات
            </h3>
            <p className="text-gray-500 mb-6">
              قم بإنشاء هاكاثون أولاً لإدارة الفورمات
            </p>
            <Link href="/admin/hackathons">
              <Button className="bg-gradient-to-r from-[#01645e] to-[#3ab666]">
                <Plus className="w-4 h-4 ml-2" />
                إنشاء هاكاثون
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}

