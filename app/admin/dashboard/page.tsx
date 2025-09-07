"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users, Calendar, Settings, Plus, BarChart3, Mail, Star, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'

interface DashboardStats {
  totalHackathons: number
  activeHackathons: number
  totalParticipants: number
  pendingParticipants: number
  approvedParticipants: number
  rejectedParticipants: number
  totalUsers: number
  recentHackathons: Array<{
    id: string
    title: string
    status: string
    participantCount: number
    startDate: string
  }>
  recentParticipants: Array<{
    id: string
    name: string
    email: string
    status: string
    registeredAt: string
    preferredRole: string
  }>
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalHackathons: 0,
    activeHackathons: 0,
    totalParticipants: 0,
    pendingParticipants: 0,
    approvedParticipants: 0,
    rejectedParticipants: 0,
    totalUsers: 0,
    recentHackathons: [],
    recentParticipants: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Middleware protects this route. Avoid client redirect loops.
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendWelcomeEmails = async () => {
    try {
      const response = await fetch('/api/admin/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'welcome' })
      })
      
      if (response.ok) {
        alert('تم إرسال رسائل الترحيب بنجاح!')
      } else {
        alert('حدث خطأ في إرسال الرسائل')
      }
    } catch (error) {
      console.error('Error sending emails:', error)
      alert('حدث خطأ في إرسال الرسائل')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#01645e] mx-auto mb-4"></div>
          <p className="text-[#01645e] text-lg">جاري تحميل لوحة التحكم...</p>
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
            <h1 className="text-4xl font-bold text-[#01645e] mb-2">لوحة تحكم الإدارة</h1>
            <p className="text-[#8b7632] text-lg">مرحباً {user?.name}، إدارة شاملة لمنصة الهاكاثونات</p>
          </div>
          
          <div className="flex space-x-4 rtl:space-x-reverse">
            <Link href="/admin/hackathons/create">
              <Button className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52]">
                <Plus className="w-5 h-5 ml-2" />
                إنشاء هاكاثون جديد
              </Button>
            </Link>
            <Link href="/admin/hackathons">
              <Button variant="outline">
                <Trophy className="w-5 h-5 ml-2" />
                إدارة الهاكاثونات
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline">
                <Users className="w-5 h-5 ml-2" />
                إدارة المستخدمين
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline">
                <BarChart3 className="w-5 h-5 ml-2" />
                التقارير والإحصائيات
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">إجمالي الهاكاثونات</p>
                  <p className="text-3xl font-bold text-[#01645e]">{stats?.totalHackathons || 0}</p>
                </div>
                <Trophy className="w-8 h-8 text-[#01645e]" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">الهاكاثونات النشطة</p>
                  <p className="text-3xl font-bold text-[#01645e]">{stats?.activeHackathons || 0}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">إجمالي المشاركين</p>
                  <p className="text-3xl font-bold text-[#01645e]">{stats?.totalParticipants || 0}</p>
                </div>
                <Users className="w-8 h-8 text-[#3ab666]" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">المستخدمين المسجلين</p>
                  <p className="text-3xl font-bold text-[#01645e]">{stats?.totalUsers || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">في الانتظار</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats?.pendingParticipants || 0}</p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">مقبول</p>
                  <p className="text-3xl font-bold text-green-600">{stats?.approvedParticipants || 0}</p>
                </div>
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">مرفوض</p>
                  <p className="text-3xl font-bold text-red-600">{stats?.rejectedParticipants || 0}</p>
                </div>
                <Users className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <Link href="/admin/participants-temp">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-[#01645e] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-[#01645e] mb-2">إدارة المشاركين</h3>
                <p className="text-[#8b7632] text-sm">مراجعة وإدارة طلبات المشاركة</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/results">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-[#3ab666] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-[#01645e] mb-2">النتائج والتقييم</h3>
                <p className="text-[#8b7632] text-sm">عرض نتائج التقييم والترتيب</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/emails">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Mail className="w-12 h-12 text-[#c3e956] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-[#01645e] mb-2">إدارة الرسائل</h3>
                <p className="text-[#8b7632] text-sm">إرسال رسائل للمشاركين</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/reports">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-12 h-12 text-[#8b7632] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-[#01645e] mb-2">التقارير والإحصائيات</h3>
                <p className="text-[#8b7632] text-sm">تقارير مفصلة وإحصائيات</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/evaluation">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 text-[#c3e956] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-[#01645e] mb-2">نظام التقييم</h3>
                <p className="text-[#8b7632] text-sm">إدارة معايير التقييم والنتائج</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/results-management">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-[#01645e] mb-2">إدارة النتائج</h3>
                <p className="text-[#8b7632] text-sm">عرض وإدارة النتائج النهائية</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/send-certificates">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Mail className="w-12 h-12 text-[#c3e956] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-[#01645e] mb-2">إرسال الشهادات</h3>
                <p className="text-[#8b7632] text-sm">معاينة وإرسال شهادات التقدير</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/certificate-settings">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Settings className="w-12 h-12 text-[#01645e] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-[#01645e] mb-2">إعدادات الشهادة</h3>
                <p className="text-[#8b7632] text-sm">تخصيص موضع النصوص على الشهادة</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Recent Participants */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl text-[#01645e]">المشاركين الجدد</CardTitle>
                  <CardDescription>آخر المشاركين المسجلين</CardDescription>
                </div>
                <Link href="/admin/participants-temp">
                  <Button variant="outline">
                    عرض الكل
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentParticipants?.map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#01645e]">{participant.name}</h4>
                        <p className="text-sm text-[#8b7632]">
                          {participant.email} • {participant.preferredRole}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <Badge variant={participant.status === 'PENDING' ? "secondary" : participant.status === 'APPROVED' ? "default" : "destructive"}>
                        {participant.status === 'PENDING' ? 'في الانتظار' : participant.status === 'APPROVED' ? 'مقبول' : 'مرفوض'}
                      </Badge>
                      <p className="text-sm text-[#8b7632]">
                        {new Date(participant.registeredAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </motion.div>
                )) || (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
                    <p className="text-[#8b7632]">لا توجد مشاركين مسجلين حتى الآن</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
