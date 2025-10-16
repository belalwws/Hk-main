"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  User,
  Settings,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  Trash2,
  Trophy,
  Edit,
  Image as ImageIcon,
  UserCircle,
  FileText
} from "lucide-react"

interface SupervisorUser {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
  profilePicture?: string
  createdAt: string
  isActive: boolean
  bio?: string
  dateOfBirth?: string
  gender?: string
  education?: string
  university?: string
  major?: string
  graduationYear?: string
  currentJob?: string
  company?: string
  yearsOfExperience?: string
  skills?: string
  linkedin?: string
  github?: string
  website?: string
}

interface Hackathon {
  id: string
  title: string
  status: string
}

interface Assignment {
  id: string
  hackathonId: string | null
  hackathon: Hackathon | null
  department?: string
  permissions?: any
  isActive: boolean
  assignedAt: string
}

interface SupervisorGroup {
  user: SupervisorUser
  assignments: Assignment[]
}

interface SupervisorInvitation {
  id: string
  email: string
  name?: string
  status: "pending" | "accepted" | "expired" | "cancelled"
  expiresAt: string
  createdAt: string
}

export default function SupervisorsManagement() {
  const [supervisorGroups, setSupervisorGroups] = useState<SupervisorGroup[]>([])
  const [invitations, setInvitations] = useState<SupervisorInvitation[]>([])
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  const [selectedSupervisor, setSelectedSupervisor] = useState<SupervisorUser | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)

  const [permissions, setPermissions] = useState({
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
  
  const [inviteData, setInviteData] = useState({
    email: "",
    name: "",
  })
  
  const [assignmentData, setAssignmentData] = useState({
    userId: "",
    hackathonId: "",
    department: ""
  })
  
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [supervisorsRes, invitationsRes, hackathonsRes] = await Promise.all([
        fetch("/api/admin/supervisor-assignments", { credentials: 'include' }),
        fetch("/api/supervisor/invite"),
        fetch("/api/admin/hackathons", { credentials: 'include' })
      ])

      if (supervisorsRes.ok) {
        const data = await supervisorsRes.json()
        setSupervisorGroups(data.supervisors || [])
      }

      if (invitationsRes.ok) {
        const data = await invitationsRes.json()
        setInvitations(data.invitations || [])
      }

      if (hackathonsRes.ok) {
        const data = await hackathonsRes.json()
        setHackathons(data.hackathons || [])
      }

    } catch (error) {
      console.error("Error fetching data:", error)
      setError("حدث خطأ في جلب البيانات")
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/supervisor/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...inviteData,
          permissions: {
            canManageParticipants: true,
            canManageTeams: true,
            canViewReports: true
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("تم إرسال الدعوة بنجاح")
        setInviteData({ email: "", name: "" })
        setInviteDialogOpen(false)
        fetchData()
      } else {
        setError(data.error || "حدث خطأ في إرسال الدعوة")
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالخادم")
    }
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/supervisor-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(assignmentData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("تم إنشاء التعيين بنجاح")
        setAssignmentData({ userId: "", hackathonId: "", department: "" })
        setAssignDialogOpen(false)
        fetchData()
      } else {
        setError(data.error || "حدث خطأ في إنشاء التعيين")
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالخادم")
    }
  }

  const deleteAssignment = async (assignmentId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا التعيين؟")) return

    try {
      const response = await fetch(`/api/admin/supervisor-assignments?id=${assignmentId}`, {
        method: "DELETE",
        credentials: 'include'
      })

      if (response.ok) {
        setSuccess("تم إلغاء التعيين بنجاح")
        fetchData()
      } else {
        const data = await response.json()
        setError(data.error || "حدث خطأ في إلغاء التعيين")
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالخادم")
    }
  }

  const deleteInvitation = async (invitationId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الدعوة؟")) return

    try {
      const response = await fetch(`/api/supervisor/invite?id=${invitationId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        setSuccess("تم حذف الدعوة بنجاح")
        fetchData()
      } else {
        const data = await response.json()
        setError(data.error || "حدث خطأ في حذف الدعوة")
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالخادم")
    }
  }

  const openPermissionsDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    const currentPermissions = assignment.permissions as any || {}
    setPermissions({
      canManageParticipants: currentPermissions.canManageParticipants !== false,
      canApproveParticipants: currentPermissions.canApproveParticipants !== false,
      canRejectParticipants: currentPermissions.canRejectParticipants !== false,
      canManageTeams: currentPermissions.canManageTeams !== false,
      canMoveMembers: currentPermissions.canMoveMembers !== false,
      canRemoveMembers: currentPermissions.canRemoveMembers !== false,
      canViewReports: currentPermissions.canViewReports !== false,
      canExportData: currentPermissions.canExportData !== false,
      canSendMessages: currentPermissions.canSendMessages !== false
    })
    setPermissionsDialogOpen(true)
  }

  const updatePermissions = async () => {
    if (!selectedAssignment) return

    try {
      const response = await fetch(`/api/admin/supervisor-assignments/${selectedAssignment.id}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ permissions })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("تم تحديث الصلاحيات بنجاح")
        setPermissionsDialogOpen(false)
        fetchData()
      } else {
        setError(data.error || "حدث خطأ في تحديث الصلاحيات")
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالخادم")
    }
  }

  const toggleAssignmentStatus = async (assignmentId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/supervisor-assignments/${assignmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ isActive: !currentStatus })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`تم ${!currentStatus ? 'تفعيل' : 'تعطيل'} المشرف بنجاح`)
        fetchData()
      } else {
        setError(data.error || "حدث خطأ في تحديث الحالة")
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالخادم")
    }
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { label: "معلقة", color: "bg-yellow-100 text-yellow-800", icon: Clock },
      accepted: { label: "مقبولة", color: "bg-green-100 text-green-800", icon: CheckCircle },
      expired: { label: "منتهية", color: "bg-red-100 text-red-800", icon: XCircle },
      cancelled: { label: "ملغاة", color: "bg-gray-100 text-gray-800", icon: XCircle }
    }
    const config = configs[status as keyof typeof configs] || configs.pending
    const Icon = config.icon
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 ml-1" />
        {config.label}
      </Badge>
    )
  }

  const getHackathonStatusBadge = (status: string) => {
    const configs = {
      open: { label: "مفتوح", color: "bg-green-100 text-green-800" },
      closed: { label: "مغلق", color: "bg-red-100 text-red-800" },
      completed: { label: "مكتمل", color: "bg-gray-100 text-gray-800" },
      draft: { label: "مسودة", color: "bg-yellow-100 text-yellow-800" }
    }
    const config = configs[status as keyof typeof configs] || configs.draft
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const filteredSupervisors = supervisorGroups.filter(group => {
    const matchesSearch = group.user.name.toLowerCase().includes(search.toLowerCase()) ||
                         group.user.email.toLowerCase().includes(search.toLowerCase())
    
    if (statusFilter === "all") return matchesSearch
    if (statusFilter === "active") return matchesSearch && group.user.isActive
    if (statusFilter === "inactive") return matchesSearch && !group.user.isActive
    return matchesSearch
  })

  const totalSupervisors = supervisorGroups.length
  const activeSupervisors = supervisorGroups.filter(g => g.user.isActive).length
  const totalAssignments = supervisorGroups.reduce((sum, g) => sum + g.assignments.length, 0)
  const pendingInvitations = invitations.filter(i => i.status === "pending").length

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات المشرفين...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إدارة المشرفين الشاملة</h1>
        <p className="text-gray-600 mt-2">
          إدارة المشرفين، التعيينات، والدعوات من مكان واحد
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المشرفين</p>
                <p className="text-2xl font-bold text-blue-600">{totalSupervisors}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المشرفون النشطون</p>
                <p className="text-2xl font-bold text-green-600">{activeSupervisors}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي التعيينات</p>
                <p className="text-2xl font-bold text-purple-600">{totalAssignments}</p>
              </div>
              <Trophy className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">دعوات معلقة</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingInvitations}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="supervisors" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="supervisors">
              <Users className="w-4 h-4 ml-2" />
              المشرفون ({totalSupervisors})
            </TabsTrigger>
            <TabsTrigger value="invitations">
              <Mail className="w-4 h-4 ml-2" />
              الدعوات ({invitations.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Mail className="w-4 h-4 ml-2" />
                  دعوة مشرف جديد
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>دعوة مشرف جديد</DialogTitle>
                  <DialogDescription>
                    أرسل دعوة للانضمام كمشرف عبر البريد الإلكتروني
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <Label>الاسم الكامل</Label>
                    <Input
                      value={inviteData.name}
                      onChange={(e) => setInviteData({...inviteData, name: e.target.value})}
                      placeholder="أدخل الاسم"
                      required
                    />
                  </div>
                  <div>
                    <Label>البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={inviteData.email}
                      onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                      placeholder="supervisor@example.com"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">إرسال الدعوة</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 ml-2" />
                  تعيين جديد
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إنشاء تعيين جديد</DialogTitle>
                  <DialogDescription>
                    قم بتعيين مشرف لهاكاثون معين
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAssign} className="space-y-4">
                  <div>
                    <Label>المشرف</Label>
                    <Select value={assignmentData.userId} onValueChange={(value) => 
                      setAssignmentData({...assignmentData, userId: value})
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المشرف" />
                      </SelectTrigger>
                      <SelectContent>
                        {supervisorGroups.map((group) => (
                          <SelectItem key={group.user.id} value={group.user.id}>
                            {group.user.name} ({group.user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>الهاكاثون</Label>
                    <Select value={assignmentData.hackathonId} onValueChange={(value) => 
                      setAssignmentData({...assignmentData, hackathonId: value})
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الهاكاثون" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">مشرف عام (جميع الهاكاثونات)</SelectItem>
                        {hackathons.map((hackathon) => (
                          <SelectItem key={hackathon.id} value={hackathon.id}>
                            {hackathon.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>القسم (اختياري)</Label>
                    <Input
                      value={assignmentData.department}
                      onChange={(e) => setAssignmentData({...assignmentData, department: e.target.value})}
                      placeholder="مثل: التقنية، التسويق، إلخ"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={!assignmentData.userId}>
                    إنشاء التعيين
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Supervisors Tab */}
        <TabsContent value="supervisors" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث بالاسم أو البريد الإلكتروني..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="تصفية بالحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Supervisors List */}
          <div className="space-y-4">
            {filteredSupervisors.map((group) => (
              <Card key={group.user.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={group.user.profilePicture} alt={group.user.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                          {group.user.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle>{group.user.name}</CardTitle>
                          <Badge className={group.user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {group.user.isActive ? "نشط" : "غير نشط"}
                          </Badge>
                          {group.user.profilePicture && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <ImageIcon className="w-3 h-3 ml-1" />
                              صورة محملة
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {group.user.email}
                            </div>
                            {group.user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {group.user.phone}
                              </div>
                            )}
                            {group.user.city && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {group.user.city}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              انضم: {new Date(group.user.createdAt).toLocaleDateString('ar-SA')}
                            </div>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {group.assignments.length} تعيين
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSupervisor(group.user)
                          setDetailsDialogOpen(true)
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <UserCircle className="w-4 h-4 ml-1" />
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">التعيينات:</h4>
                    {group.assignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Trophy className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="font-medium">
                              {assignment.hackathon ? assignment.hackathon.title : "مشرف عام"}
                            </p>
                            {assignment.department && (
                              <p className="text-sm text-gray-500">القسم: {assignment.department}</p>
                            )}
                            <p className="text-xs text-gray-400">
                              تم التعيين: {new Date(assignment.assignedAt).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {assignment.hackathon && getHackathonStatusBadge(assignment.hackathon.status)}
                          <Badge className={assignment.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {assignment.isActive ? "مفعل" : "معطل"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPermissionsDialog(assignment)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Settings className="w-4 h-4 ml-1" />
                            الصلاحيات
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAssignmentStatus(assignment.id, assignment.isActive)}
                            className={assignment.isActive ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                          >
                            {assignment.isActive ? "تعطيل" : "تفعيل"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAssignment(assignment.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSupervisors.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  لا توجد نتائج
                </h3>
                <p className="text-gray-600">
                  جرب تغيير معايير البحث
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations" className="space-y-4">
          <div className="grid gap-4">
            {invitations.map((invitation) => (
              <Card key={invitation.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{invitation.name || invitation.email}</p>
                        <p className="text-sm text-gray-600">{invitation.email}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>تم الإرسال: {new Date(invitation.createdAt).toLocaleDateString('ar-SA')}</span>
                          <span>تنتهي: {new Date(invitation.expiresAt).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(invitation.status)}
                      {invitation.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteInvitation(invitation.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {invitations.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  لا توجد دعوات
                </h3>
                <p className="text-gray-600">
                  ابدأ بدعوة مشرفين جدد
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Permissions Dialog */}
      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إدارة صلاحيات المشرف</DialogTitle>
            <DialogDescription>
              قم بتخصيص الصلاحيات المتاحة للمشرف في هذا الهاكاثون
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Participants Management */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                إدارة المشاركين
              </h3>
              <div className="space-y-2 pr-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.canManageParticipants}
                    onChange={(e) => setPermissions({...permissions, canManageParticipants: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">عرض وإدارة المشاركين</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.canApproveParticipants}
                    onChange={(e) => setPermissions({...permissions, canApproveParticipants: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">قبول المشاركين</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.canRejectParticipants}
                    onChange={(e) => setPermissions({...permissions, canRejectParticipants: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">رفض المشاركين</span>
                </label>
              </div>
            </div>

            {/* Teams Management */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                إدارة الفرق
              </h3>
              <div className="space-y-2 pr-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.canManageTeams}
                    onChange={(e) => setPermissions({...permissions, canManageTeams: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">عرض وإدارة الفرق</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.canMoveMembers}
                    onChange={(e) => setPermissions({...permissions, canMoveMembers: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">نقل الأعضاء بين الفرق</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.canRemoveMembers}
                    onChange={(e) => setPermissions({...permissions, canRemoveMembers: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">إزالة الأعضاء من الفرق</span>
                </label>
              </div>
            </div>

            {/* Reports & Data */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                التقارير والبيانات
              </h3>
              <div className="space-y-2 pr-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.canViewReports}
                    onChange={(e) => setPermissions({...permissions, canViewReports: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">عرض التقارير</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.canExportData}
                    onChange={(e) => setPermissions({...permissions, canExportData: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">تصدير البيانات</span>
                </label>
              </div>
            </div>

            {/* Communication */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Mail className="w-4 h-4" />
                التواصل
              </h3>
              <div className="space-y-2 pr-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.canSendMessages}
                    onChange={(e) => setPermissions({...permissions, canSendMessages: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">إرسال الرسائل للمشاركين</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-6">
            <Button variant="outline" onClick={() => setPermissionsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={updatePermissions} className="bg-blue-600 hover:bg-blue-700">
              حفظ الصلاحيات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Supervisor Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">تفاصيل المشرف</DialogTitle>
            <DialogDescription>
              جميع البيانات الشخصية والمهنية للمشرف
            </DialogDescription>
          </DialogHeader>
          
          {selectedSupervisor && (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage src={selectedSupervisor.profilePicture} alt={selectedSupervisor.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                    {selectedSupervisor.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedSupervisor.name}</h3>
                  <p className="text-gray-600 mt-1">{selectedSupervisor.email}</p>
                  <div className="flex gap-2 mt-3">
                    <Badge className={selectedSupervisor.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {selectedSupervisor.isActive ? "نشط" : "غير نشط"}
                    </Badge>
                    {selectedSupervisor.currentJob && (
                      <Badge variant="outline" className="bg-white">
                        {selectedSupervisor.currentJob}
                      </Badge>
                    )}
                  </div>
                  {selectedSupervisor.bio && (
                    <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                      {selectedSupervisor.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Personal Info */}
              <Card>
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    المعلومات الشخصية
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    {selectedSupervisor.phone && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">رقم الهاتف</p>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <p className="font-medium">{selectedSupervisor.phone}</p>
                        </div>
                      </div>
                    )}
                    {selectedSupervisor.city && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">المدينة</p>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="font-medium">{selectedSupervisor.city}</p>
                        </div>
                      </div>
                    )}
                    {selectedSupervisor.dateOfBirth && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">تاريخ الميلاد</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <p className="font-medium">{new Date(selectedSupervisor.dateOfBirth).toLocaleDateString('ar-SA')}</p>
                        </div>
                      </div>
                    )}
                    {selectedSupervisor.gender && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">الجنس</p>
                        <p className="font-medium">{selectedSupervisor.gender === 'male' ? 'ذكر' : selectedSupervisor.gender === 'female' ? 'أنثى' : 'آخر'}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Education Info */}
              {(selectedSupervisor.education || selectedSupervisor.university || selectedSupervisor.major) && (
                <Card>
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      المعلومات التعليمية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedSupervisor.education && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">المؤهل العلمي</p>
                          <p className="font-medium">{selectedSupervisor.education}</p>
                        </div>
                      )}
                      {selectedSupervisor.university && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">الجامعة</p>
                          <p className="font-medium">{selectedSupervisor.university}</p>
                        </div>
                      )}
                      {selectedSupervisor.major && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">التخصص</p>
                          <p className="font-medium">{selectedSupervisor.major}</p>
                        </div>
                      )}
                      {selectedSupervisor.graduationYear && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">سنة التخرج</p>
                          <p className="font-medium">{selectedSupervisor.graduationYear}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Professional Info */}
              {(selectedSupervisor.currentJob || selectedSupervisor.company || selectedSupervisor.yearsOfExperience) && (
                <Card>
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-green-600" />
                      المعلومات المهنية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedSupervisor.currentJob && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">الوظيفة الحالية</p>
                          <p className="font-medium">{selectedSupervisor.currentJob}</p>
                        </div>
                      )}
                      {selectedSupervisor.company && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">الشركة</p>
                          <p className="font-medium">{selectedSupervisor.company}</p>
                        </div>
                      )}
                      {selectedSupervisor.yearsOfExperience && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">سنوات الخبرة</p>
                          <p className="font-medium">{selectedSupervisor.yearsOfExperience} سنوات</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Skills */}
              {selectedSupervisor.skills && selectedSupervisor.skills.trim().length > 0 && (
                <Card>
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5 text-orange-600" />
                      المهارات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2">
                      {selectedSupervisor.skills.split(',').map((skill, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Social Links */}
              {(selectedSupervisor.linkedin || selectedSupervisor.github || selectedSupervisor.website) && (
                <Card>
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      روابط التواصل
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {selectedSupervisor.linkedin && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">LinkedIn</p>
                          <a 
                            href={selectedSupervisor.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {selectedSupervisor.linkedin}
                          </a>
                        </div>
                      )}
                      {selectedSupervisor.github && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">GitHub</p>
                          <a 
                            href={selectedSupervisor.github} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {selectedSupervisor.github}
                          </a>
                        </div>
                      )}
                      {selectedSupervisor.website && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">الموقع الإلكتروني</p>
                          <a 
                            href={selectedSupervisor.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {selectedSupervisor.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Account Info */}
              <Card>
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gray-600" />
                    معلومات الحساب
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">معرف المستخدم</p>
                      <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{selectedSupervisor.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">تاريخ التسجيل</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="font-medium">{new Date(selectedSupervisor.createdAt).toLocaleString('ar-SA')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button onClick={() => setDetailsDialogOpen(false)} className="bg-blue-600 hover:bg-blue-700">
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
