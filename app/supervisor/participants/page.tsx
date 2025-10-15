"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail,
  Phone,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  Eye
} from "lucide-react"

interface Participant {
  id: string
  status: "pending" | "approved" | "rejected"
  teamName?: string
  projectTitle?: string
  registeredAt: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
    city?: string
    skills?: string
    profilePicture?: string
  }
  hackathon: {
    id: string
    title: string
  }
  team?: {
    id: string
    name: string
    teamNumber: number
  }
}

interface ParticipantStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export default function SupervisorParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [stats, setStats] = useState<ParticipantStats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  
  // Filters and pagination
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Dialog state
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [newStatus, setNewStatus] = useState<"approved" | "rejected">("approved")

  useEffect(() => {
    fetchParticipants()
    fetchStats()
  }, [page, statusFilter, search])

  const fetchParticipants = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        status: statusFilter,
        search: search
      })

      const response = await fetch(`/api/supervisor/participants?${params}`)
      const data = await response.json()

      if (response.ok) {
        setParticipants(data.participants)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error("Error fetching participants:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/supervisor/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stats" })
      })
      
      const data = await response.json()
      if (response.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedParticipant) return

    setUpdating(selectedParticipant.id)

    try {
      const response = await fetch("/api/supervisor/participants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: selectedParticipant.id,
          status: newStatus,
          feedback: feedback.trim() || null
        })
      })

      if (response.ok) {
        await fetchParticipants()
        await fetchStats()
        setDialogOpen(false)
        setSelectedParticipant(null)
        setFeedback("")
      }
    } catch (error) {
      console.error("Error updating participant:", error)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">معتمد</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">مرفوض</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">معلق</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const openUpdateDialog = (participant: Participant, status: "approved" | "rejected") => {
    setSelectedParticipant(participant)
    setNewStatus(status)
    setFeedback("")
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المشاركين</h1>
          <p className="text-gray-600">عرض ومراجعة طلبات المشاركة</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المشاركين</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">معتمد</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">معلق</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مرفوض</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث بالاسم، البريد الإلكتروني، أو المشروع..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="تصفية بالحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="approved">معتمد</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Participants List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المشاركين</CardTitle>
          <CardDescription>
            {participants.length} مشارك من إجمالي {stats.total}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {participants.map((participant) => (
              <div key={participant.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{participant.user.name}</h3>
                        {getStatusBadge(participant.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {participant.user.email}
                        </div>
                        {participant.user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {participant.user.phone}
                          </div>
                        )}
                        {participant.user.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {participant.user.city}
                          </div>
                        )}
                        {participant.teamName && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {participant.teamName}
                          </div>
                        )}
                      </div>

                      {participant.projectTitle && (
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>المشروع:</strong> {participant.projectTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        setSelectedParticipant(participant)
                        setDetailsDialogOpen(true)
                      }}
                    >
                      <Eye className="w-4 h-4 ml-1" />
                      عرض التفاصيل
                    </Button>
                    
                    {participant.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => openUpdateDialog(participant, "approved")}
                          disabled={updating === participant.id}
                        >
                          <CheckCircle className="w-4 h-4 ml-1" />
                          موافقة
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => openUpdateDialog(participant, "rejected")}
                          disabled={updating === participant.id}
                        >
                          <XCircle className="w-4 h-4 ml-1" />
                          رفض
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronRight className="w-4 h-4 ml-1" />
                السابق
              </Button>
              
              <span className="text-sm text-gray-600">
                صفحة {page} من {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                التالي
                <ChevronLeft className="w-4 h-4 mr-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newStatus === "approved" ? "الموافقة على المشارك" : "رفض المشارك"}
            </DialogTitle>
            <DialogDescription>
              {selectedParticipant && (
                <>
                  {newStatus === "approved" 
                    ? `هل أنت متأكد من الموافقة على مشاركة ${selectedParticipant.user.name}؟`
                    : `هل أنت متأكد من رفض مشاركة ${selectedParticipant.user.name}؟`
                  }
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">ملاحظات (اختياري)</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={newStatus === "approved" 
                  ? "رسالة ترحيب أو تعليمات إضافية..."
                  : "سبب الرفض أو ملاحظات للمشارك..."
                }
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                إلغاء
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={updating === selectedParticipant?.id}
                className={newStatus === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                {updating === selectedParticipant?.id ? "جاري التحديث..." : 
                 newStatus === "approved" ? "موافقة" : "رفض"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Participant Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">تفاصيل المشارك</DialogTitle>
            <DialogDescription>
              جميع المعلومات التي قدمها المشارك في فورم التسجيل
            </DialogDescription>
          </DialogHeader>

          {selectedParticipant && (
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  المعلومات الشخصية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">الاسم</p>
                    <p className="font-medium">{selectedParticipant.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                    <p className="font-medium">{selectedParticipant.user.email}</p>
                  </div>
                  {selectedParticipant.user.phone && (
                    <div>
                      <p className="text-sm text-gray-600">رقم الهاتف</p>
                      <p className="font-medium">{selectedParticipant.user.phone}</p>
                    </div>
                  )}
                  {selectedParticipant.user.city && (
                    <div>
                      <p className="text-sm text-gray-600">المدينة</p>
                      <p className="font-medium">{selectedParticipant.user.city}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Info */}
              {(selectedParticipant.teamName || selectedParticipant.team) && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    معلومات الفريق
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedParticipant.teamName && (
                      <div>
                        <p className="text-sm text-gray-600">اسم الفريق</p>
                        <p className="font-medium">{selectedParticipant.teamName}</p>
                      </div>
                    )}
                    {selectedParticipant.team && (
                      <div>
                        <p className="text-sm text-gray-600">رقم الفريق</p>
                        <p className="font-medium">#{selectedParticipant.team.teamNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Project Info */}
              {selectedParticipant.projectTitle && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3">المشروع</h3>
                  <div>
                    <p className="text-sm text-gray-600">عنوان المشروع</p>
                    <p className="font-medium">{selectedParticipant.projectTitle}</p>
                  </div>
                </div>
              )}

              {/* Skills */}
              {selectedParticipant.user.skills && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3">المهارات</h3>
                  <p className="text-sm">{selectedParticipant.user.skills}</p>
                </div>
              )}

              {/* Hackathon & Status */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">معلومات الهاكاثون</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">الهاكاثون</p>
                    <p className="font-medium">{selectedParticipant.hackathon.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">حالة الطلب</p>
                    <div className="mt-1">{getStatusBadge(selectedParticipant.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">تاريخ التسجيل</p>
                    <p className="font-medium">
                      {new Date(selectedParticipant.registeredAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                  إغلاق
                </Button>
                {selectedParticipant.status === "pending" && (
                  <>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setDetailsDialogOpen(false)
                        openUpdateDialog(selectedParticipant, "approved")
                      }}
                    >
                      <CheckCircle className="w-4 h-4 ml-1" />
                      موافقة
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => {
                        setDetailsDialogOpen(false)
                        openUpdateDialog(selectedParticipant, "rejected")
                      }}
                    >
                      <XCircle className="w-4 h-4 ml-1" />
                      رفض
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
