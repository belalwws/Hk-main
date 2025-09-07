"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, BarChart3, Users, Trophy, Calendar, TrendingUp, Download, FileText, PieChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface ReportStats {
  totalUsers: number
  totalHackathons: number
  totalParticipants: number
  activeHackathons: number
  pendingParticipants: number
  approvedParticipants: number
  rejectedParticipants: number
  usersByCity: { city: string; count: number }[]
  usersByNationality: { nationality: string; count: number }[]
  hackathonsByStatus: { status: string; count: number }[]
  participantsByMonth: { month: string; count: number }[]
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/admin/reports')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/reports/export?type=${type}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#01645e] font-semibold">جاري تحميل التقارير...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm" className="border-[#01645e] text-[#01645e] hover:bg-[#01645e] hover:text-white">
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  العودة للداشبورد
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-[#01645e]">التقارير والإحصائيات</h1>
                <p className="text-[#8b7632] mt-1">تقارير شاملة عن أداء المنصة</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => exportReport('users')} variant="outline" className="border-[#3ab666] text-[#3ab666] hover:bg-[#3ab666] hover:text-white">
                <Download className="w-4 h-4 ml-2" />
                تصدير المستخدمين
              </Button>
              <Button onClick={() => exportReport('participants')} variant="outline" className="border-[#3ab666] text-[#3ab666] hover:bg-[#3ab666] hover:text-white">
                <Download className="w-4 h-4 ml-2" />
                تصدير المشاركين
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">إجمالي المستخدمين</p>
                  <p className="text-3xl font-bold text-[#01645e]">{stats?.totalUsers || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
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

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">إجمالي المشاركات</p>
                  <p className="text-3xl font-bold text-[#01645e]">{stats?.totalParticipants || 0}</p>
                </div>
                <Users className="w-8 h-8 text-[#3ab666]" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
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
        </motion.div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Participants Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[#01645e] flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  حالة المشاركين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">في الانتظار</span>
                    <Badge className="bg-yellow-100 text-yellow-800">{stats?.pendingParticipants || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">مقبول</span>
                    <Badge className="bg-green-100 text-green-800">{stats?.approvedParticipants || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">مرفوض</span>
                    <Badge className="bg-red-100 text-red-800">{stats?.rejectedParticipants || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Users by City */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[#01645e] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  المستخدمين حسب المدينة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.usersByCity?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="font-medium">{item.city || 'غير محدد'}</span>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  )) || <p className="text-gray-500">لا توجد بيانات</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Users by Nationality */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[#01645e] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  المستخدمين حسب الجنسية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.usersByNationality?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="font-medium">{item.nationality || 'غير محدد'}</span>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  )) || <p className="text-gray-500">لا توجد بيانات</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Hackathons by Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[#01645e] flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  الهاكاثونات حسب الحالة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.hackathonsByStatus?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="font-medium">
                        {item.status === 'DRAFT' ? 'مسودة' :
                         item.status === 'OPEN' ? 'مفتوح' :
                         item.status === 'CLOSED' ? 'مغلق' : 'منتهي'}
                      </span>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  )) || <p className="text-gray-500">لا توجد بيانات</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
