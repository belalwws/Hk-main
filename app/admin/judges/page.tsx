'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, Eye, Edit, Trash2, UserCheck, UserX, Mail, Download, Send, Copy, Clock, CheckCircle, XCircle, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { useModal } from '@/hooks/use-modal'
import { ExcelExporter } from '@/lib/excel-export'

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

interface JudgeInvitation {
  id: string
  email: string
  name: string | null
  hackathonId: string
  token: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  expiresAt: string
  createdAt: string
}

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

export default function AdminJudgesPage() {
  const [judges, setJudges] = useState<Judge[]>([])
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [invitations, setInvitations] = useState<JudgeInvitation[]>([])
  const [applications, setApplications] = useState<JudgeApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showInvitationsDialog, setShowInvitationsDialog] = useState(false)
  const [showApplicationsDialog, setShowApplicationsDialog] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<JudgeApplication | null>(null)
  const [showApplicationDetailsDialog, setShowApplicationDetailsDialog] = useState(false)
  const { showSuccess, showError, showWarning, showConfirm, ModalComponents } = useModal()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    hackathonId: ''
  })
  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    name: '',
    hackathonId: '',
    expiresInDays: 7,
    registrationLink: '',
    attachmentUrl: '',
    emailMessage: `سعادة / [الاسم الكامل]
الموضوع / دعوة للمشاركة كعضو لجنة تحكيم

السلام عليكم ورحمة الله وبركاته،،

تتشرف اللجنة التنظيمية لإدارة هاكاثون الصحة النفسية الافتراضي 2025 بدعوتكم للمشاركة كعضو في لجنة التحكيم الخاصة بالهاكاثون، الذي يُقام خلال الفترة من يوم الثلاثاء الموافق 21 أكتوبر 2025 إلى يوم الخميس الموافق 23 أكتوبر 2025، وذلك عن بُعد عبر منصة زووم.

تتولى لجنة التحكيم مهمة تقييم الحلول والأفكار الابتكارية التي يقدمها المشاركون، وفق معايير محددة تهدف إلى ضمان اختيار أفضل المشاريع وأكثرها تأثيرًا في تعزيز الصحة النفسية وجودة الحياة.

إن خبرتكم المتميزة ستكون إضافة قيّمة تسهم في إنجاح الفعالية وتحقيق أهدافها.

كما نود إفادتكم بأنه تم تخصيص نموذج تسجيل إلكتروني لأعضاء لجنة التحكيم لاستكمال البيانات اللوجستية واعتماد المشاركة.
نأمل منكم تعبئته في أسرع وقت ممكن، وقبل يوم الاحد 19 اكتوبر 2025 الساعة 11:59 مساءً عبر الرابط التالي:
👉 [رابط التسجيل]

نرجو منكم التكرم بتأكيد موافقتكم على المشاركة عبر الرد على هذا البريد الإلكتروني بعد استكمال التسجيل.

وتفضلوا بقبول فائق الاحترام،،

مع أطيب التحيات،
فريق اللجنة التنظيمية
هاكاثون الصحة النفسية الافتراضي 2025`
  })
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [approveFormData, setApproveFormData] = useState({
    password: '',
    reviewNotes: ''
  })
  const [rejectFormData, setRejectFormData] = useState({
    rejectionReason: '',
    reviewNotes: ''
  })

  useEffect(() => {
    fetchJudges()
    fetchHackathons()
    fetchInvitations()
    fetchApplications()
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

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/admin/judge-invitations')
      if (response.ok) {
        const data = await response.json()
        setInvitations(data.invitations || [])
      }
    } catch (error) {
      console.error('Error fetching invitations:', error)
    }
  }

  const createJudge = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.hackathonId) {
      showWarning('يرجى ملء جميع الحقول المطلوبة')
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
        showSuccess('تم إنشاء المحكم بنجاح!')
        setShowCreateDialog(false)
        setFormData({ name: '', email: '', phone: '', password: '', hackathonId: '' })
        fetchJudges()
      } else {
        const error = await response.json()
        showError(error.error || 'فشل في إنشاء المحكم')
      }
    } catch (error) {
      console.error('Error creating judge:', error)
      showError('حدث خطأ في إنشاء المحكم')
    }
  }

  const sendInvitation = async () => {
    if (!inviteFormData.email || !inviteFormData.hackathonId) {
      showWarning('البريد الإلكتروني والهاكاثون مطلوبان')
      return
    }

    if (!inviteFormData.name) {
      showWarning('اسم المحكم مطلوب')
      return
    }

    if (!inviteFormData.registrationLink) {
      showWarning('رابط التسجيل مطلوب')
      return
    }

    try {
      const response = await fetch('/api/admin/judge-invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteFormData)
      })

      if (response.ok) {
        const result = await response.json()
        showSuccess('تم إرسال الدعوة بنجاح!')

        setShowInviteDialog(false)
        setInviteFormData({ 
          email: '', 
          name: '', 
          hackathonId: '', 
          expiresInDays: 7,
          registrationLink: '',
          attachmentUrl: '',
          emailMessage: inviteFormData.emailMessage // Keep default message
        })
        fetchInvitations()
      } else {
        const error = await response.json()
        showError(error.error || 'فشل في إرسال الدعوة')
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      showError('حدث خطأ في إرسال الدعوة')
    }
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      showError('يرجى رفع ملف PDF فقط')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      showError('حجم الملف يجب أن يكون أقل من 10 ميجابايت')
      return
    }

    setUploadingPdf(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'hackathon_pdfs') // Set this in Cloudinary

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (response.ok) {
        const data = await response.json()
        setInviteFormData({ ...inviteFormData, attachmentUrl: data.secure_url })
        showSuccess('تم رفع المرفق بنجاح!')
      } else {
        showError('فشل في رفع المرفق')
      }
    } catch (error) {
      console.error('Error uploading PDF:', error)
      showError('حدث خطأ في رفع المرفق')
    } finally {
      setUploadingPdf(false)
    }
  }

  const cancelInvitation = async (invitationId: string) => {
    const confirmed = await showConfirm('هل أنت متأكد من إلغاء هذه الدعوة؟')
    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/judge-invitations/${invitationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showSuccess('تم إلغاء الدعوة بنجاح')
        fetchInvitations()
      } else {
        showError('فشل في إلغاء الدعوة')
      }
    } catch (error) {
      console.error('Error cancelling invitation:', error)
      showError('حدث خطأ في إلغاء الدعوة')
    }
  }

  const copyInvitationLink = async (token: string) => {
    const baseUrl = window.location.origin
    const invitationLink = `${baseUrl}/judge/register?token=${token}`

    try {
      await navigator.clipboard.writeText(invitationLink)
      showSuccess('تم نسخ رابط الدعوة إلى الحافظة!')
    } catch (error) {
      console.error('Error copying link:', error)
      showError('فشل في نسخ الرابط')
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/judge-applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

  const viewApplicationDetails = (application: JudgeApplication) => {
    setSelectedApplication(application)
    setShowApplicationDetailsDialog(true)
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
        setShowApplicationDetailsDialog(false)
        setApproveFormData({ password: '', reviewNotes: '' })
        fetchApplications()
        fetchJudges()
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
        setShowApplicationDetailsDialog(false)
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

  const copyApplicationFormLink = async (hackathonId: string) => {
    const baseUrl = window.location.origin
    const formLink = `${baseUrl}/judge/apply/${hackathonId}`

    try {
      await navigator.clipboard.writeText(formLink)
      showSuccess('تم نسخ رابط الفورم إلى الحافظة!')
    } catch (error) {
      console.error('Error copying link:', error)
      showError('فشل في نسخ الرابط')
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
    showConfirm(
      `هل أنت متأكد من حذف المحكم "${judgeName}"؟`,
      async () => {
        try {
          const response = await fetch(`/api/admin/judges/${judgeId}`, {
            method: 'DELETE'
          })

          if (response.ok) {
            fetchJudges()
            showSuccess('تم حذف المحكم بنجاح')
          } else {
            showError('فشل في حذف المحكم')
          }
        } catch (error) {
          console.error('Error deleting judge:', error)
          showError('حدث خطأ في حذف المحكم')
        }
      },
      '🗑️ حذف المحكم',
      'حذف',
      'إلغاء',
      'danger'
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge className={`${isActive ? 'bg-green-500' : 'bg-red-500'} text-white`}>
        {isActive ? 'نشط' : 'معطل'}
      </Badge>
    )
  }

  const exportToExcel = async () => {
    try {
      await ExcelExporter.exportToExcel({
        filename: 'المحكمين.xlsx',
        sheetName: 'المحكمين',
        columns: [
          { key: 'userName', header: 'اسم المحكم', width: 20 },
          { key: 'userEmail', header: 'البريد الإلكتروني', width: 25 },
          { key: 'userPhone', header: 'رقم الهاتف', width: 15 },
          { key: 'hackathonTitle', header: 'الهاكاثون المعين له', width: 25 },
          { key: 'status', header: 'الحالة', width: 12 },
          { key: 'assignedAt', header: 'تاريخ التعيين', width: 18, format: 'date' }
        ],
        data: judges.map(judge => ({
          userName: judge.user.name,
          userEmail: judge.user.email,
          userPhone: judge.user.phone || 'غير محدد',
          hackathonTitle: judge.hackathon.title,
          status: judge.isActive ? 'نشط' : 'غير نشط',
          assignedAt: judge.assignedAt
        }))
      })
    } catch (error) {
      console.error('Error exporting judges:', error)
      alert('حدث خطأ في تصدير البيانات')
    }
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
          
          <div className="flex gap-3">
            <Button
              onClick={() => setShowApplicationsDialog(true)}
              variant="outline"
              className="border-[#c3e956] text-[#8b7632] hover:bg-[#c3e956] hover:text-[#01645e]"
            >
              <Users className="w-4 h-4 ml-2" />
              الطلبات ({applications.filter(a => a.status === 'pending').length})
            </Button>
            <Button
              onClick={() => setShowInvitationsDialog(true)}
              variant="outline"
              className="border-[#8b7632] text-[#8b7632] hover:bg-[#8b7632] hover:text-white"
            >
              <Mail className="w-4 h-4 ml-2" />
              الدعوات ({invitations.filter(i => i.status === 'pending').length})
            </Button>
            <Button
              onClick={exportToExcel}
              disabled={judges.length === 0}
              variant="outline"
              className="border-[#3ab666] text-[#3ab666] hover:bg-[#3ab666] hover:text-white"
            >
              <Download className="w-4 h-4 ml-2" />
              تصدير Excel ({judges.length})
            </Button>
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-[#01645e] text-[#01645e] hover:bg-[#01645e] hover:text-white">
                  <Send className="w-5 h-5 ml-2" />
                  إرسال دعوة
                </Button>
              </DialogTrigger>
            </Dialog>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#01645e] to-[#3ab666]">
                  <Plus className="w-5 h-5 ml-2" />
                  إضافة محكم جديد
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </motion.div>

        {/* Create Judge Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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

      {/* Invite Judge Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-[#01645e]" />
              إرسال دعوة محكم
            </DialogTitle>
            <DialogDescription>
              أرسل دعوة مخصصة للمحكم مع مرفق PDF
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invite-name">اسم المحكم *</Label>
                <Input
                  id="invite-name"
                  type="text"
                  placeholder="د. أحمد محمد"
                  value={inviteFormData.name}
                  onChange={(e) => setInviteFormData({ ...inviteFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-email">البريد الإلكتروني *</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="judge@example.com"
                  value={inviteFormData.email}
                  onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invite-hackathon">الهاكاثون *</Label>
              <Select
                value={inviteFormData.hackathonId}
                onValueChange={(value) => setInviteFormData({ ...inviteFormData, hackathonId: value })}
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="invite-registration-link">رابط التسجيل *</Label>
              <Input
                id="invite-registration-link"
                type="url"
                placeholder="https://example.com/register"
                value={inviteFormData.registrationLink}
                onChange={(e) => setInviteFormData({ ...inviteFormData, registrationLink: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-pdf">رفع مرفق PDF (اختياري)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="invite-pdf"
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  disabled={uploadingPdf}
                  className="flex-1"
                />
                {uploadingPdf && (
                  <div className="text-sm text-[#01645e]">جاري الرفع...</div>
                )}
              </div>
              {inviteFormData.attachmentUrl && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  تم رفع المرفق بنجاح
                  <a href={inviteFormData.attachmentUrl} target="_blank" rel="noopener noreferrer" className="underline">
                    عرض
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-message">صياغة الرسالة *</Label>
              <Textarea
                id="invite-message"
                value={inviteFormData.emailMessage}
                onChange={(e) => setInviteFormData({ ...inviteFormData, emailMessage: e.target.value })}
                rows={15}
                className="font-arabic text-sm"
                placeholder="اكتب نص الدعوة هنا..."
              />
              <p className="text-xs text-[#8b7632]">
                استخدم [الاسم الكامل] و [رابط التسجيل] كمتغيرات سيتم استبدالها تلقائياً
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invite-expires">صلاحية الدعوة (أيام)</Label>
                <Input
                  id="invite-expires"
                  type="number"
                  min="1"
                  max="30"
                  value={inviteFormData.expiresInDays}
                  onChange={(e) => setInviteFormData({ ...inviteFormData, expiresInDays: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={sendInvitation} className="bg-gradient-to-r from-[#01645e] to-[#3ab666]" disabled={uploadingPdf}>
              <Send className="w-4 h-4 ml-2" />
              إرسال الدعوة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invitations List Dialog */}
      <Dialog open={showInvitationsDialog} onOpenChange={setShowInvitationsDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#01645e]" />
              دعوات المحكمين
            </DialogTitle>
            <DialogDescription>
              جميع الدعوات المرسلة للمحكمين
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {invitations.length === 0 ? (
              <div className="text-center py-8 text-[#8b7632]">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد دعوات</p>
              </div>
            ) : (
              invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-[#01645e]" />
                        <span className="font-semibold text-[#01645e]">{invitation.email}</span>
                      </div>
                      {invitation.name && (
                        <p className="text-sm text-[#8b7632] mr-6">{invitation.name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {invitation.status === 'pending' && (
                        <Badge className="bg-yellow-500 text-white">
                          <Clock className="w-3 h-3 ml-1" />
                          معلقة
                        </Badge>
                      )}
                      {invitation.status === 'accepted' && (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="w-3 h-3 ml-1" />
                          مقبولة
                        </Badge>
                      )}
                      {invitation.status === 'expired' && (
                        <Badge className="bg-gray-500 text-white">
                          <XCircle className="w-3 h-3 ml-1" />
                          منتهية
                        </Badge>
                      )}
                      {invitation.status === 'cancelled' && (
                        <Badge className="bg-red-500 text-white">
                          <XCircle className="w-3 h-3 ml-1" />
                          ملغاة
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-[#8b7632] mr-6">
                    <p>تنتهي في: {new Date(invitation.expiresAt).toLocaleDateString('ar-SA')}</p>
                    <p>تم الإرسال: {new Date(invitation.createdAt).toLocaleDateString('ar-SA')}</p>
                  </div>
                  {invitation.status === 'pending' && (
                    <div className="flex gap-2 mr-6 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyInvitationLink(invitation.token)}
                        className="text-[#01645e] border-[#01645e]"
                      >
                        <Copy className="w-3 h-3 ml-1" />
                        نسخ الرابط
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelInvitation(invitation.id)}
                        className="text-red-600 border-red-600"
                      >
                        <XCircle className="w-3 h-3 ml-1" />
                        إلغاء
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Applications List Dialog */}
      <Dialog open={showApplicationsDialog} onOpenChange={setShowApplicationsDialog}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#01645e]" />
              طلبات المحكمين
            </DialogTitle>
            <DialogDescription>
              جميع الطلبات المقدمة من المحكمين عبر الفورم
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {applications.length === 0 ? (
              <div className="text-center py-8 text-[#8b7632]">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد طلبات</p>
              </div>
            ) : (
              applications.map((application) => (
                <div
                  key={application.id}
                  className="border rounded-lg p-4 space-y-2 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {application.profileImage && (
                          <img
                            src={application.profileImage}
                            alt={application.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-[#01645e]"
                          />
                        )}
                        <div>
                          <h3 className="font-bold text-[#01645e]">{application.name}</h3>
                          <p className="text-sm text-[#8b7632]">{application.email}</p>
                        </div>
                      </div>
                      {application.expertise && (
                        <p className="text-sm text-[#8b7632] mb-1">
                          <strong>الخبرة:</strong> {application.expertise}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {application.status === 'pending' && (
                        <Badge className="bg-yellow-500 text-white">
                          <Clock className="w-3 h-3 ml-1" />
                          معلق
                        </Badge>
                      )}
                      {application.status === 'approved' && (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="w-3 h-3 ml-1" />
                          مقبول
                        </Badge>
                      )}
                      {application.status === 'rejected' && (
                        <Badge className="bg-red-500 text-white">
                          <XCircle className="w-3 h-3 ml-1" />
                          مرفوض
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-[#8b7632]">
                    <p>تاريخ التقديم: {new Date(application.createdAt).toLocaleDateString('ar-SA')}</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewApplicationDetails(application)}
                      className="text-[#01645e] border-[#01645e]"
                    >
                      <Eye className="w-3 h-3 ml-1" />
                      عرض التفاصيل
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={showApplicationDetailsDialog} onOpenChange={setShowApplicationDetailsDialog}>
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

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#01645e] font-bold">الاسم</Label>
                  <p>{selectedApplication.name}</p>
                </div>
                <div>
                  <Label className="text-[#01645e] font-bold">البريد الإلكتروني</Label>
                  <p className="text-sm">{selectedApplication.email}</p>
                </div>
                {selectedApplication.phone && (
                  <div>
                    <Label className="text-[#01645e] font-bold">الهاتف</Label>
                    <p>{selectedApplication.phone}</p>
                  </div>
                )}
                {selectedApplication.expertise && (
                  <div>
                    <Label className="text-[#01645e] font-bold">مجالات الخبرة</Label>
                    <p>{selectedApplication.expertise}</p>
                  </div>
                )}
              </div>

              {/* Bio */}
              {selectedApplication.bio && (
                <div>
                  <Label className="text-[#01645e] font-bold">نبذة</Label>
                  <p className="text-sm text-[#8b7632] mt-1">{selectedApplication.bio}</p>
                </div>
              )}

              {/* Experience */}
              {selectedApplication.experience && (
                <div>
                  <Label className="text-[#01645e] font-bold">الخبرة العملية</Label>
                  <p className="text-sm text-[#8b7632] mt-1">{selectedApplication.experience}</p>
                </div>
              )}

              {/* Social Links */}
              <div className="grid grid-cols-3 gap-2">
                {selectedApplication.linkedin && (
                  <a href={selectedApplication.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                    LinkedIn
                  </a>
                )}
                {selectedApplication.twitter && (
                  <a href={selectedApplication.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm hover:underline">
                    Twitter
                  </a>
                )}
                {selectedApplication.website && (
                  <a href={selectedApplication.website} target="_blank" rel="noopener noreferrer" className="text-green-600 text-sm hover:underline">
                    الموقع
                  </a>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <Label className="text-[#01645e] font-bold">الحالة:</Label>
                {selectedApplication.status === 'pending' && (
                  <Badge className="bg-yellow-500 text-white">معلق</Badge>
                )}
                {selectedApplication.status === 'approved' && (
                  <Badge className="bg-green-500 text-white">مقبول</Badge>
                )}
                {selectedApplication.status === 'rejected' && (
                  <Badge className="bg-red-500 text-white">مرفوض</Badge>
                )}
              </div>

              {/* Actions for Pending Applications */}
              {selectedApplication.status === 'pending' && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-bold text-[#01645e]">إجراءات</h3>

                  {/* Approve Section */}
                  <div className="space-y-2 p-4 bg-green-50 rounded-lg">
                    <Label className="text-green-700 font-bold">قبول الطلب</Label>
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
                  <div className="space-y-2 p-4 bg-red-50 rounded-lg">
                    <Label className="text-red-700 font-bold">رفض الطلب</Label>
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
                <div className="border-t pt-4 space-y-2">
                  <h3 className="font-bold text-[#01645e]">معلومات المراجعة</h3>
                  {selectedApplication.reviewedAt && (
                    <p className="text-sm text-[#8b7632]">
                      تاريخ المراجعة: {new Date(selectedApplication.reviewedAt).toLocaleDateString('ar-SA')}
                    </p>
                  )}
                  {selectedApplication.reviewNotes && (
                    <div>
                      <Label className="text-[#01645e] font-bold">ملاحظات المراجع</Label>
                      <p className="text-sm text-[#8b7632]">{selectedApplication.reviewNotes}</p>
                    </div>
                  )}
                  {selectedApplication.rejectionReason && (
                    <div>
                      <Label className="text-red-700 font-bold">سبب الرفض</Label>
                      <p className="text-sm text-red-600">{selectedApplication.rejectionReason}</p>
                    </div>
                  )}
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
