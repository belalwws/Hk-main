'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, Download, Eye, Users, Calendar, CheckCircle2, XCircle, UserCheck, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface SupervisorApplication {
  id: string
  userId: string
  hackathonId: string
  status: 'pending' | 'approved' | 'rejected'
  experience: string
  motivation: string
  availability: string
  createdAt: string
  user: {
    name: string
    email: string
    phone: string
    city: string
  }
}

interface Hackathon {
  id: string
  title: string
  description: string
}

export default function SupervisionSubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [applications, setApplications] = useState<SupervisorApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedApp, setSelectedApp] = useState<SupervisorApplication | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch hackathon details
      const hackathonRes = await fetch(`/api/supervisor/hackathons/${params.id}`, {
        credentials: 'include'
      })
      
      if (hackathonRes.ok) {
        const data = await hackathonRes.json()
        setHackathon(data.hackathon)
      }

      // Fetch supervision applications
      const appsRes = await fetch(`/api/admin/supervision-applications?hackathonId=${params.id}`, {
        credentials: 'include'
      })

      if (appsRes.ok) {
        const data = await appsRes.json()
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (appId: string, status: 'approved' | 'rejected') => {
    if (!confirm(`هل أنت متأكد من ${status === 'approved' ? 'قبول' : 'رفض'} هذا الطلب؟`)) return

    try {
      const response = await fetch(`/api/admin/supervision-applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      })

      if (response.ok) {
        alert(`تم ${status === 'approved' ? 'قبول' : 'رفض'} الطلب بنجاح`)
        fetchData()
      } else {
        alert('فشل في تحديث حالة الطلب')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('حدث خطأ في تحديث حالة الطلب')
    }
  }

  const viewDetails = (app: SupervisorApplication) => {
    setSelectedApp(app)
    setDetailsOpen(true)
  }

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#01645e] font-semibold">جاري التحميل...</p>
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
          className="flex items-center gap-4 mb-8"
        >
          <Link href="/supervisor/forms">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-[#01645e]">طلبات الإشراف</h1>
            <p className="text-[#8b7632] text-lg">{hackathon?.title}</p>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'إجمالي الطلبات', value: stats.total, icon: FileText, color: 'from-purple-500 to-pink-500' },
            { title: 'قيد المراجعة', value: stats.pending, icon: Calendar, color: 'from-yellow-500 to-orange-500' },
            { title: 'مقبولة', value: stats.approved, icon: CheckCircle2, color: 'from-green-500 to-teal-500' },
            { title: 'مرفوضة', value: stats.rejected, icon: XCircle, color: 'from-red-500 to-pink-500' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8b7632] mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-[#01645e]">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-br ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}></div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filter Buttons */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
              >
                الكل ({stats.total})
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
                size="sm"
              >
                قيد المراجعة ({stats.pending})
              </Button>
              <Button
                variant={filter === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilter('approved')}
                size="sm"
              >
                مقبولة ({stats.approved})
              </Button>
              <Button
                variant={filter === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilter('rejected')}
                size="sm"
              >
                مرفوضة ({stats.rejected})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>طلبات الانضمام للإشراف</CardTitle>
            <CardDescription>
              عرض وإدارة طلبات الإشراف للهاكاثون
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-[#01645e] mb-2">لا توجد طلبات</h3>
                <p className="text-[#8b7632]">لا توجد طلبات تطابق الفلتر المحدد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <div
                    key={app.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#01645e]">
                            {app.user.name}
                          </h3>
                          <Badge className={
                            app.status === 'approved' ? 'bg-green-500' :
                            app.status === 'rejected' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }>
                            {app.status === 'approved' ? 'مقبول' :
                             app.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                          </Badge>
                        </div>
                        <div className="text-sm text-[#8b7632] space-y-1">
                          <p className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {app.user.email}
                          </p>
                          {app.user.phone && (
                            <p className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {app.user.phone}
                            </p>
                          )}
                          {app.user.city && (
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {app.user.city}
                            </p>
                          )}
                          <p className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(app.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewDetails(app)}
                        >
                          <Eye className="w-4 h-4 ml-2" />
                          عرض
                        </Button>
                        {app.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => updateStatus(app.id, 'approved')}
                            >
                              <CheckCircle2 className="w-4 h-4 ml-2" />
                              قبول
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => updateStatus(app.id, 'rejected')}
                            >
                              <XCircle className="w-4 h-4 ml-2" />
                              رفض
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تفاصيل الطلب</DialogTitle>
              <DialogDescription>
                معلومات تفصيلية عن طلب الانضمام للإشراف
              </DialogDescription>
            </DialogHeader>
            {selectedApp && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="text-lg font-semibold text-[#01645e] mb-3">المعلومات الأساسية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#8b7632]">الاسم</Label>
                      <p className="text-[#01645e] font-semibold">{selectedApp.user.name}</p>
                    </div>
                    <div>
                      <Label className="text-[#8b7632]">البريد الإلكتروني</Label>
                      <p className="text-[#01645e] font-semibold">{selectedApp.user.email}</p>
                    </div>
                    {selectedApp.user.phone && (
                      <div>
                        <Label className="text-[#8b7632]">الهاتف</Label>
                        <p className="text-[#01645e] font-semibold">{selectedApp.user.phone}</p>
                      </div>
                    )}
                    {selectedApp.user.city && (
                      <div>
                        <Label className="text-[#8b7632]">المدينة</Label>
                        <p className="text-[#01645e] font-semibold">{selectedApp.user.city}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Application Details */}
                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="text-lg font-semibold text-[#01645e] mb-3">تفاصيل الطلب</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[#8b7632]">الخبرة</Label>
                      <p className="text-[#01645e]">{selectedApp.experience || 'لم يتم التحديد'}</p>
                    </div>
                    <div>
                      <Label className="text-[#8b7632]">الدافع للمشاركة</Label>
                      <p className="text-[#01645e]">{selectedApp.motivation || 'لم يتم التحديد'}</p>
                    </div>
                    <div>
                      <Label className="text-[#8b7632]">التفرغ</Label>
                      <p className="text-[#01645e]">{selectedApp.availability || 'لم يتم التحديد'}</p>
                    </div>
                    <div>
                      <Label className="text-[#8b7632]">تاريخ التقديم</Label>
                      <p className="text-[#01645e]">{new Date(selectedApp.createdAt).toLocaleDateString('ar-SA')}</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-semibold text-[#01645e] mb-3">الحالة</h3>
                  <Badge className={
                    selectedApp.status === 'approved' ? 'bg-green-500' :
                    selectedApp.status === 'rejected' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }>
                    {selectedApp.status === 'approved' ? 'مقبول' :
                     selectedApp.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                  </Badge>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
