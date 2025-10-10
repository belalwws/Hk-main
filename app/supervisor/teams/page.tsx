"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Trophy, 
  Search, 
  Users, 
  Star,
  ExternalLink,
  Github,
  Globe,
  Edit,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Target,
  CheckCircle
} from "lucide-react"

interface Team {
  id: string
  name: string
  teamNumber?: number
  projectName?: string
  projectDescription?: string
  projectUrl?: string
  githubUrl?: string
  demoUrl?: string
  status?: string
  notes?: string
  finalScore?: number
  rank?: number
  createdAt: string
  memberCount: number
  averageScore?: number
  evaluationCount: number
  participants: Array<{
    user: {
      id: string
      name: string
      email: string
      phone?: string
    }
  }>
  hackathon: {
    id: string
    title: string
  }
}

interface TeamStats {
  total: number
  withProjects: number
  withSubmissions: number
  evaluated: number
  completionRate: number
}

export default function SupervisorTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [stats, setStats] = useState<TeamStats>({ 
    total: 0, 
    withProjects: 0, 
    withSubmissions: 0, 
    evaluated: 0, 
    completionRate: 0 
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  
  // Filters and pagination
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Dialog state
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState({
    name: "",
    projectName: "",
    projectDescription: "",
    projectUrl: "",
    githubUrl: "",
    demoUrl: "",
    notes: ""
  })

  useEffect(() => {
    fetchTeams()
    fetchStats()
  }, [page, statusFilter, search])

  const fetchTeams = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        status: statusFilter,
        search: search
      })

      const response = await fetch(`/api/supervisor/teams?${params}`)
      const data = await response.json()

      if (response.ok) {
        setTeams(data.teams)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/supervisor/teams", {
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

  const openEditDialog = (team: Team) => {
    setSelectedTeam(team)
    setEditData({
      name: team.name || "",
      projectName: team.projectName || "",
      projectDescription: team.projectDescription || "",
      projectUrl: team.projectUrl || "",
      githubUrl: team.githubUrl || "",
      demoUrl: team.demoUrl || "",
      notes: team.notes || ""
    })
    setDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedTeam) return

    setUpdating(selectedTeam.id)

    try {
      const response = await fetch("/api/supervisor/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeam.id,
          updates: editData
        })
      })

      if (response.ok) {
        await fetchTeams()
        await fetchStats()
        setDialogOpen(false)
        setSelectedTeam(null)
      }
    } catch (error) {
      console.error("Error updating team:", error)
    } finally {
      setUpdating(null)
    }
  }

  const getProjectStatusBadge = (team: Team) => {
    if (team.projectUrl || team.githubUrl) {
      return <Badge className="bg-green-100 text-green-800">مشروع مكتمل</Badge>
    } else if (team.projectName) {
      return <Badge className="bg-yellow-100 text-yellow-800">قيد التطوير</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800">لم يبدأ</Badge>
    }
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
          <h1 className="text-2xl font-bold text-gray-900">إدارة الفرق</h1>
          <p className="text-gray-600">متابعة الفرق ومشاريعها</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الفرق</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <Trophy className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">لديها مشاريع</p>
                <p className="text-2xl font-bold text-green-600">{stats.withProjects}</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تم تسليمها</p>
                <p className="text-2xl font-bold text-purple-600">{stats.withSubmissions}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تم تقييمها</p>
                <p className="text-2xl font-bold text-orange-600">{stats.evaluated}</p>
              </div>
              <Star className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">معدل الإنجاز</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.completionRate}%</p>
              </div>
              <Calendar className="w-8 h-8 text-indigo-600" />
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
                  placeholder="البحث بالاسم أو المشروع..."
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
                <SelectItem value="all">جميع الفرق</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teams List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-blue-600" />
                    {team.name}
                    {team.teamNumber && (
                      <Badge variant="outline">#{team.teamNumber}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {team.hackathon.title}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(team)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Project Info */}
                {team.projectName ? (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{team.projectName}</h4>
                    {team.projectDescription && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {team.projectDescription}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">لم يتم تحديد المشروع بعد</p>
                )}

                {/* Status and Score */}
                <div className="flex items-center justify-between">
                  {getProjectStatusBadge(team)}
                  {team.averageScore && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">
                        {team.averageScore.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({team.evaluationCount} تقييم)
                      </span>
                    </div>
                  )}
                </div>

                {/* Team Members */}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {team.memberCount} عضو
                  </span>
                </div>

                {/* Project Links */}
                {(team.projectUrl || team.githubUrl || team.demoUrl) && (
                  <div className="flex gap-2">
                    {team.projectUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={team.projectUrl} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-4 h-4 ml-1" />
                          الموقع
                        </a>
                      </Button>
                    )}
                    {team.githubUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={team.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 ml-1" />
                          GitHub
                        </a>
                      </Button>
                    )}
                    {team.demoUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={team.demoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 ml-1" />
                          العرض
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
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

      {/* Edit Team Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل معلومات الفريق</DialogTitle>
            <DialogDescription>
              {selectedTeam && `تعديل معلومات فريق: ${selectedTeam.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم الفريق</Label>
                <Input
                  id="name"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="projectName">اسم المشروع</Label>
                <Input
                  id="projectName"
                  value={editData.projectName}
                  onChange={(e) => setEditData({...editData, projectName: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="projectDescription">وصف المشروع</Label>
              <Textarea
                id="projectDescription"
                value={editData.projectDescription}
                onChange={(e) => setEditData({...editData, projectDescription: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="projectUrl">رابط المشروع</Label>
                <Input
                  id="projectUrl"
                  value={editData.projectUrl}
                  onChange={(e) => setEditData({...editData, projectUrl: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="githubUrl">رابط GitHub</Label>
                <Input
                  id="githubUrl"
                  value={editData.githubUrl}
                  onChange={(e) => setEditData({...editData, githubUrl: e.target.value})}
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <Label htmlFor="demoUrl">رابط العرض التوضيحي</Label>
                <Input
                  id="demoUrl"
                  value={editData.demoUrl}
                  onChange={(e) => setEditData({...editData, demoUrl: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={editData.notes}
                onChange={(e) => setEditData({...editData, notes: e.target.value})}
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updating === selectedTeam?.id}
            >
              {updating === selectedTeam?.id ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
