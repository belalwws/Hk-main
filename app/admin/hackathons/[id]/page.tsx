"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Filter, Settings, FileText, Trophy, Eye, UserCheck, UserX, MapPin, Flag, Mail, Trash2, Pin, PinOff, Upload, Download, FormInput, Palette, Star, BarChart3, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import TeamsDisplay from '@/components/admin/TeamsDisplay'
import ParticipantsImport from '@/components/admin/ParticipantsImport'
import { AlertModal, ConfirmModal } from '@/components/ui/modal'
import { useModal } from '@/hooks/use-modal'
import { ExcelExporter } from '@/lib/excel-export'

interface Participant {
  id: string
  userId: string
  user: {
    name: string
    email: string
    phone: string
    city: string
    nationality: string
    preferredRole?: string
  }
  teamName?: string
  teamId?: string
  projectTitle?: string
  projectDescription?: string
  teamRole?: string
  status: 'pending' | 'approved' | 'rejected'
  registeredAt: string
}

interface Hackathon {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxParticipants?: number
  status: 'draft' | 'open' | 'closed' | 'completed'
  isPinned?: boolean
  evaluationOpen?: boolean
  participants: Participant[]
  teams?: Team[]
  judges?: Judge[]
  stats: {
    totalParticipants: number
    pendingParticipants: number
    approvedParticipants: number
    rejectedParticipants: number
  }
}

interface Team {
  id: string
  name: string
  teamNumber?: number
  participants?: Participant[]
}

interface Judge {
  id: string
  name: string
  email: string
  isActive: boolean
}

export default function HackathonManagementPage() {
  const params = useParams()
  const router = useRouter()
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [nationalityFilter, setNationalityFilter] = useState<string>('all')
  const [showTeamPreview, setShowTeamPreview] = useState(false)
  const [previewTeams, setPreviewTeams] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [creatingTeams, setCreatingTeams] = useState(false)
  const [hasExistingTeams, setHasExistingTeams] = useState(false)
  const [evaluationCriteria, setEvaluationCriteria] = useState<any[]>([])
  const [newCriterion, setNewCriterion] = useState({ name: '', description: '', maxScore: 10 })
  const [sendingEmails, setSendingEmails] = useState(false)
  const [certificateTemplate, setCertificateTemplate] = useState<string | null>(null)
  const [uploadingCertificate, setUploadingCertificate] = useState(false)
  const { showSuccess, showError, showWarning, showConfirm, ModalComponents } = useModal()

  useEffect(() => {
    fetchHackathon()
    checkExistingTeams()
    fetchCertificateTemplate()
  }, [params.id])

  const checkExistingTeams = async () => {
    try {
      console.log('🔄 Checking existing teams for hackathon:', params.id)
      const response = await fetch(`/api/admin/hackathons/${params.id}/teams`)
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Teams data received:', data)
        setTeams(data.teams || [])
        setHasExistingTeams(data.teams.length > 0)
      } else {
        console.error('❌ Failed to fetch teams, status:', response.status)
      }
    } catch (error) {
      console.error('❌ Error checking teams:', error)
    }
  }

  const refreshData = async () => {
    await Promise.all([
      fetchHackathon(),
      checkExistingTeams(),
      fetchEvaluationCriteria()
    ])
  }

  const fetchEvaluationCriteria = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${params.id}/evaluation-criteria`)
      if (response.ok) {
        const data = await response.json()
        setEvaluationCriteria(data.criteria || [])
      }
    } catch (error) {
      console.error('Error fetching evaluation criteria:', error)
    }
  }

  const addEvaluationCriterion = async () => {
    if (!newCriterion.name.trim()) {
      showWarning('يجب إدخال اسم المعيار')
      return
    }

    try {
      const response = await fetch(`/api/admin/hackathons/${params.id}/evaluation-criteria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCriterion)
      })

      if (response.ok) {
        await fetchEvaluationCriteria()
        setNewCriterion({ name: '', description: '', maxScore: 10 })
        showSuccess('تم إضافة المعيار بنجاح')
      } else {
        const error = await response.json()
        showError(error.error || 'فشل في إضافة المعيار')
      }
    } catch (error) {
      console.error('Error adding criterion:', error)
      showError('حدث خطأ في إضافة المعيار')
    }
  }

  const deleteEvaluationCriterion = async (criterionId: string) => {
    showConfirm(
      'هل أنت متأكد من حذف هذا المعيار؟',
      async () => {
        try {
          const response = await fetch(`/api/admin/hackathons/${params.id}/evaluation-criteria/${criterionId}`, {
            method: 'DELETE'
          })

          if (response.ok) {
            await fetchEvaluationCriteria()
            showSuccess('تم حذف المعيار بنجاح')
          } else {
            const error = await response.json()
            showError(error.error || 'فشل في حذف المعيار')
          }
        } catch (error) {
          console.error('Error deleting criterion:', error)
          showError('حدث خطأ في حذف المعيار')
        }
      },
      '🗑️ حذف المعيار',
      'حذف',
      'إلغاء',
      'danger'
    )
  }

  const toggleEvaluation = async () => {
    if (!hackathon) return

    const newStatus = !hackathon.evaluationOpen
    const action = newStatus ? 'فتح' : 'إغلاق'

    if (!confirm(`هل أنت متأكد من ${action} التقييم؟`)) return

    try {
      const response = await fetch(`/api/admin/hackathons/${params.id}/toggle-evaluation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluationOpen: newStatus })
      })

      if (response.ok) {
        await refreshData()
        alert(`تم ${action} التقييم بنجاح`)
      } else {
        const error = await response.json()
        alert(error.error || `فشل في ${action} التقييم`)
      }
    } catch (error) {
      console.error('Error toggling evaluation:', error)
      alert(`حدث خطأ في ${action} التقييم`)
    }
  }

  const sendProjectEmails = async () => {
    if (!hackathon) return

    const teamsWithMembers = hackathon.teams?.filter(team => team.participants && team.participants.length > 0) || []

    if (teamsWithMembers.length === 0) {
      alert('لا توجد فرق لإرسال الإيميلات إليها')
      return
    }

    if (!confirm(`هل أنت متأكد من إرسال إيميلات رفع المشاريع لجميع الفرق؟\n\nسيتم الإرسال لـ ${teamsWithMembers.length} فريق`)) return

    setSendingEmails(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${params.id}/send-project-emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const result = await response.json()
        alert(`تم إرسال الإيميلات بنجاح!\n\nتم الإرسال لـ ${result.emailsSent} عضو في ${result.teamsNotified} فريق`)
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في إرسال الإيميلات')
      }
    } catch (error) {
      console.error('Error sending project emails:', error)
      alert('حدث خطأ في إرسال الإيميلات')
    } finally {
      setSendingEmails(false)
    }
  }

  const fetchHackathon = async () => {
    try {
      console.log('🔄 Fetching hackathon data for ID:', params.id)
      const response = await fetch(`/api/admin/hackathons/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Hackathon data received:', data)
        setHackathon(data.hackathon)
      } else {
        console.error('❌ Failed to fetch hackathon, status:', response.status)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error details:', errorData)
      }
    } catch (error) {
      console.error('❌ Error fetching hackathon:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCertificateTemplate = async () => {
    try {
      // إضافة timestamp لتجنب التخزين المؤقت
      const response = await fetch(`/api/admin/hackathons/${params.id}/certificate-template?t=${Date.now()}`, {
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        // إضافة timestamp للصورة أيضاً
        const templatePath = data.templatePath ? `${data.templatePath}?t=${Date.now()}` : null
        setCertificateTemplate(templatePath)
      }
    } catch (error) {
      console.error('Error fetching certificate template:', error)
    }
  }

  const handleCertificateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingCertificate(true)
    try {
      const formData = new FormData()
      formData.append('certificateTemplate', file)

      const response = await fetch(`/api/admin/hackathons/${params.id}/certificate-template`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        // إضافة timestamp لتجنب التخزين المؤقت
        const newTemplatePath = `${data.filePath}?t=${Date.now()}`
        setCertificateTemplate(newTemplatePath)
        showSuccess('تم رفع قالب الشهادة بنجاح!')

        // إعادة تحميل قالب الشهادة
        setTimeout(() => {
          fetchCertificateTemplate()
        }, 1000)

        // لا نحتاج لإعادة تحميل الصفحة - الصورة تم تحديثها بالفعل
      } else {
        const error = await response.json()
        showError(`خطأ في رفع قالب الشهادة: ${error.error}`)
      }
    } catch (error) {
      console.error('Error uploading certificate template:', error)
      showError('حدث خطأ في رفع قالب الشهادة')
    } finally {
      setUploadingCertificate(false)
    }
  }

  const handleRemoveCertificateTemplate = async () => {
    const confirmed = await showConfirm(
      'حذف قالب الشهادة',
      'هل أنت متأكد من حذف قالب الشهادة المخصص؟ سيتم استخدام القالب الافتراضي.'
    )

    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/hackathons/${params.id}/certificate-template`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCertificateTemplate(null)
        showSuccess('تم حذف قالب الشهادة بنجاح!')
      } else {
        const error = await response.json()
        showError(`خطأ في حذف قالب الشهادة: ${error.error}`)
      }
    } catch (error) {
      console.error('Error removing certificate template:', error)
      showError('حدث خطأ في حذف قالب الشهادة')
    }
  }

  // حساب الإحصائيات من بيانات الهاكاثون
  const stats = hackathon ? {
    totalParticipants: hackathon.participants?.length || 0,
    pendingParticipants: hackathon.participants?.filter(p => p.status === 'pending').length || 0,
    approvedParticipants: hackathon.participants?.filter(p => p.status === 'approved').length || 0,
    rejectedParticipants: hackathon.participants?.filter(p => p.status === 'rejected').length || 0,
    approvedWithoutTeam: hackathon.participants?.filter(p => p.status === 'approved' && !p.teamId).length || 0,
    approvedWithTeam: hackathon.participants?.filter(p => p.status === 'approved' && p.teamId).length || 0
  } : {
    totalParticipants: 0,
    pendingParticipants: 0,
    approvedParticipants: 0,
    rejectedParticipants: 0,
    approvedWithoutTeam: 0,
    approvedWithTeam: 0
  }

  const updateParticipantStatus = async (participantId: string, status: 'approved' | 'rejected', feedback?: string) => {
    try {
      const response = await fetch(`/api/admin/hackathons/${params.id}/participants/${participantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, feedback })
      })

      if (response.ok) {
        await refreshData() // Refresh data
        alert(`تم ${status === 'approved' ? 'قبول' : 'رفض'} المشارك بنجاح`)
      } else {
        alert(`فشل في ${status === 'approved' ? 'قبول' : 'رفض'} المشارك`)
      }
    } catch (error) {
      console.error('Error updating participant status:', error)
      alert('حدث خطأ في تحديث حالة المشارك')
    }
  }

  const bulkUpdateStatus = async (status: 'approved' | 'rejected') => {
    const pendingParticipants = filteredParticipants.filter(p => p.status === 'pending')
    const count = pendingParticipants.length

    if (count === 0) {
      alert('لا توجد مشاركين في الانتظار للتحديث')
      return
    }

    const action = status === 'approved' ? 'قبول' : 'رفض'
    const confirmMessage = `هل أنت متأكد من ${action} جميع المشاركين المفلترين؟\n\nسيتم ${action} ${count} مشارك`

    if (!confirm(confirmMessage)) return

    try {
      const participantIds = pendingParticipants.map(p => p.id)

      const response = await fetch(`/api/admin/hackathons/${params.id}/participants/bulk-update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantIds, status })
      })

      if (response.ok) {
        await refreshData() // Refresh data
        alert(`تم ${action} ${count} مشارك بنجاح`)
      } else {
        const error = await response.json()
        alert(error.error || `فشل في ${action} المشاركين`)
      }
    } catch (error) {
      console.error('Error bulk updating participants:', error)
      alert('حدث خطأ في تحديث حالة المشاركين')
    }
  }

  const updateTeamSettings = async (setting: string, value: any) => {
    try {
      const currentSettings = (hackathon?.settings as any) || {}
      const updatedSettings = {
        ...currentSettings,
        [setting]: value
      }

      const response = await fetch(`/api/admin/hackathons/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updatedSettings })
      })

      if (response.ok) {
        // Update local state
        setHackathon(prev => prev ? {
          ...prev,
          settings: updatedSettings
        } : null)

        // Show success message
        const settingNames: { [key: string]: string } = {
          maxTeamSize: 'حجم الفريق',
          allowIndividualParticipation: 'المشاركة الفردية'
        }
        alert(`✅ تم تحديث ${settingNames[setting] || setting} بنجاح`)
      } else {
        const error = await response.json()
        alert(`❌ خطأ في تحديث الإعداد: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating team settings:', error)
      alert('❌ حدث خطأ في تحديث الإعدادات')
    }
  }

  const previewTeamFormation = async () => {
    if (!hackathon || !hackathon.participants) {
      alert('لا توجد بيانات هاكاثون')
      return
    }

    const approvedParticipants = hackathon.participants.filter(p => p.status === 'approved' && !p.teamId) || []

    if (approvedParticipants.length === 0) {
      alert('لا توجد مشاركين مقبولين بدون فرق لتكوين فرق جديدة')
      return
    }

    // محاكاة تكوين الفرق محلياً
    const roleGroups: { [key: string]: any[] } = {}

    approvedParticipants.forEach(participant => {
      const role = participant.teamRole || participant.user.preferredRole || 'مطور'
      if (!roleGroups[role]) {
        roleGroups[role] = []
      }
      roleGroups[role].push(participant)
    })

    // إنشاء الفرق باستخدام حجم الفريق من إعدادات الهاكاثون
    const hackathonSettings = hackathon.settings as any
    const teamSize = hackathonSettings?.maxTeamSize || 4
    const numberOfTeams = Math.ceil(approvedParticipants.length / teamSize)
    const teams: any[] = []

    // تهيئة الفرق
    for (let i = 1; i <= numberOfTeams; i++) {
      teams.push({
        name: `الفريق ${i}`,
        members: []
      })
    }

    // توزيع المشاركين
    const roles = Object.keys(roleGroups)
    let currentTeamIndex = 0

    for (const role of roles) {
      const participants = [...roleGroups[role]]

      while (participants.length > 0) {
        const participant = participants.shift()!
        teams[currentTeamIndex].members.push(participant)
        currentTeamIndex = (currentTeamIndex + 1) % numberOfTeams
      }
    }

    setPreviewTeams(teams.filter(team => team.members.length > 0))
    setShowTeamPreview(true)
  }

  const createTeamsAutomatically = async () => {
    setCreatingTeams(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${params.id}/teams/auto-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const result = await response.json()
        setShowTeamPreview(false)
        await refreshData() // Refresh data
        alert(`تم تكوين الفرق بنجاح!\n\n${result.message}\n\nتم إنشاء: ${result.teamsCreated} فريق\nتم إرسال: ${result.emailsSent} إيميل`)
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في تكوين الفرق')
      }
    } catch (error) {
      console.error('Error creating teams:', error)
      alert('حدث خطأ في تكوين الفرق')
    } finally {
      setCreatingTeams(false)
    }
  }

  const deleteAllTeams = async () => {
    const confirmMessage = 'هل أنت متأكد من حذف جميع الفرق؟\n\nسيتم:\n- حذف جميع الفرق\n- إلغاء تعيين المشاركين\n\nهذا الإجراء لا يمكن التراجع عنه!'

    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch(`/api/admin/hackathons/${params.id}/teams`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        await refreshData() // Refresh data
        alert(`تم حذف الفرق بنجاح!\n\n${result.message}`)
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في حذف الفرق')
      }
    } catch (error) {
      console.error('Error deleting teams:', error)
      alert('حدث خطأ في حذف الفرق')
    }
  }

  const exportTeamsToExcel = async () => {
    if (!teams || teams.length === 0) {
      alert('لا توجد فرق للتصدير')
      return
    }

    try {
      // Prepare teams data
      const teamsData = teams.map(team => ({
        teamNumber: team.teamNumber,
        teamName: team.name,
        projectName: team.projectName || 'غير محدد',
        membersCount: team.participants?.length || 0,
        members: team.participants?.map(p => p.user.name).join(', ') || 'غير محدد',
        memberEmails: team.participants?.map(p => p.user.email).join(', ') || 'غير محدد',
        createdAt: team.createdAt
      }))

      // Prepare detailed members data
      const membersData = teams.flatMap(team =>
        team.participants?.map(participant => ({
          teamNumber: team.teamNumber,
          teamName: team.name,
          memberName: participant.user.name,
          memberEmail: participant.user.email,
          preferredRole: participant.user.preferredRole || 'غير محدد',
          joinedAt: participant.registeredAt
        })) || []
      )

      await ExcelExporter.exportMultipleSheets(`فرق_${hackathon?.title || 'الهاكاثون'}.xlsx`, [
        {
          name: 'الفرق',
          columns: [
            { key: 'teamNumber', header: 'رقم الفريق', width: 12, format: 'number' },
            { key: 'teamName', header: 'اسم الفريق', width: 20 },
            { key: 'projectName', header: 'اسم المشروع', width: 25 },
            { key: 'membersCount', header: 'عدد الأعضاء', width: 12, format: 'number' },
            { key: 'members', header: 'أعضاء الفريق', width: 40 },
            { key: 'memberEmails', header: 'بريد الأعضاء', width: 40 },
            { key: 'createdAt', header: 'تاريخ الإنشاء', width: 18, format: 'date' }
          ],
          data: teamsData
        },
        {
          name: 'تفاصيل الأعضاء',
          columns: [
            { key: 'teamNumber', header: 'رقم الفريق', width: 12, format: 'number' },
            { key: 'teamName', header: 'اسم الفريق', width: 20 },
            { key: 'memberName', header: 'اسم العضو', width: 20 },
            { key: 'memberEmail', header: 'البريد الإلكتروني', width: 25 },
            { key: 'preferredRole', header: 'الدور المفضل', width: 20 },
            { key: 'joinedAt', header: 'تاريخ الانضمام', width: 18, format: 'date' }
          ],
          data: membersData
        }
      ])
    } catch (error) {
      console.error('Error exporting teams:', error)
      alert('حدث خطأ في تصدير البيانات')
    }
  }

  const sendNotification = async (targetAudience: string) => {
    const subject = prompt('عنوان الإشعار:')
    if (!subject) return

    const message = prompt('نص الإشعار:')
    if (!message) return

    let filters = {}
    if (targetAudience === 'city') {
      const city = prompt('اسم المدينة:')
      if (!city) return
      filters = { city }
    } else if (targetAudience === 'nationality') {
      const nationality = prompt('الجنسية:')
      if (!nationality) return
      filters = { nationality }
    }

    try {
      const response = await fetch(`/api/admin/hackathons/${params.id}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetAudience,
          filters,
          subject,
          message,
          includeHackathonDetails: true
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في إرسال الإشعارات')
      }
    } catch (error) {
      console.error('Error sending notifications:', error)
      alert('حدث خطأ في إرسال الإشعارات')
    }
  }

  const toggleHackathonStatus = async () => {
    const newStatus = hackathon?.status === 'draft' ? 'open' :
                     hackathon?.status === 'open' ? 'closed' : 'open'

    const confirmMessage = `هل أنت متأكد من تغيير حالة الهاكاثون إلى "${
      newStatus === 'open' ? 'مفتوح' :
      newStatus === 'closed' ? 'مغلق' : 'مسودة'
    }"؟`

    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch(`/api/admin/hackathons/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchHackathon() // Refresh data
        alert('تم تحديث حالة الهاكاثون بنجاح')
      } else {
        alert('فشل في تحديث حالة الهاكاثون')
      }
    } catch (error) {
      console.error('Error updating hackathon status:', error)
      alert('حدث خطأ في تحديث حالة الهاكاثون')
    }
  }

  const togglePin = async () => {
    const newPinStatus = !hackathon?.isPinned
    const confirmMessage = newPinStatus
      ? 'هل تريد تثبيت هذا الهاكاثون في الصفحة الرئيسية؟ (سيتم إلغاء تثبيت أي هاكاثون آخر)'
      : 'هل تريد إلغاء تثبيت هذا الهاكاثون من الصفحة الرئيسية؟'

    showConfirm(
      confirmMessage,
      async () => {
        try {
          console.log('🔄 Toggling pin status:', { hackathonId: params.id, newPinStatus })

          const response = await fetch(`/api/admin/hackathons/${params.id}/pin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPinned: newPinStatus })
          })

          const data = await response.json()
          console.log('📌 Pin response:', data)

          if (response.ok) {
            // Update local state immediately
            if (hackathon) {
              setHackathon({ ...hackathon, isPinned: newPinStatus })
            }

            // Also refresh data from server
            fetchHackathon()

            showSuccess(newPinStatus ? 'تم تثبيت الهاكاثون في الصفحة الرئيسية' : 'تم إلغاء تثبيت الهاكاثون')
          } else {
            console.error('❌ Pin toggle failed:', data)
            showError(`فشل في تحديث حالة التثبيت: ${data.error || 'خطأ غير معروف'}`)
          }
        } catch (error) {
          console.error('❌ Error updating pin status:', error)
          showError('حدث خطأ في تحديث حالة التثبيت')
        }
      },
      newPinStatus ? '📌 تثبيت الهاكاثون' : '📍 إلغاء التثبيت',
      newPinStatus ? 'تثبيت' : 'إلغاء التثبيت',
      'إلغاء',
      'info'
    )
  }

  const deleteHackathon = async () => {
    const confirmMessage = `هل أنت متأكد من حذف الهاكاثون "${hackathon?.title}"؟\n\nسيتم حذف جميع البيانات المرتبطة به:\n- جميع المشاركين (${stats.totalParticipants})\n- جميع الفرق\n- جميع التقييمات\n\nهذا الإجراء لا يمكن التراجع عنه!`

    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch(`/api/admin/hackathons/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        alert(`تم حذف الهاكاثون بنجاح!\n\nتم حذف:\n- ${result.deletedData.participants} مشارك\n- ${result.deletedData.teams} فريق\n- ${result.deletedData.judges} محكم\n- ${result.deletedData.scores} تقييم`)
        router.push('/admin/hackathons') // Redirect to hackathons list
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في حذف الهاكاثون')
      }
    } catch (error) {
      console.error('Error deleting hackathon:', error)
      alert('حدث خطأ في حذف الهاكاثون')
    }
  }

  const filteredParticipants = hackathon?.participants.filter(participant => {
    // Status filter
    if (filter !== 'all' && participant.status.toLowerCase() !== filter) return false

    // City filter
    if (cityFilter && cityFilter !== 'all' && (!participant.user.city || !participant.user.city.toLowerCase().includes(cityFilter.toLowerCase()))) return false

    // Nationality filter
    if (nationalityFilter && nationalityFilter !== 'all' && (!participant.user.nationality || !participant.user.nationality.toLowerCase().includes(nationalityFilter.toLowerCase()))) return false

    return true
  }) || []

  

  // Get unique cities and nationalities for filters
  const uniqueCities = [...new Set(
    hackathon?.participants
      .map(p => p.user.city)
      .filter(city => city && city.trim() !== '') || []
  )]
  const uniqueNationalities = [...new Set(
    hackathon?.participants
      .map(p => p.user.nationality)
      .filter(nationality => nationality && nationality.trim() !== '') || []
  )]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#01645e] font-semibold">جاري تحميل بيانات الهاكاثون...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-[#01645e] mb-4">الهاكاثون غير موجود</h1>
            <Link href="/admin/hackathons">
              <Button>العودة إلى قائمة الهاكاثونات</Button>
            </Link>
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
          className="flex items-center gap-4 mb-8"
        >
          <Link href="/admin/hackathons">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-[#01645e]">{hackathon.title}</h1>
            <p className="text-[#8b7632] text-lg">{hackathon.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/admin/hackathons/${hackathon.id}/register-form-design`}>
              <Button variant="outline" size="sm" className="border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white">
                <FormInput className="w-4 h-4 ml-2" />
                تصميم الفورم
              </Button>
            </Link>
            <Link href={`/admin/hackathons/${hackathon.id}/landing-page`}>
              <Button variant="outline" size="sm" className="border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white">
                <Palette className="w-4 h-4 ml-2" />
                Landing Page
              </Button>
            </Link>
            <Badge className={`${
              hackathon.status === 'open' ? 'bg-green-500' :
              hackathon.status === 'closed' ? 'bg-red-500' :
              hackathon.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
            } text-white`}>
              {hackathon.status === 'open' ? 'مفتوح' :
               hackathon.status === 'closed' ? 'مغلق' :
               hackathon.status === 'completed' ? 'مكتمل' : 'مسودة'}
            </Badge>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'إجمالي المتقدمين', value: stats.totalParticipants, icon: Users, color: 'from-[#01645e] to-[#3ab666]' },
            { title: 'في انتظار المراجعة', value: stats.pendingParticipants, icon: Eye, color: 'from-[#8b7632] to-[#c3e956]' },
            { title: 'مقبول', value: stats.approvedParticipants, icon: UserCheck, color: 'from-[#3ab666] to-[#c3e956]' },
            { title: 'مرفوض', value: stats.rejectedParticipants, icon: UserX, color: 'from-red-500 to-red-600' }
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
                      <p className="text-sm font-medium text-[#8b7632] mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-[#01645e]">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Management Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="participants" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="participants">المتقدمين</TabsTrigger>
              <TabsTrigger value="teams">الفرق</TabsTrigger>
              <TabsTrigger value="evaluation">التقييم</TabsTrigger>
              <TabsTrigger value="settings">الإعدادات</TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="space-y-6">
              {/* Participants Import */}
              <ParticipantsImport
                hackathonId={hackathon.id}
                onImportComplete={() => {
                  fetchHackathon() // Refresh hackathon data which includes participants
                }}
              />

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl text-[#01645e]">إدارة المتقدمين</CardTitle>
                      <CardDescription>مراجعة وقبول أو رفض المتقدمين مع إمكانية التصفية</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex gap-2">
                      <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                      >
                        الكل ({stats.totalParticipants})
                      </Button>
                      <Button
                        variant={filter === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('pending')}
                      >
                        في الانتظار ({stats.pendingParticipants})
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={filter === 'approved' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('approved')}
                      >
                        مقبول ({stats.approvedParticipants})
                      </Button>
                      <Button
                        variant={filter === 'rejected' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('rejected')}
                      >
                        مرفوض ({stats.rejectedParticipants})
                      </Button>
                    </div>
                    <div>
                      <Label htmlFor="cityFilter" className="text-sm">تصفية حسب المدينة</Label>
                      <Select value={cityFilter} onValueChange={setCityFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="جميع المدن" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع المدن</SelectItem>
                          {uniqueCities.map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="nationalityFilter" className="text-sm">تصفية حسب الجنسية</Label>
                      <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="جميع الجنسيات" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الجنسيات</SelectItem>
                          {uniqueNationalities.map(nationality => (
                            <SelectItem key={nationality} value={nationality}>{nationality}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {filteredParticipants.filter(p => p.status === 'pending').length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-[#01645e] mb-1">إجراءات جماعية</h3>
                          <p className="text-sm text-[#8b7632]">
                            {filteredParticipants.filter(p => p.status === 'pending').length} مشارك في الانتظار من النتائج المفلترة
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => bulkUpdateStatus('approved')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <UserCheck className="w-4 h-4 ml-1" />
                            قبول الكل ({filteredParticipants.filter(p => p.status === 'pending').length})
                          </Button>
                          <Button
                            onClick={() => bulkUpdateStatus('rejected')}
                            variant="outline"
                            className="text-red-600 hover:text-red-700 border-red-600"
                          >
                            <UserX className="w-4 h-4 ml-1" />
                            رفض الكل
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Participants List */}
                  {filteredParticipants.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold text-[#01645e] mb-2">لا توجد نتائج</h3>
                      <p className="text-[#8b7632]">لا توجد متقدمين يطابقون المرشحات المحددة</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredParticipants.map((participant) => (
                        <div key={participant.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-[#01645e]">{participant.user.name}</h3>
                                <Badge className={`${
                                  participant.status === 'approved' ? 'bg-green-500' :
                                  participant.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                                } text-white`}>
                                  {participant.status === 'approved' ? 'مقبول' :
                                   participant.status === 'rejected' ? 'مرفوض' : 'في الانتظار'}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                                <div>
                                  <span className="font-semibold text-[#01645e]">البريد الإلكتروني:</span>
                                  <br />
                                  {participant.user.email}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-[#3ab666]" />
                                  <span className="font-semibold text-[#01645e]">المدينة:</span>
                                  <br />
                                  {participant.user.city}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Flag className="w-4 h-4 text-[#3ab666]" />
                                  <span className="font-semibold text-[#01645e]">الجنسية:</span>
                                  <br />
                                  {participant.user.nationality}
                                </div>
                                <div>
                                  <span className="font-semibold text-[#01645e]">الدور المفضل:</span>
                                  <br />
                                  {participant.teamRole || 'غير محدد'}
                                </div>
                              </div>

                              {participant.teamName && (
                                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-semibold text-[#01645e]">اسم الفريق:</span>
                                      <br />
                                      {participant.teamName}
                                    </div>
                                    {participant.projectTitle && (
                                      <div>
                                        <span className="font-semibold text-[#01645e]">عنوان المشروع:</span>
                                        <br />
                                        {participant.projectTitle}
                                      </div>
                                    )}
                                  </div>
                                  {participant.projectDescription && (
                                    <div className="mt-2">
                                      <span className="font-semibold text-[#01645e]">وصف المشروع:</span>
                                      <br />
                                      <p className="text-sm text-gray-600 mt-1">{participant.projectDescription}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {participant.status === 'pending' && (
                              <div className="flex gap-2 mr-4">
                                <Button
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                  onClick={() => updateParticipantStatus(participant.id, 'approved')}
                                >
                                  <UserCheck className="w-4 h-4 ml-1" />
                                  قبول
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 border-red-600"
                                  onClick={() => updateParticipantStatus(participant.id, 'rejected')}
                                >
                                  <UserX className="w-4 h-4 ml-1" />
                                  رفض
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teams">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-[#01645e]">إدارة الفرق</CardTitle>
                  <CardDescription>تكوين الفرق تلقائياً وإدارة الأعضاء</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Team Formation Controls */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-[#01645e] mb-1">تكوين الفرق التلقائي</h3>
                          <p className="text-sm text-[#8b7632] mb-2">
                            سيتم تجميع المشاركين المقبولين في فرق متنوعة حسب الأدوار المفضلة
                          </p>
                          <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            📊 حجم الفريق المحدد: {(hackathon?.settings as any)?.maxTeamSize || 4} أشخاص لكل فريق
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {hasExistingTeams && (
                            <>
                              <Button
                                onClick={exportTeamsToExcel}
                                variant="outline"
                                className="border-[#3ab666] text-[#3ab666] hover:bg-[#3ab666] hover:text-white"
                              >
                                <Download className="w-4 h-4 ml-1" />
                                تصدير Excel ({teams?.length || 0})
                              </Button>
                              <Button
                                onClick={deleteAllTeams}
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <Trash2 className="w-4 h-4 ml-1" />
                                حذف جميع الفرق
                              </Button>
                            </>
                          )}
                          <Button
                            onClick={previewTeamFormation}
                            className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white"
                            disabled={!hackathon || stats.approvedWithoutTeam === 0}
                          >
                            <Users className="w-4 h-4 ml-1" />
                            تكوين الفرق ({stats.approvedWithoutTeam} مشارك بدون فريق)
                          </Button>
                        </div>
                      </div>

                      {stats.approvedWithoutTeam === 0 && stats.approvedParticipants === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-yellow-800 text-sm">
                            ⚠️ لا توجد مشاركين مقبولين لتكوين الفرق. يجب قبول المشاركين أولاً.
                          </p>
                        </div>
                      )}

                      {stats.approvedWithoutTeam === 0 && stats.approvedParticipants > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-green-800 text-sm">
                            ✅ جميع المشاركين المقبولين ({stats.approvedParticipants}) تم تعيينهم لفرق بالفعل.
                          </p>
                        </div>
                      )}

                      {stats.approvedWithoutTeam > 0 && stats.approvedWithTeam > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-blue-800 text-sm">
                            ℹ️ يوجد {stats.approvedWithTeam} مشارك في فرق و {stats.approvedWithoutTeam} مشارك بدون فريق.
                            سيتم تكوين فرق جديدة للمشاركين بدون فرق.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Teams Display */}
                    <TeamsDisplay hackathonId={params.id as string} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evaluation">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-[#01645e]">نظام التقييم</CardTitle>
                  <CardDescription>إدارة معايير التقييم والنتائج</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Evaluation Control */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-[#01645e] mb-4">إدارة التقييم</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#8b7632] mb-2">
                            {hackathon?.evaluationOpen ?
                              '🟢 التقييم مفتوح - المحكمون يمكنهم تقييم الفرق الآن' :
                              '🔴 التقييم مغلق - المحكمون لا يمكنهم الوصول للتقييم'
                            }
                          </p>
                          <p className="text-xs text-gray-600">
                            تأكد من رفع جميع الفرق لعروضهم التقديمية قبل فتح التقييم
                          </p>
                        </div>
                        <Button
                          onClick={() => toggleEvaluation()}
                          className={`${hackathon?.evaluationOpen ?
                            'bg-red-500 hover:bg-red-600' :
                            'bg-green-500 hover:bg-green-600'
                          } text-white`}
                        >
                          {hackathon?.evaluationOpen ? 'إغلاق التقييم' : 'فتح التقييم'}
                        </Button>
                      </div>
                    </div>

                    {/* Project Submission Emails */}
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-[#01645e] mb-4">إرسال إيميلات رفع المشاريع</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#8b7632] mb-2">
                            📧 إرسال إيميل لجميع أعضاء الفرق لتذكيرهم برفع العروض التقديمية
                          </p>
                          <p className="text-xs text-gray-600">
                            سيتم إرسال إيميل لكل عضو في الفرق المكونة مع رابط لوحة التحكم
                          </p>
                        </div>
                        <Button
                          onClick={sendProjectEmails}
                          disabled={sendingEmails}
                          className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                        >
                          {sendingEmails ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin ml-2" />
                              جاري الإرسال...
                            </>
                          ) : (
                            <>
                              📧 إرسال إيميلات المشاريع
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* View Evaluation Results */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-[#01645e] mb-4">عرض نتائج التقييم</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#8b7632] mb-2">
                            📊 عرض تفصيلي لجميع التقييمات والنتائج مع ترتيب الفرق
                          </p>
                          <p className="text-xs text-gray-600">
                            يمكنك مراجعة تقييمات المحكمين والنتائج النهائية لكل فريق
                          </p>
                        </div>
                        <a
                          href={`/admin/hackathons/${params.id}/evaluations`}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          📊 عرض النتائج
                        </a>
                      </div>
                    </div>

                    {/* Add New Criterion */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-[#01645e] mb-4">إضافة معيار تقييم جديد</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <Label htmlFor="criterionName">اسم المعيار *</Label>
                          <Input
                            id="criterionName"
                            value={newCriterion.name}
                            onChange={(e) => setNewCriterion({...newCriterion, name: e.target.value})}
                            placeholder="مثال: الإبداع والابتكار"
                          />
                        </div>
                        <div>
                          <Label htmlFor="criterionDescription">الوصف</Label>
                          <Input
                            id="criterionDescription"
                            value={newCriterion.description}
                            onChange={(e) => setNewCriterion({...newCriterion, description: e.target.value})}
                            placeholder="وصف المعيار..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxScore">الدرجة القصوى</Label>
                          <Input
                            id="maxScore"
                            type="number"
                            min="1"
                            max="100"
                            value={newCriterion.maxScore}
                            onChange={(e) => setNewCriterion({...newCriterion, maxScore: parseInt(e.target.value) || 10})}
                          />
                        </div>
                      </div>
                      <Button onClick={addEvaluationCriterion} className="bg-gradient-to-r from-[#01645e] to-[#3ab666]">
                        <Trophy className="w-4 h-4 ml-2" />
                        إضافة المعيار
                      </Button>
                    </div>

                    {/* Existing Criteria */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#01645e] mb-4">
                        معايير التقييم الحالية ({evaluationCriteria.length})
                      </h3>

                      {evaluationCriteria.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500">لا توجد معايير تقييم. أضف المعيار الأول!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {evaluationCriteria.map((criterion, index) => (
                            <div key={criterion.id} className="border rounded-lg p-4 bg-white">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-[#01645e]">{criterion.name}</h4>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-[#3ab666] text-white">
                                    {criterion.maxScore} نقطة
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteEvaluationCriterion(criterion.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              {criterion.description && (
                                <p className="text-sm text-[#8b7632]">{criterion.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {evaluationCriteria.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800 text-sm">
                          ✅ تم إعداد {evaluationCriteria.length} معيار تقييم.
                          إجمالي الدرجات: {evaluationCriteria.reduce((sum, c) => sum + c.maxScore, 0)} نقطة
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-[#01645e]">إعدادات الهاكاثون</CardTitle>
                  <CardDescription>تعديل إعدادات وإرسال إشعارات</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Feedback Form Section */}
                  <div className="border rounded-lg p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      فورم تقييم الهاكاثون
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        onClick={() => router.push(`/admin/feedback-form-design/${hackathon?.id}`)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        <Palette className="w-4 h-4 ml-2" />
                        تخصيص فورم التقييم
                      </Button>
                      <Button
                        onClick={() => router.push(`/admin/feedback-results/${hackathon?.id}`)}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                      >
                        <BarChart3 className="w-4 h-4 ml-2" />
                        عرض نتائج التقييمات
                      </Button>
                    </div>
                    <div className="mt-4 p-4 bg-purple-100 border border-purple-200 rounded-lg">
                      <p className="text-purple-700 text-sm">
                        ⭐ يمكنك تخصيص فورم التقييم وإرسال روابطه للمشاركين من صفحة "إرسال النتائج"
                      </p>
                    </div>
                  </div>

                  {/* Notification Section */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#01645e] mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      إرسال إشعارات
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        onClick={() => sendNotification('all')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        إشعار جميع المستخدمين
                      </Button>
                      <Button
                        onClick={() => sendNotification('approved')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        إشعار المشاركين المقبولين
                      </Button>
                      <Button
                        onClick={() => sendNotification('city')}
                        variant="outline"
                      >
                        إشعار حسب المدينة
                      </Button>
                      <Button
                        onClick={() => sendNotification('nationality')}
                        variant="outline"
                      >
                        إشعار حسب الجنسية
                      </Button>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-700 text-sm">
                        💡 يمكنك إرسال إشعارات مخصصة للمستخدمين لدعوتهم للمشاركة أو إعلامهم بالتحديثات
                      </p>
                    </div>
                  </div>

                  {/* Team Settings */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#01645e] mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      إعدادات الفرق
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-[#01645e] mb-2">حجم الفريق للتعيين التلقائي</h4>
                          <div className="flex items-center gap-3">
                            <Input
                              type="number"
                              min="2"
                              max="10"
                              value={(hackathon?.settings as any)?.maxTeamSize || 4}
                              onChange={(e) => updateTeamSettings('maxTeamSize', parseInt(e.target.value) || 4)}
                              className="w-20"
                            />
                            <span className="text-sm text-[#8b7632]">أشخاص لكل فريق</span>
                          </div>
                          <p className="text-xs text-blue-600 mt-2">
                            يحدد عدد الأشخاص في كل فريق عند استخدام التعيين التلقائي
                          </p>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-[#01645e] mb-2">المشاركة الفردية</h4>
                          <div className="flex items-center gap-3">
                            <Select
                              value={((hackathon?.settings as any)?.allowIndividualParticipation ?? true).toString()}
                              onValueChange={(value) => updateTeamSettings('allowIndividualParticipation', value === 'true')}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">مسموحة</SelectItem>
                                <SelectItem value="false">غير مسموحة</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <p className="text-xs text-green-600 mt-2">
                            السماح للمشاركين بالتسجيل بدون فريق
                          </p>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-700 text-sm">
                          ⚠️ <strong>تنبيه:</strong> تغيير حجم الفريق سيؤثر على التعيين التلقائي الجديد فقط.
                          الفرق الموجودة حالياً لن تتأثر.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hackathon Settings */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#01645e] mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      إعدادات الهاكاثون
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-[#01645e]">حالة الهاكاثون</h4>
                          <p className="text-sm text-[#8b7632]">تغيير حالة الهاكاثون (مسودة/مفتوح/مغلق)</p>
                        </div>
                        <Button
                          onClick={() => toggleHackathonStatus()}
                          variant="outline"
                        >
                          {hackathon.status === 'draft' ? 'نشر الهاكاثون' :
                           hackathon.status === 'open' ? 'إغلاق التسجيل' : 'إعادة فتح'}
                        </Button>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                        <div>
                          <h4 className="font-semibold text-[#01645e] mb-2">تعديل التفاصيل</h4>
                          <p className="text-sm text-[#8b7632]">تعديل معلومات الهاكاثون والمواعيد</p>
                        </div>
                        
                        {/* Primary Actions */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={togglePin}
                            variant="outline"
                            className={`${hackathon.isPinned
                              ? 'border-red-500 text-red-600 hover:bg-red-500 hover:text-white'
                              : 'border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white'
                            }`}
                          >
                            {hackathon.isPinned ? <PinOff className="w-4 h-4 ml-2" /> : <Pin className="w-4 h-4 ml-2" />}
                            {hackathon.isPinned ? 'إلغاء التثبيت' : 'تثبيت في الرئيسية'}
                          </Button>
                          <Link href={`/admin/hackathons/${hackathon.id}/notify`}>
                            <Button variant="outline" className="border-[#3ab666] text-[#3ab666] hover:bg-[#3ab666] hover:text-white">
                              <Mail className="w-4 h-4 ml-2" />
                              إرسال إشعارات
                            </Button>
                          </Link>
                          <Link href={`/admin/hackathons/${hackathon.id}/edit`}>
                            <Button className="bg-gradient-to-r from-[#01645e] to-[#3ab666]">
                              تعديل الهاكاثون
                            </Button>
                          </Link>
                        </div>

                        {/* Form Management */}
                        <div>
                          <h5 className="font-medium text-[#01645e] mb-2 text-sm">إدارة النماذج والتسجيل</h5>
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/admin/hackathons/${hackathon.id}/registration-form`}>
                              <Button variant="outline" className="border-[#01645e] text-[#01645e] hover:bg-[#01645e] hover:text-white">
                                <FormInput className="w-4 h-4 ml-2" />
                                نموذج التسجيل الديناميكي
                              </Button>
                            </Link>
                            <Link href={`/admin/hackathons/${hackathon.id}/form-submissions`}>
                              <Button variant="outline" className="border-[#3ab666] text-[#3ab666] hover:bg-[#3ab666] hover:text-white">
                                <FileText className="w-4 h-4 ml-2" />
                                النماذج المرسلة
                              </Button>
                            </Link>
                            <Link href={`/admin/hackathons/${hackathon.id}/landing-page`}>
                              <Button variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white">
                                <Palette className="w-4 h-4 ml-2" />
                                Landing Page مخصصة
                              </Button>
                            </Link>
                            <Link href={`/admin/hackathons/${hackathon.id}/register-form-design`}>
                              <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white">
                                <FormInput className="w-4 h-4 ml-2" />
                                تصميم فورم التسجيل
                              </Button>
                            </Link>
                            <Link href={`/admin/hackathons/${hackathon.id}/custom-fields`}>
                              <Button variant="outline" className="border-[#01645e] text-[#01645e] hover:bg-[#01645e] hover:text-white">
                                <Settings className="w-4 h-4 ml-2" />
                                النماذج المخصصة
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Communication & Templates */}
                        <div>
                          <h5 className="font-medium text-[#01645e] mb-2 text-sm">الاتصالات والقوالب</h5>
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/admin/hackathons/${hackathon.id}/email-templates`}>
                              <Button variant="outline" className="border-[#c3e956] text-[#8b7632] hover:bg-[#c3e956] hover:text-[#01645e]">
                                <Mail className="w-4 h-4 ml-2" />
                                إدارة الإيميلات
                              </Button>
                            </Link>
                            <Link href={`/admin/hackathons/${hackathon.id}/file-tracking`}>
                              <Button variant="outline" className="border-[#3ab666] text-[#3ab666] hover:bg-[#3ab666] hover:text-white">
                                <FileText className="w-4 h-4 ml-2" />
                                تتبع الملفات
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Advanced Settings */}
                        <div>
                          <h5 className="font-medium text-[#01645e] mb-2 text-sm">الإعدادات المتقدمة</h5>
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/admin/hackathons/${hackathon.id}/judge-settings`}>
                              <Button variant="outline" className="border-[#8b7632] text-[#8b7632] hover:bg-[#8b7632] hover:text-white">
                                <Settings className="w-4 h-4 ml-2" />
                                إعدادات المحكم
                              </Button>
                            </Link>
                            <Link href={`/admin/hackathons/${hackathon.id}/bulk-upload`}>
                              <Button variant="outline" className="border-[#8b7632] text-[#8b7632] hover:bg-[#8b7632] hover:text-white">
                                <Upload className="w-4 h-4 ml-2" />
                                رفع بيانات مجمعة
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Supervisors Management */}
                        <div>
                          <h5 className="font-medium text-[#01645e] mb-2 text-sm">إدارة المشرفين</h5>
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/admin/admin-applications`}>
                              <Button variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white">
                                <Users className="w-4 h-4 ml-2" />
                                طلبات المشرفين
                              </Button>
                            </Link>
                            <Link href={`/admin/admin-form-design/${hackathon.id}`}>
                              <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white">
                                <Palette className="w-4 h-4 ml-2" />
                                تصميم فورم المشرفين
                              </Button>
                            </Link>
                            <a
                              href={`/admin/apply/${hackathon.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white">
                                <ExternalLink className="w-4 h-4 ml-2" />
                                معاينة فورم المشرفين
                              </Button>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Certificate Template Section */}
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                              <FileText className="w-5 h-5" />
                              قالب الشهادة المخصص
                            </h4>
                            <p className="text-sm text-blue-600">رفع قالب شهادة مخصص لهذا الهاكاثون</p>
                          </div>
                        </div>

                        {certificateTemplate ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={certificateTemplate}
                                alt="قالب الشهادة"
                                className="w-32 h-20 object-cover rounded-lg border"
                              />
                              <div className="flex-1">
                                <p className="text-sm text-green-600 font-medium">✅ تم رفع قالب مخصص</p>
                                <p className="text-xs text-gray-500">سيتم استخدام هذا القالب لجميع شهادات هذا الهاكاثون</p>
                              </div>
                              <Button
                                onClick={handleRemoveCertificateTemplate}
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                حذف القالب
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
                              <FileText className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                              <p className="text-blue-600 font-medium mb-2">لا يوجد قالب مخصص</p>
                              <p className="text-sm text-blue-500 mb-4">سيتم استخدام القالب الافتراضي</p>

                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleCertificateUpload}
                                  className="hidden"
                                  disabled={uploadingCertificate}
                                />
                                <Button
                                  as="span"
                                  disabled={uploadingCertificate}
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                >
                                  {uploadingCertificate ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin ml-2" />
                                      جاري الرفع...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4 ml-2" />
                                      رفع قالب مخصص
                                    </>
                                  )}
                                </Button>
                              </label>
                            </div>
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>• يجب أن يكون الملف صورة (JPG, PNG, WebP)</p>
                              <p>• الحد الأقصى لحجم الملف: 5 ميجابايت</p>
                              <p>• الأبعاد المقترحة: 1920x1080 بكسل أو أكبر</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                        <div>
                          <h4 className="font-semibold text-red-800">حذف الهاكاثون</h4>
                          <p className="text-sm text-red-600">حذف الهاكاثون نهائياً مع جميع البيانات المرتبطة به</p>
                        </div>
                        <Button
                          onClick={deleteHackathon}
                          variant="outline"
                          className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 ml-2" />
                          حذف الهاكاثون
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Team Preview Modal */}
      {showTeamPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#01645e]">معاينة تكوين الفرق</h2>
                  <p className="text-[#8b7632] mt-1">
                    سيتم إنشاء {previewTeams.length} فريق مع {previewTeams.reduce((total, team) => total + team.members.length, 0)} مشارك
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowTeamPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  إلغاء
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {previewTeams.map((team, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-green-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-[#01645e] text-lg">{team.name}</h3>
                      <Badge className="bg-[#3ab666] text-white">
                        {team.members.length} أعضاء
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {team.members.map((member: any, memberIndex: number) => (
                        <div key={memberIndex} className="flex items-center gap-3 p-2 bg-white rounded-lg border">
                          <div className="w-8 h-8 bg-[#01645e] text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {member.user.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-[#01645e] truncate">
                              {member.user.name}
                            </p>
                            <p className="text-xs text-[#8b7632] truncate">
                              {member.teamRole || member.user.preferredRole || 'مطور'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#8b7632]">
                  ⚠️ سيتم إرسال إيميلات لجميع المشاركين بتفاصيل فرقهم
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowTeamPreview(false)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={createTeamsAutomatically}
                    disabled={creatingTeams}
                    className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white"
                  >
                    {creatingTeams ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin ml-2" />
                        جاري التكوين...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 ml-2" />
                        تأكيد تكوين الفرق
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Components */}
      <ModalComponents />
    </div>
  )
}
