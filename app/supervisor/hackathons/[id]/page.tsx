"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Filter, Settings, FileText, Trophy, Eye, UserCheck, UserX, MapPin, Flag, Mail, Trash2, Pin, PinOff, Upload, Download, FormInput, Palette, Star, BarChart3, ExternalLink, Award, Shuffle, AlertCircle, Shield } from 'lucide-react'
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
                          onClick={handleAutoCreateTeams}
                          disabled={creatingTeams || stats.approvedParticipants === 0}
                          className="bg-gradient-to-r from-[#01645e] to-[#3ab666]"
                        >
                          <Shuffle className="w-4 h-4 ml-2" />
                          {creatingTeams ? 'جاري التكوين...' : 'تكوين تلقائي للفرق'}
                        </Button>
                        <Link href={`/supervisor/hackathons/${params.id}/teams`}>
                          <Button variant="outline">
                            <Eye className="w-4 h-4 ml-2" />
                            عرض التفاصيل
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
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
                    <TeamsDisplay teams={teams} hackathonId={params.id as string} />
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
      </div>
    </div>
  )
}
