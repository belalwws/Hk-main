'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Filter,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useModal } from '@/hooks/use-modal'
import { ExcelExporter } from '@/lib/excel-export'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface JudgeApplication {
  id: string
  hackathonId: string
  name: string
  email: string
  phone: string | null
  bio: string | null
  expertise: string | null
  experience: string | null
  linkedin: string | null
  twitter: string | null
  website: string | null
  profileImage: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy: string | null
  reviewNotes: string | null
  rejectionReason: string | null
  createdAt: string
  reviewedAt: string | null
}

interface Hackathon {
  id: string
  title: string
}

export default function JudgeApplicationsPage() {
  const [applications, setApplications] = useState<JudgeApplication[]>([])
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<JudgeApplication | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [hackathonFilter, setHackathonFilter] = useState<string>('all')
  const { showSuccess, showError, showWarning, showConfirm, ModalComponents } = useModal()

  const [approveFormData, setApproveFormData] = useState({
    password: '',
    reviewNotes: ''
  })
  const [rejectFormData, setRejectFormData] = useState({
    rejectionReason: '',
    reviewNotes: ''
  })

  useEffect(() => {
    fetchApplications()
    fetchHackathons()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/judge-applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
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

  const getHackathonTitle = (hackathonId: string) => {
    const hackathon = hackathons.find(h => h.id === hackathonId)
    return hackathon?.title || 'غير معروف'
  }

  const filteredApplications = applications.filter(app => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false
    if (hackathonFilter !== 'all' && app.hackathonId !== hackathonFilter) return false
    return true
  })

  const viewDetails = (application: JudgeApplication) => {
    setSelectedApplication(application)
    setShowDetailsDialog(true)
  }

  const approveApplication = async (applicationId: string) => {
    if (!approveFormData.password) {
      showWarning('كلمة المرور مطلوبة')
      return
    }

    try {
      const response = await fetch(`/api/admin/judge-applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          password: approveFormData.password,
          reviewNotes: approveFormData.reviewNotes
        })
      })

      if (response.ok) {
        showSuccess('تم قبول الطلب وإنشاء حساب المحكم بنجاح!')
        setShowDetailsDialog(false)
        setApproveFormData({ password: '', reviewNotes: '' })
        fetchApplications()
      } else {
        const error = await response.json()
        showError(error.error || 'فشل في قبول الطلب')
      }
    } catch (error) {
      console.error('Error approving application:', error)
      showError('حدث خطأ في قبول الطلب')
    }
  }

  const rejectApplication = async (applicationId: string) => {
    if (!rejectFormData.rejectionReason) {
      showWarning('سبب الرفض مطلوب')
      return
    }

    try {
      const response = await fetch(`/api/admin/judge-applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          rejectionReason: rejectFormData.rejectionReason,
          reviewNotes: rejectFormData.reviewNotes
        })
      })

      if (response.ok) {
        showSuccess('تم رفض الطلب')
        setShowDetailsDialog(false)
        setRejectFormData({ rejectionReason: '', reviewNotes: '' })
        fetchApplications()
      } else {
        const error = await response.json()
        showError(error.error || 'فشل في رفض الطلب')
      }
    } catch (error) {
      console.error('Error rejecting application:', error)
      showError('حدث خطأ في رفض الطلب')
    }
  }

  const exportToExcel = async () => {
    try {
      await ExcelExporter.exportToExcel({
        filename: 'طلبات_المحكمين.xlsx',
        sheetName: 'الطلبات',
        columns: [
          { key: 'name', header: 'الاسم', width: 20 },
          { key: 'email', header: 'البريد الإلكتروني', width: 25 },
          { key: 'phone', header: 'الهاتف', width: 15 },
          { key: 'expertise', header: 'مجال الخبرة', width: 20 },
          { key: 'hackathon', header: 'الهاكاثون', width: 25 },
          { key: 'status', header: 'الحالة', width: 12 },
          { key: 'createdAt', header: 'تاريخ التقديم', width: 18, format: 'date' }
        ],
        data: filteredApplications.map(app => ({
          name: app.name,
          email: app.email,
          phone: app.phone || 'غير محدد',
          expertise: app.expertise || 'غير محدد',
          hackathon: getHackathonTitle(app.hackathonId),
          status: app.status === 'pending' ? 'معلق' : app.status === 'approved' ? 'مقبول' : 'مرفوض',
          createdAt: app.createdAt
        }))
      })
    } catch (error) {
      console.error('Error exporting applications:', error)
      showError('حدث خطأ في تصدير البيانات')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="w-3 h-3 ml-1" />
            معلق
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 ml-1" />
            مقبول
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-500 text-white">
            <XCircle className="w-3 h-3 ml-1" />
            مرفوض
          </Badge>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#01645e] font-semibold">جاري تحميل الطلبات...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[#01645e] mb-2">طلبات المحكمين</h1>
              <p className="text-[#8b7632] text-lg">إدارة ومراجعة طلبات التقديم للمحكمين</p>
            </div>
            <Button
              onClick={exportToExcel}
              disabled={filteredApplications.length === 0}
              variant="outline"
              className="border-[#3ab666] text-[#3ab666] hover:bg-[#3ab666] hover:text-white"
            >
              <Download className="w-4 h-4 ml-2" />
              تصدير Excel ({filteredApplications.length})
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8b7632]">إجمالي الطلبات</p>
                    <p className="text-2xl font-bold text-[#01645e]">{applications.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-[#01645e]" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8b7632]">معلقة</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {applications.filter(a => a.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8b7632]">مقبولة</p>
                    <p className="text-2xl font-bold text-green-600">
                      {applications.filter(a => a.status === 'approved').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8b7632]">مرفوضة</p>
                    <p className="text-2xl font-bold text-red-600">
                      {applications.filter(a => a.status === 'rejected').length}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-[#01645e]" />
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-[#8b7632]">الحالة</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الحالات</SelectItem>
                        <SelectItem value="pending">معلقة</SelectItem>
                        <SelectItem value="approved">مقبولة</SelectItem>
                        <SelectItem value="rejected">مرفوضة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm text-[#8b7632]">الهاكاثون</Label>
                    <Select value={hackathonFilter} onValueChange={setHackathonFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الهاكاثونات</SelectItem>
                        {hackathons.map(h => (
                          <SelectItem key={h.id} value={h.id}>{h.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Applications Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-[#01645e]">جدول الطلبات</CardTitle>
              <CardDescription>
                عرض {filteredApplications.length} من {applications.length} طلب
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-[#01645e] mb-2">لا توجد طلبات</h3>
                  <p className="text-[#8b7632]">لم يتم العثور على طلبات بالفلاتر المحددة</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الاسم</TableHead>
                        <TableHead className="text-right">البريد الإلكتروني</TableHead>
                        <TableHead className="text-right">الهاتف</TableHead>
                        <TableHead className="text-right">مجال الخبرة</TableHead>
                        <TableHead className="text-right">الهاكاثون</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">تاريخ التقديم</TableHead>
                        <TableHead className="text-right">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((application) => (
                        <TableRow key={application.id} className="hover:bg-[#c3e956]/5">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {application.profileImage ? (
                                <img
                                  src={application.profileImage}
                                  alt={application.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-[#01645e] flex items-center justify-center text-white text-sm">
                                  {application.name.charAt(0)}
                                </div>
                              )}
                              {application.name}
                            </div>
                          </TableCell>
                          <TableCell>{application.email}</TableCell>
                          <TableCell>{application.phone || '-'}</TableCell>
                          <TableCell>{application.expertise || '-'}</TableCell>
                          <TableCell className="text-sm">
                            {getHackathonTitle(application.hackathonId)}
                          </TableCell>
                          <TableCell>{getStatusBadge(application.status)}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(application.createdAt).toLocaleDateString('ar-SA')}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewDetails(application)}
                              className="text-[#01645e] border-[#01645e]"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#01645e]" />
                تفاصيل الطلب
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Profile Image */}
              {selectedApplication.profileImage && (
                <div className="flex justify-center">
                  <img
                    src={selectedApplication.profileImage}
                    alt={selectedApplication.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#01645e]"
                  />
                </div>
              )}

              {/* Basic Info Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#c3e956]/10 rounded-lg">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-[#01645e] mt-1" />
                  <div>
                    <Label className="text-[#01645e] font-bold text-sm">الاسم</Label>
                    <p className="text-sm">{selectedApplication.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-[#01645e] mt-1" />
                  <div>
                    <Label className="text-[#01645e] font-bold text-sm">البريد الإلكتروني</Label>
                    <p className="text-xs">{selectedApplication.email}</p>
                  </div>
                </div>
                {selectedApplication.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-[#01645e] mt-1" />
                    <div>
                      <Label className="text-[#01645e] font-bold text-sm">الهاتف</Label>
                      <p className="text-sm">{selectedApplication.phone}</p>
                    </div>
                  </div>
                )}
                {selectedApplication.expertise && (
                  <div className="flex items-start gap-2">
                    <Briefcase className="w-4 h-4 text-[#01645e] mt-1" />
                    <div>
                      <Label className="text-[#01645e] font-bold text-sm">مجال الخبرة</Label>
                      <p className="text-sm">{selectedApplication.expertise}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2 col-span-2">
                  <Calendar className="w-4 h-4 text-[#01645e] mt-1" />
                  <div>
                    <Label className="text-[#01645e] font-bold text-sm">تاريخ التقديم</Label>
                    <p className="text-sm">
                      {new Date(selectedApplication.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedApplication.bio && (
                <div className="p-4 bg-white border rounded-lg">
                  <Label className="text-[#01645e] font-bold">نبذة</Label>
                  <p className="text-sm text-[#8b7632] mt-2">{selectedApplication.bio}</p>
                </div>
              )}

              {/* Experience */}
              {selectedApplication.experience && (
                <div className="p-4 bg-white border rounded-lg">
                  <Label className="text-[#01645e] font-bold">الخبرة العملية</Label>
                  <p className="text-sm text-[#8b7632] mt-2 whitespace-pre-wrap">
                    {selectedApplication.experience}
                  </p>
                </div>
              )}

              {/* Social Links */}
              {(selectedApplication.linkedin || selectedApplication.twitter || selectedApplication.website) && (
                <div className="p-4 bg-white border rounded-lg">
                  <Label className="text-[#01645e] font-bold mb-2 block">الروابط</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.linkedin && (
                      <a
                        href={selectedApplication.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline border border-blue-600 px-3 py-1 rounded"
                      >
                        LinkedIn
                      </a>
                    )}
                    {selectedApplication.twitter && (
                      <a
                        href={selectedApplication.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline border border-blue-400 px-3 py-1 rounded"
                      >
                        Twitter
                      </a>
                    )}
                    {selectedApplication.website && (
                      <a
                        href={selectedApplication.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 hover:underline border border-green-600 px-3 py-1 rounded"
                      >
                        الموقع الشخصي
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-2 p-4 bg-white border rounded-lg">
                <Label className="text-[#01645e] font-bold">الحالة:</Label>
                {getStatusBadge(selectedApplication.status)}
              </div>

              {/* Actions for Pending Applications */}
              {selectedApplication.status === 'pending' && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-bold text-[#01645e]">إجراءات</h3>

                  {/* Approve Section */}
                  <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <Label className="text-green-700 font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      قبول الطلب
                    </Label>
                    <Input
                      type="password"
                      placeholder="كلمة المرور للحساب الجديد *"
                      value={approveFormData.password}
                      onChange={(e) => setApproveFormData({ ...approveFormData, password: e.target.value })}
                    />
                    <Textarea
                      placeholder="ملاحظات (اختياري)"
                      value={approveFormData.reviewNotes}
                      onChange={(e) => setApproveFormData({ ...approveFormData, reviewNotes: e.target.value })}
                      rows={2}
                    />
                    <Button
                      onClick={() => approveApplication(selectedApplication.id)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      قبول وإنشاء الحساب
                    </Button>
                  </div>

                  {/* Reject Section */}
                  <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
                    <Label className="text-red-700 font-bold flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      رفض الطلب
                    </Label>
                    <Textarea
                      placeholder="سبب الرفض *"
                      value={rejectFormData.rejectionReason}
                      onChange={(e) => setRejectFormData({ ...rejectFormData, rejectionReason: e.target.value })}
                      rows={2}
                    />
                    <Textarea
                      placeholder="ملاحظات (اختياري)"
                      value={rejectFormData.reviewNotes}
                      onChange={(e) => setRejectFormData({ ...rejectFormData, reviewNotes: e.target.value })}
                      rows={2}
                    />
                    <Button
                      onClick={() => rejectApplication(selectedApplication.id)}
                      variant="destructive"
                      className="w-full"
                    >
                      <XCircle className="w-4 h-4 ml-2" />
                      رفض الطلب
                    </Button>
                  </div>
                </div>
              )}

              {/* Review Info for Processed Applications */}
              {selectedApplication.status !== 'pending' && (
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-bold text-[#01645e]">معلومات المراجعة</h3>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    {selectedApplication.reviewedAt && (
                      <p className="text-sm text-[#8b7632]">
                        <strong>تاريخ المراجعة:</strong>{' '}
                        {new Date(selectedApplication.reviewedAt).toLocaleDateString('ar-SA')}
                      </p>
                    )}
                    {selectedApplication.reviewNotes && (
                      <div>
                        <Label className="text-[#01645e] font-bold">ملاحظات المراجع</Label>
                        <p className="text-sm text-[#8b7632] mt-1">{selectedApplication.reviewNotes}</p>
                      </div>
                    )}
                    {selectedApplication.rejectionReason && (
                      <div>
                        <Label className="text-red-700 font-bold">سبب الرفض</Label>
                        <p className="text-sm text-red-600 mt-1">{selectedApplication.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Components */}
      <ModalComponents />
    </div>
  )
}
