"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Filter, Settings, FileText, Trophy, Eye, UserCheck, UserX, MapPin, Flag, Mail, Trash2, Pin, PinOff, Upload, Download, FormInput, Palette, Star, BarChart3, ExternalLink, Award, Shuffle, AlertCircle, Shield, Send, Plus, Crown, RefreshCw, GripVertical, Phone, User } from 'lucide-react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExcelExporter } from '@/lib/excel-export'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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

interface SupervisorPermissions {
  canManageParticipants: boolean
  canApproveParticipants: boolean
  canRejectParticipants: boolean
  canManageTeams: boolean
  canMoveMembers: boolean
  canRemoveMembers: boolean
  canViewReports: boolean
  canExportData: boolean
  canSendMessages: boolean
}

export default function SupervisorHackathonManagementPage() {
  const params = useParams()
  const router = useRouter()
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [permissions, setPermissions] = useState<SupervisorPermissions>({
    canManageParticipants: true,
    canApproveParticipants: true,
    canRejectParticipants: true,
    canManageTeams: true,
    canMoveMembers: true,
    canRemoveMembers: true,
    canViewReports: true,
    canExportData: true,
    canSendMessages: true
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [nationalityFilter, setNationalityFilter] = useState<string>('all')
  const [teams, setTeams] = useState<any[]>([])
  const [creatingTeams, setCreatingTeams] = useState(false)
  const [hasExistingTeams, setHasExistingTeams] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [participantDetails, setParticipantDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [exportingExcel, setExportingExcel] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [memberDetailsDialogOpen, setMemberDetailsDialogOpen] = useState(false)
  const [draggedMember, setDraggedMember] = useState<{ participantId: string; sourceTeamId: string; memberName: string } | null>(null)
  const [newTeamDialogOpen, setNewTeamDialogOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [creatingNewTeam, setCreatingNewTeam] = useState(false)
  const [teamError, setTeamError] = useState("")
  const [teamSuccess, setTeamSuccess] = useState("")

  const stats = hackathon?.stats || {
    totalParticipants: 0,
    pendingParticipants: 0,
    approvedParticipants: 0,
    rejectedParticipants: 0
  }

  useEffect(() => {
    fetchHackathon()
    checkExistingTeams()
  }, [params.id])

  const fetchHackathon = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/supervisor/hackathons/${params.id}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch hackathon')
      }

      const data = await response.json()
      setHackathon(data.hackathon)
      setPermissions(data.permissions || permissions)
    } catch (error) {
      console.error('Error fetching hackathon:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkExistingTeams = async () => {
    try {
      const response = await fetch(`/api/supervisor/hackathons/${params.id}/teams`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setTeams(data.teams || [])
        setHasExistingTeams(data.teams && data.teams.length > 0)
      }
    } catch (error) {
      console.error('Error checking teams:', error)
    }
  }

  const handleAutoCreateTeams = async () => {
    if (!confirm(`هل أنت متأكد من تكوين الفرق تلقائياً؟\n\nسيتم توزيع المشاركين المقبولين (${stats.approvedParticipants}) على فرق متوازنة.`)) {
      return
    }

    setCreatingTeams(true)
    try {
      const response = await fetch(`/api/supervisor/hackathons/${params.id}/teams/auto-create`, {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ تم تكوين الفرق بنجاح!\n\nعدد الفرق المنشأة: ${data.teams.length}\nعدد الأعضاء: ${data.totalMembers}`)
        await fetchHackathon()
        await checkExistingTeams()
      } else {
        alert(`❌ خطأ: ${data.error}`)
      }
    } catch (error) {
      alert("حدث خطأ في تكوين الفرق")
    } finally {
      setCreatingTeams(false)
    }
  }

  const updateParticipantStatus = async (participantId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/supervisor/participants/${participantId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      })

      if (response.ok) {
        alert(`تم ${status === 'approved' ? 'قبول' : 'رفض'} المشارك بنجاح`)
        fetchHackathon()
      } else {
        alert('فشل في تحديث حالة المشارك')
      }
    } catch (error) {
      console.error('Error updating participant status:', error)
      alert('حدث خطأ في تحديث حالة المشارك')
    }
  }

  const bulkUpdateStatus = async (status: 'approved' | 'rejected') => {
    const pendingParticipants = filteredParticipants.filter(p => p.status === 'pending')

    if (pendingParticipants.length === 0) {
      alert('لا يوجد مشاركين في الانتظار')
      return
    }

    const confirmMessage = `هل أنت متأكد من ${status === 'approved' ? 'قبول' : 'رفض'} ${pendingParticipants.length} مشارك؟`
    if (!confirm(confirmMessage)) return

    try {
      const participantIds = pendingParticipants.map(p => p.id)
      const response = await fetch(`/api/admin/hackathons/${params.id}/participants/bulk-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantIds, status }),
        credentials: 'include'
      })

      if (response.ok) {
        alert(`تم ${status === 'approved' ? 'قبول' : 'رفض'} ${pendingParticipants.length} مشارك بنجاح`)
        fetchHackathon()
      } else {
        alert('فشل في تحديث حالة المشاركين')
      }
    } catch (error) {
      console.error('Error bulk updating participants:', error)
      alert('حدث خطأ في تحديث حالة المشاركين')
    }
  }

  const loadParticipantDetails = async (participantId: string) => {
    setLoadingDetails(true)
    setDetailsDialogOpen(true)
    try {
      const response = await fetch(`/api/supervisor/participants/${participantId}/details`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setParticipantDetails(data.participant)
      } else {
        alert('فشل في تحميل تفاصيل المشارك')
        setDetailsDialogOpen(false)
      }
    } catch (error) {
      console.error('Error loading participant details:', error)
      alert('حدث خطأ في تحميل التفاصيل')
      setDetailsDialogOpen(false)
    } finally {
      setLoadingDetails(false)
    }
  }

  const exportParticipantsToExcel = async () => {
    try {
      setExportingExcel(true)
      
      // First, fetch detailed data for all participants to include form data
      const participantsWithDetails = await Promise.all(
        filteredParticipants.map(async (p) => {
          try {
            const response = await fetch(`/api/supervisor/participants/${p.id}/details`, {
              credentials: 'include'
            })
            if (response.ok) {
              const data = await response.json()
              return data.participant
            }
            return null
          } catch (error) {
            console.error(`Error fetching details for participant ${p.id}:`, error)
            return null
          }
        })
      )

      const data = participantsWithDetails.filter(p => p !== null).map(p => {
        const row: any = {
          'الاسم': p.user.name,
          'البريد الإلكتروني': p.user.email,
          'الهاتف': p.user.phone || '',
          'المدينة': p.user.city || '',
          'الجنسية': p.user.nationality || '',
          'الدور المفضل': p.teamRole || '',
          'الحالة': p.status === 'approved' ? 'مقبول' : p.status === 'rejected' ? 'مرفوض' : 'في الانتظار',
          'تاريخ التسجيل': new Date(p.registeredAt).toLocaleDateString('ar-SA')
        }

        // Add form data fields with their Arabic labels
        if (p.additionalInfo && typeof p.additionalInfo === 'object') {
          Object.entries(p.additionalInfo).forEach(([fieldId, fieldData]: [string, any]) => {
            if (fieldData && fieldData.label) {
              // Format the value properly
              let value = fieldData.value
              if (Array.isArray(value)) {
                value = value.join(', ')
              } else if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value)
              } else if (value === null || value === undefined) {
                value = ''
              } else {
                value = String(value)
              }
              // Use the Arabic label as the column name
              row[fieldData.label] = value
            }
          })
        }

        return row
      })

      // Get all unique column names from the data
      const allColumnNames = new Set<string>()
      data.forEach(row => {
        Object.keys(row).forEach(key => allColumnNames.add(key))
      })

      // Create columns array with all headers
      const baseColumns = ['الاسم', 'البريد الإلكتروني', 'الهاتف', 'المدينة', 'الجنسية', 'الدور المفضل', 'الحالة', 'تاريخ التسجيل']
      const dynamicColumns = Array.from(allColumnNames).filter(col => !baseColumns.includes(col))
      
      const columns = [
        ...baseColumns.map(col => ({ key: col, header: col, width: 25 })),
        ...dynamicColumns.map(col => ({ key: col, header: col, width: 30 }))
      ]

      await ExcelExporter.exportToExcel({
        filename: `${hackathon?.title}_participants.xlsx`,
        sheetName: 'المتقدمين',
        columns,
        data
      })

      alert('✅ تم تصدير البيانات بنجاح!')
    } catch (error) {
      console.error('Error exporting participants:', error)
      alert('حدث خطأ في تصدير البيانات')
    } finally {
      setExportingExcel(false)
    }
  }

  // Team Management Functions
  const handleDragStart = (e: React.DragEvent, participantId: string, sourceTeamId: string, memberName: string) => {
    setDraggedMember({ participantId, sourceTeamId, memberName })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetTeamId: string) => {
    e.preventDefault()
    
    if (!draggedMember || draggedMember.sourceTeamId === targetTeamId) {
      setDraggedMember(null)
      return
    }

    const targetTeam = teams.find(team => team.id === targetTeamId)
    const sourceTeam = teams.find(team => team.id === draggedMember.sourceTeamId)
    
    if (confirm(`هل تريد نقل ${draggedMember.memberName} من ${sourceTeam?.name} إلى ${targetTeam?.name}؟`)) {
      await moveMemberToTeam(
        draggedMember.participantId,
        draggedMember.sourceTeamId,
        targetTeamId
      )
    }
    
    setDraggedMember(null)
  }

  const moveMemberToTeam = async (participantId: string, sourceTeamId: string, targetTeamId: string) => {
    try {
      setTeamSuccess("")
      setTeamError("")

      const response = await fetch(
        `/api/supervisor/hackathons/${params.id}/teams/${sourceTeamId}/members/${participantId}/move`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetTeamId }),
          credentials: 'include'
        }
      )

      const data = await response.json()

      if (response.ok) {
        setTeamSuccess(data.message || "تم نقل العضو بنجاح وإرسال الإيميلات")
        checkExistingTeams()
        setTimeout(() => setTeamSuccess(""), 5000)
      } else {
        setTeamError(data.error || "حدث خطأ في نقل العضو")
      }
    } catch (error) {
      console.error("Error moving member:", error)
      setTeamError("حدث خطأ في الاتصال بالخادم")
    }
  }

  const removeMemberFromTeam = async (teamId: string, participantId: string, memberName: string) => {
    if (!confirm(`هل أنت متأكد من إزالة ${memberName} من الفريق؟`)) return

    try {
      setTeamSuccess("")
      setTeamError("")

      const response = await fetch(
        `/api/supervisor/hackathons/${params.id}/teams/${teamId}/members/${participantId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      )

      const data = await response.json()

      if (response.ok) {
        setTeamSuccess("تم إزالة العضو بنجاح")
        checkExistingTeams()
        setTimeout(() => setTeamSuccess(""), 3000)
      } else {
        setTeamError(data.error || "حدث خطأ في إزالة العضو")
      }
    } catch (error) {
      console.error("Error removing member:", error)
      setTeamError("حدث خطأ في الاتصال بالخادم")
    }
  }

  const deleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`هل أنت متأكد من حذف ${teamName}؟\n\nسيتم إلغاء تعيين جميع الأعضاء من الفريق.`)) return

    try {
      setTeamSuccess("")
      setTeamError("")

      const response = await fetch(
        `/api/supervisor/hackathons/${params.id}/teams/${teamId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      )

      const data = await response.json()

      if (response.ok) {
        setTeamSuccess(`تم حذف ${teamName} بنجاح`)
        checkExistingTeams()
        setTimeout(() => setTeamSuccess(""), 3000)
      } else {
        setTeamError(data.error || "حدث خطأ في حذف الفريق")
      }
    } catch (error) {
      console.error("Error deleting team:", error)
      setTeamError("حدث خطأ في حذف الفريق")
    }
  }

  const sendTeamEmails = async (teamId: string, teamName: string) => {
    if (!confirm(`هل تريد إرسال إيميلات لجميع أعضاء ${teamName}؟`)) return

    try {
      setTeamSuccess("")
      setTeamError("")

      const response = await fetch(
        `/api/supervisor/hackathons/${params.id}/teams/${teamId}/send-emails`,
        {
          method: 'POST',
          credentials: 'include'
        }
      )

      const data = await response.json()

      if (response.ok) {
        setTeamSuccess(`تم إرسال الإيميلات بنجاح!\n\nتم إرسال: ${data.emailsSent} إيميل`)
        setTimeout(() => setTeamSuccess(""), 5000)
      } else {
        setTeamError(data.error || "حدث خطأ في إرسال الإيميلات")
      }
    } catch (error) {
      console.error("Error sending emails:", error)
      setTeamError("حدث خطأ في إرسال الإيميلات")
    }
  }

  const createNewTeam = async () => {
    if (!newTeamName.trim()) {
      setTeamError("يرجى إدخال اسم الفريق")
      return
    }

    try {
      setCreatingNewTeam(true)
      setTeamSuccess("")
      setTeamError("")

      const response = await fetch(
        `/api/supervisor/hackathons/${params.id}/teams`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newTeamName }),
          credentials: 'include'
        }
      )

      const data = await response.json()

      if (response.ok) {
        setTeamSuccess(`تم إنشاء ${newTeamName} بنجاح`)
        setNewTeamName("")
        setNewTeamDialogOpen(false)
        checkExistingTeams()
        setTimeout(() => setTeamSuccess(""), 3000)
      } else {
        setTeamError(data.error || "حدث خطأ في إنشاء الفريق")
      }
    } catch (error) {
      console.error("Error creating team:", error)
      setTeamError("حدث خطأ في إنشاء الفريق")
    } finally {
      setCreatingNewTeam(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "نشط", className: "bg-green-100 text-green-800" },
      completed: { label: "مكتمل", className: "bg-blue-100 text-blue-800" },
      pending: { label: "قيد الانتظار", className: "bg-yellow-100 text-yellow-800" },
      disqualified: { label: "مستبعد", className: "bg-red-100 text-red-800" }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
            <Link href="/supervisor/hackathons">
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
          <Link href="/supervisor/hackathons">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-[#01645e]">{hackathon.title}</h1>
            <p className="text-[#8b7632] text-lg">{hackathon.description}</p>
          </div>
          <Badge className={`${
            hackathon.status === 'open' ? 'bg-green-500' :
            hackathon.status === 'closed' ? 'bg-red-500' :
            hackathon.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
          } text-white`}>
            {hackathon.status === 'open' ? 'مفتوح' :
             hackathon.status === 'closed' ? 'مغلق' :
             hackathon.status === 'completed' ? 'مكتمل' : 'مسودة'}
          </Badge>
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

        {/* Tabs */}
        <Tabs defaultValue="participants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="participants" disabled={!permissions.canManageParticipants}>
              المتقدمين
            </TabsTrigger>
            <TabsTrigger value="teams" disabled={!permissions.canManageTeams}>
              الفرق
            </TabsTrigger>
            <TabsTrigger value="settings">
              الإعدادات
            </TabsTrigger>
          </TabsList>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-6">
            {!permissions.canManageParticipants ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  ليس لديك صلاحية عرض المشاركين
                </AlertDescription>
              </Alert>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl text-[#01645e]">إدارة المتقدمين</CardTitle>
                      <CardDescription>مراجعة وقبول أو رفض المتقدمين مع إمكانية التصفية</CardDescription>
                    </div>
                    {permissions.canExportData && filteredParticipants.length > 0 && (
                      <Button
                        onClick={exportParticipantsToExcel}
                        disabled={exportingExcel}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {exportingExcel ? (
                          <>
                            <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                            جاري التحميل...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 ml-2" />
                            تحميل كل المتقدمين
                          </>
                        )}
                      </Button>
                    )}
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
                  {(permissions.canApproveParticipants || permissions.canRejectParticipants) && filteredParticipants.filter(p => p.status === 'pending').length > 0 && (
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
                            </div>

                            {permissions.canManageParticipants && participant.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => loadParticipantDetails(participant.id)}
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-600 hover:text-blue-700 border-blue-600"
                                >
                                  <Eye className="w-4 h-4 ml-1" />
                                  عرض التفاصيل
                                </Button>
                                <Button
                                  onClick={() => updateParticipantStatus(participant.id, 'approved')}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <UserCheck className="w-4 h-4 ml-1" />
                                  قبول
                                </Button>
                                <Button
                                  onClick={() => updateParticipantStatus(participant.id, 'rejected')}
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 border-red-600"
                                >
                                  <UserX className="w-4 h-4 ml-1" />
                                  رفض
                                </Button>
                              </div>
                            )}
                            {permissions.canManageParticipants && participant.status !== 'pending' && (
                              <Button
                                onClick={() => loadParticipantDetails(participant.id)}
                                size="sm"
                                variant="outline"
                                className="text-blue-600 hover:text-blue-700 border-blue-600"
                              >
                                <Eye className="w-4 h-4 ml-1" />
                                عرض التفاصيل
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            {!permissions.canManageTeams ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  ليس لديك صلاحية عرض الفرق
                </AlertDescription>
              </Alert>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl text-[#01645e]">إدارة الفرق</CardTitle>
                      <CardDescription>عرض وإدارة فرق الهاكاثون</CardDescription>
                    </div>
                    {permissions.canManageTeams && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setNewTeamDialogOpen(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 ml-2" />
                          إنشاء فريق جديد
                        </Button>
                        <Button
                          onClick={handleAutoCreateTeams}
                          disabled={creatingTeams || stats.approvedParticipants === 0}
                          className="bg-gradient-to-r from-[#01645e] to-[#3ab666]"
                        >
                          {creatingTeams ? (
                            <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                          ) : (
                            <Shuffle className="w-4 h-4 ml-2" />
                          )}
                          {creatingTeams ? 'جاري التكوين...' : 'تكوين تلقائي للفرق'}
                        </Button>
                        <Link href={`/supervisor/hackathons/${params.id}/team-formation-settings`}>
                          <Button variant="outline">
                            <Settings className="w-4 h-4 ml-2" />
                            إعدادات التكوين
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {teamError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <AlertDescription className="text-red-800">{teamError}</AlertDescription>
                    </Alert>
                  )}

                  {teamSuccess && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertCircle className="w-4 h-4 text-green-600" />
                      <AlertDescription className="text-green-800 whitespace-pre-line">{teamSuccess}</AlertDescription>
                    </Alert>
                  )}

                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      💡 يمكنك سحب الأعضاء وإفلاتهم بين الفرق لنقلهم. سيتم إرسال إيميلات تلقائياً للمشاركين.
                    </AlertDescription>
                  </Alert>

                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-gray-600">إجمالي الفرق</div>
                        <div className="text-2xl font-bold text-blue-600">{teams.length}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-gray-600">فرق نشطة</div>
                        <div className="text-2xl font-bold text-green-600">
                          {teams.filter((t: any) => t.status === 'active').length}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-gray-600">مشاريع مسلمة</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {teams.filter((t: any) => t.submissionUrl).length}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-gray-600">إجمالي الأعضاء</div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {teams.reduce((total: number, team: any) => total + (team.members?.length || 0), 0)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Teams List with Drag and Drop */}
                  {teams.length === 0 ? (
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold text-[#01645e] mb-2">لا توجد فرق</h3>
                      <p className="text-[#8b7632] mb-4">لم يتم إنشاء أي فرق بعد</p>
                      {permissions.canManageTeams && stats.approvedParticipants > 0 && (
                        <Button
                          onClick={handleAutoCreateTeams}
                          disabled={creatingTeams}
                          className="bg-gradient-to-r from-[#01645e] to-[#3ab666]"
                        >
                          <Shuffle className="w-4 h-4 ml-2" />
                          تكوين الفرق تلقائياً
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {teams.map((team: any) => (
                        <div
                          key={team.id}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, team.id)}
                          className={`transition-all ${
                            draggedMember && draggedMember.sourceTeamId !== team.id 
                              ? 'ring-2 ring-blue-400 bg-blue-50 rounded-lg' 
                              : ''
                          }`}
                        >
                          <Card className="hover:shadow-lg transition-shadow h-full">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Crown className="w-6 h-6 text-white" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <CardTitle className="text-lg truncate">{team.name}</CardTitle>
                                    <p className="text-sm text-gray-500">
                                      {team.members?.length || 0} عضو
                                    </p>
                                  </div>
                                </div>
                                {getStatusBadge(team.status)}
                              </div>
                              <CardDescription>
                                تم الإنشاء: {new Date(team.createdAt).toLocaleDateString('ar-EG', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {/* Team Actions */}
                              <div className="flex gap-2 flex-wrap">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => sendTeamEmails(team.id, team.name)}
                                  className="gap-2 flex-1"
                                >
                                  <Send className="w-4 h-4" />
                                  إرسال إيميلات
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteTeam(team.id, team.name)}
                                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  حذف الفريق
                                </Button>
                              </div>

                              {/* Team Members - Draggable */}
                              <div>
                                <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                  أعضاء الفريق
                                </h4>
                                <div className="space-y-2">
                                  {!team.members || team.members.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">لا يوجد أعضاء في هذا الفريق</p>
                                  ) : (
                                    team.members.map((member: any) => (
                                      <div
                                        key={member.participantId}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, member.participantId, team.id, member.name)}
                                        className={`flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-move border border-transparent hover:border-blue-300 transition-all ${
                                          draggedMember?.participantId === member.participantId ? 'opacity-50' : ''
                                        }`}
                                      >
                                        <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                          {member.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium text-gray-900 truncate">
                                            {member.name}
                                          </div>
                                          <div className="text-xs text-gray-500 truncate">{member.email}</div>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setSelectedMember(member)
                                              setMemberDetailsDialogOpen(true)
                                            }}
                                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                          >
                                            <Eye className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              removeMemberFromTeam(team.id, member.participantId, member.name)
                                            }}
                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* Project Links */}
                              {(team.submissionUrl || team.githubUrl || team.presentationUrl || team.demoUrl) && (
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">روابط المشروع</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {team.submissionUrl && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="gap-2"
                                      >
                                        <a href={team.submissionUrl} target="_blank" rel="noopener noreferrer">
                                          <FileText className="w-4 h-4" />
                                          المشروع
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </Button>
                                    )}
                                    {team.githubUrl && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="gap-2"
                                      >
                                        <a href={team.githubUrl} target="_blank" rel="noopener noreferrer">
                                          <FileText className="w-4 h-4" />
                                          GitHub
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </Button>
                                    )}
                                    {team.presentationUrl && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="gap-2"
                                      >
                                        <a href={team.presentationUrl} target="_blank" rel="noopener noreferrer">
                                          <FileText className="w-4 h-4" />
                                          العرض
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </Button>
                                    )}
                                    {team.demoUrl && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="gap-2"
                                      >
                                        <a href={team.demoUrl} target="_blank" rel="noopener noreferrer">
                                          <FileText className="w-4 h-4" />
                                          فيديو
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#01645e]">إعدادات الهاكاثون</CardTitle>
                <CardDescription>إدارة إعدادات الهاكاثون</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Actions */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#01645e] mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    إجراءات سريعة
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {permissions.canManageParticipants && (
                      <Link href={`/supervisor/hackathons/${params.id}/participants`}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          <Users className="w-4 h-4 ml-2" />
                          إدارة المشاركين
                        </Button>
                      </Link>
                    )}
                    {permissions.canManageTeams && (
                      <Link href={`/supervisor/hackathons/${params.id}/teams`}>
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                          <Trophy className="w-4 h-4 ml-2" />
                          إدارة الفرق
                        </Button>
                      </Link>
                    )}
                    {permissions.canSendMessages && (
                      <Link href={`/supervisor/messages`}>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                          <Mail className="w-4 h-4 ml-2" />
                          إرسال رسائل
                        </Button>
                      </Link>
                    )}
                    {permissions.canViewReports && (
                      <Link href={`/supervisor/reports`}>
                        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                          <BarChart3 className="w-4 h-4 ml-2" />
                          التقارير
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Permissions Info */}
                <div className="border rounded-lg p-6 bg-blue-50">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    صلاحياتك
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { label: 'إدارة المشاركين', value: permissions.canManageParticipants },
                      { label: 'قبول المشاركين', value: permissions.canApproveParticipants },
                      { label: 'رفض المشاركين', value: permissions.canRejectParticipants },
                      { label: 'إدارة الفرق', value: permissions.canManageTeams },
                      { label: 'نقل الأعضاء', value: permissions.canMoveMembers },
                      { label: 'إزالة الأعضاء', value: permissions.canRemoveMembers },
                      { label: 'إرسال رسائل', value: permissions.canSendMessages },
                      { label: 'عرض التقارير', value: permissions.canViewReports },
                      { label: 'تصدير البيانات', value: permissions.canExportData }
                    ].map((perm, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {perm.value ? (
                          <UserCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <UserX className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm ${perm.value ? 'text-green-700' : 'text-red-700'}`}>
                          {perm.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Participant Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#01645e]">تفاصيل المشارك</DialogTitle>
              <DialogDescription>
                معلومات تفصيلية عن المشارك وبيانات التسجيل
              </DialogDescription>
            </DialogHeader>
            {loadingDetails ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[#8b7632]">جاري تحميل التفاصيل...</p>
                </div>
              </div>
            ) : participantDetails ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="text-lg font-semibold text-[#01645e] mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    المعلومات الأساسية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#8b7632]">الاسم</Label>
                      <p className="text-[#01645e] font-semibold">{participantDetails.user.name}</p>
                    </div>
                    <div>
                      <Label className="text-[#8b7632]">البريد الإلكتروني</Label>
                      <p className="text-[#01645e] font-semibold">{participantDetails.user.email}</p>
                    </div>
                    {participantDetails.user.phone && (
                      <div>
                        <Label className="text-[#8b7632]">رقم الهاتف</Label>
                        <p className="text-[#01645e] font-semibold">{participantDetails.user.phone}</p>
                      </div>
                    )}
                    {participantDetails.user.city && (
                      <div>
                        <Label className="text-[#8b7632]">المدينة</Label>
                        <p className="text-[#01645e] font-semibold">{participantDetails.user.city}</p>
                      </div>
                    )}
                    {participantDetails.user.nationality && (
                      <div>
                        <Label className="text-[#8b7632]">الجنسية</Label>
                        <p className="text-[#01645e] font-semibold">{participantDetails.user.nationality}</p>
                      </div>
                    )}
                    {participantDetails.teamRole && (
                      <div>
                        <Label className="text-[#8b7632]">الدور المفضل</Label>
                        <p className="text-[#01645e] font-semibold">{participantDetails.teamRole}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Form Data */}
                {participantDetails.additionalInfo && Object.keys(participantDetails.additionalInfo).length > 0 && (
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h3 className="text-lg font-semibold text-[#01645e] mb-3 flex items-center gap-2">
                      <FormInput className="w-5 h-5" />
                      بيانات التسجيل الإضافية
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries(participantDetails.additionalInfo).map(([fieldId, fieldData]: [string, any]) => {
                        // Format the value properly
                        let displayValue = ''
                        if (fieldData && fieldData.value !== undefined && fieldData.value !== null) {
                          if (Array.isArray(fieldData.value)) {
                            displayValue = fieldData.value.join(', ')
                          } else if (typeof fieldData.value === 'object') {
                            displayValue = JSON.stringify(fieldData.value, null, 2)
                          } else {
                            displayValue = String(fieldData.value)
                          }
                        } else {
                          displayValue = 'غير محدد'
                        }

                        return (
                          <div key={fieldId} className="border-b pb-3 last:border-b-0">
                            <Label className="text-[#8b7632] text-sm font-semibold">{fieldData.label || fieldId}</Label>
                            <p className="text-[#01645e] mt-1" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {displayValue}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Registration Info */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-semibold text-[#01645e] mb-3">معلومات التسجيل</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#8b7632]">الحالة</Label>
                      <p>
                        <Badge className={`${
                          participantDetails.status === 'approved' ? 'bg-green-500' :
                          participantDetails.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                        } text-white`}>
                          {participantDetails.status === 'approved' ? 'مقبول' :
                           participantDetails.status === 'rejected' ? 'مرفوض' : 'في الانتظار'}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <Label className="text-[#8b7632]">تاريخ التسجيل</Label>
                      <p className="text-[#01645e] font-semibold">
                        {new Date(participantDetails.registeredAt).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Create New Team Dialog */}
        <Dialog open={newTeamDialogOpen} onOpenChange={setNewTeamDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إنشاء فريق جديد</DialogTitle>
              <DialogDescription>
                أدخل اسم الفريق الجديد
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamName">اسم الفريق</Label>
                <Input
                  id="teamName"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="مثال: فريق الابتكار"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      createNewTeam()
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setNewTeamDialogOpen(false)
                  setNewTeamName("")
                }}
              >
                إلغاء
              </Button>
              <Button
                onClick={createNewTeam}
                disabled={creatingNewTeam || !newTeamName.trim()}
                className="gap-2"
              >
                {creatingNewTeam ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                إنشاء
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Member Details Dialog */}
        <Dialog open={memberDetailsDialogOpen} onOpenChange={setMemberDetailsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تفاصيل المشارك</DialogTitle>
              <DialogDescription>
                معلومات تفصيلية عن المشارك
              </DialogDescription>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {selectedMember.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
                    <p className="text-sm text-gray-500">مشارك</p>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                      <p className="text-sm font-medium">{selectedMember.email}</p>
                    </div>
                  </div>

                  {selectedMember.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">رقم الهاتف</p>
                        <p className="text-sm font-medium">{selectedMember.phone}</p>
                      </div>
                    </div>
                  )}

                  {selectedMember.user?.city && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">المدينة</p>
                        <p className="text-sm font-medium">{selectedMember.user.city}</p>
                      </div>
                    </div>
                  )}

                  {selectedMember.user?.nationality && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">الجنسية</p>
                        <p className="text-sm font-medium">{selectedMember.user.nationality}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
