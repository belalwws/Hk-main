"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Mail, 
  Settings, 
  Send, 
  Users, 
  MessageSquare,
  Bell,
  Edit,
  Eye,
  Plus,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface AutoMessage {
  id: string
  type: string
  name: string
  subject: string
  isActive: boolean
  lastSent?: string
  totalSent: number
}

interface CustomMessage {
  id: string
  subject: string
  targetAudience: string
  status: 'draft' | 'sent' | 'scheduled'
  sentAt?: string
  recipientCount: number
}

export default function MessagesManagementPage() {
  const [autoMessages, setAutoMessages] = useState<AutoMessage[]>([])
  const [customMessages, setCustomMessages] = useState<CustomMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAutoMessages: 0,
    activeAutoMessages: 0,
    totalCustomMessages: 0,
    totalEmailsSent: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch automatic messages
      const autoResponse = await fetch('/api/admin/messages/automatic')
      if (autoResponse.ok) {
        const autoData = await autoResponse.json()
        setAutoMessages(autoData.messages)
      }

      // Fetch custom messages
      const customResponse = await fetch('/api/admin/messages/custom')
      if (customResponse.ok) {
        const customData = await customResponse.json()
        setCustomMessages(customData.messages)
      }

      // Fetch stats
      const statsResponse = await fetch('/api/admin/messages/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching messages data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAutoMessage = async (messageId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/messages/automatic/${messageId}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        fetchData() // Refresh data
        alert(`تم ${!isActive ? 'تفعيل' : 'إلغاء'} الرسالة التلقائية`)
      }
    } catch (error) {
      console.error('Error toggling auto message:', error)
      alert('حدث خطأ في تحديث الرسالة')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-[#01645e]" />
            إدارة الرسائل
          </h1>
          <p className="text-gray-600">
            إدارة الرسائل التلقائية والمخصصة للمنصة
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الرسائل التلقائية</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAutoMessages}</p>
                </div>
                <Bell className="w-8 h-8 text-[#01645e]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">المفعلة</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeAutoMessages}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الرسائل المخصصة</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCustomMessages}</p>
                </div>
                <Send className="w-8 h-8 text-[#3ab666]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المرسل</p>
                  <p className="text-2xl font-bold text-[#01645e]">{stats.totalEmailsSent}</p>
                </div>
                <Mail className="w-8 h-8 text-[#01645e]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="automatic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="automatic" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              الرسائل التلقائية
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              الرسائل المخصصة
            </TabsTrigger>
          </TabsList>

          {/* Automatic Messages Tab */}
          <TabsContent value="automatic">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>الرسائل التلقائية</CardTitle>
                    <CardDescription>
                      إدارة الرسائل التي ترسل تلقائياً عند أحداث معينة
                    </CardDescription>
                  </div>
                  <Link href="/admin/messages/automatic/settings">
                    <Button className="bg-[#01645e] hover:bg-[#01645e]/90">
                      <Settings className="w-4 h-4 mr-2" />
                      إعدادات عامة
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {autoMessages.map((message) => (
                    <div
                      key={message.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${message.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <div>
                          <h3 className="font-medium text-gray-900">{message.name}</h3>
                          <p className="text-sm text-gray-500">{message.subject}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                            <span>تم الإرسال: {message.totalSent} مرة</span>
                            {message.lastSent && (
                              <span>آخر إرسال: {new Date(message.lastSent).toLocaleDateString('ar-SA')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/messages/automatic/${message.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            تعديل
                          </Button>
                        </Link>
                        <Link href={`/admin/messages/automatic/${message.id}/preview`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            معاينة
                          </Button>
                        </Link>
                        <Button
                          variant={message.isActive ? "destructive" : "default"}
                          size="sm"
                          onClick={() => toggleAutoMessage(message.id, message.isActive)}
                        >
                          {message.isActive ? 'إلغاء' : 'تفعيل'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Messages Tab */}
          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>الرسائل المخصصة</CardTitle>
                    <CardDescription>
                      إنشاء وإرسال رسائل مخصصة لمجموعات محددة
                    </CardDescription>
                  </div>
                  <Link href="/admin/messages/custom/create">
                    <Button className="bg-[#3ab666] hover:bg-[#3ab666]/90">
                      <Plus className="w-4 h-4 mr-2" />
                      رسالة جديدة
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customMessages.map((message) => (
                    <div
                      key={message.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {message.status === 'sent' && <CheckCircle className="w-5 h-5 text-green-500" />}
                          {message.status === 'scheduled' && <Clock className="w-5 h-5 text-yellow-500" />}
                          {message.status === 'draft' && <Edit className="w-5 h-5 text-gray-400" />}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{message.subject}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              {message.targetAudience}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {message.recipientCount} مستلم
                            </span>
                            {message.sentAt && (
                              <span>تم الإرسال: {new Date(message.sentAt).toLocaleDateString('ar-SA')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/messages/custom/${message.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            تعديل
                          </Button>
                        </Link>
                        <Link href={`/admin/messages/custom/${message.id}/preview`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            معاينة
                          </Button>
                        </Link>
                        {message.status === 'draft' && (
                          <Link href={`/admin/messages/custom/${message.id}/send`}>
                            <Button size="sm" className="bg-[#3ab666] hover:bg-[#3ab666]/90">
                              <Send className="w-4 h-4 mr-1" />
                              إرسال
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
