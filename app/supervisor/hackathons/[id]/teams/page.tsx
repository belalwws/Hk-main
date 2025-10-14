"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import {
  Users,
  ArrowLeft,
  ExternalLink,
  Github,
  FileText,
  Video,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  GripVertical,
  Trash2,
  Eye,
  Phone,
  MapPin,
  User
} from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  phone?: string
  participantId: string
  user?: {
    city?: string
    nationality?: string
  }
}

interface Team {
  id: string
  name: string
  status: string
  submissionUrl?: string
  presentationUrl?: string
  demoUrl?: string
  githubUrl?: string
  createdAt: string
  members: TeamMember[]
  participants?: any[]
}

interface Hackathon {
  id: string
  title: string
  status: string
}

// Draggable Member Component
function DraggableMember({
  member,
  teamId,
  onViewDetails,
  onRemove
}: {
  member: TeamMember
  teamId: string
  onViewDetails: (member: TeamMember) => void
  onRemove: (teamId: string, participantId: string, name: string) => void
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('application/json', JSON.stringify({
          participantId: member.participantId,
          sourceTeamId: teamId,
          memberName: member.name
        }))
      }}
      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-move border border-transparent hover:border-blue-300 transition-all"
    >
      <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {member.name.charAt(0).toUpperCase()}
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
            onViewDetails(member)
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
            onRemove(teamId, member.participantId, member.name)
          }}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// Droppable Team Component
function DroppableTeam({
  team,
  children,
  onDrop
}: {
  team: Team
  children: React.ReactNode
  onDrop: (teamId: string, data: any) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: team.id,
    data: {
      type: 'team',
      team
    }
  })

  return (
    <div
      ref={setNodeRef}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      }}
      onDrop={(e) => {
        e.preventDefault()
        const data = e.dataTransfer.getData('application/json')
        if (data) {
          onDrop(team.id, JSON.parse(data))
        }
      }}
      className={`min-h-[200px] transition-all ${isOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
    >
      {children}
    </div>
  )
}

export default function SupervisorTeamsPage() {
  const params = useParams()
  const router = useRouter()
  const hackathonId = params.id as string

  const [teams, setTeams] = useState<Team[]>([])
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    fetchTeams()
  }, [hackathonId])

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/supervisor/hackathons/${hackathonId}/teams`)
      const data = await response.json()

      if (response.ok) {
        setTeams(data.teams || [])
        setHackathon(data.hackathon)
      } else {
        setError(data.error || "حدث خطأ في جلب الفرق")
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = async (targetTeamId: string, data: any) => {
    const { participantId, sourceTeamId, memberName } = data

    // Don't do anything if dropping on the same team
    if (sourceTeamId === targetTeamId) return

    // Move member between teams
    await moveMemberToTeam(participantId, sourceTeamId, targetTeamId, memberName)
  }

  const moveMemberToTeam = async (participantId: string, sourceTeamId: string, targetTeamId: string, memberName?: string) => {
    try {
      setSuccess("")
      setError("")

      const response = await fetch(
        `/api/supervisor/hackathons/${hackathonId}/teams/${sourceTeamId}/members/${participantId}/move`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetTeamId })
        }
      )

      const data = await response.json()

      if (response.ok) {
        setSuccess("تم نقل العضو بنجاح")
        fetchTeams() // Refresh teams
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.error || "حدث خطأ في نقل العضو")
      }
    } catch (error) {
      console.error("Error moving member:", error)
      setError("حدث خطأ في الاتصال بالخادم")
    }
  }

  const removeMemberFromTeam = async (teamId: string, participantId: string, memberName: string) => {
    if (!confirm(`هل أنت متأكد من إزالة ${memberName} من الفريق؟`)) return

    try {
      setSuccess("")
      setError("")

      const response = await fetch(
        `/api/supervisor/hackathons/${hackathonId}/teams/${teamId}/members/${participantId}`,
        {
          method: 'DELETE'
        }
      )

      const data = await response.json()

      if (response.ok) {
        setSuccess("تم إزالة العضو بنجاح")
        fetchTeams()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.error || "حدث خطأ في إزالة العضو")
      }
    } catch (error) {
      console.error("Error removing member:", error)
      setError("حدث خطأ في الاتصال بالخادم")
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/supervisor/hackathons/${hackathonId}`)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            رجوع
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">فرق الهاكاثون</h1>
            {hackathon && (
              <p className="text-gray-600">{hackathon.title}</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Alert className="border-blue-200 bg-blue-50">
        <AlertDescription className="text-blue-800">
          💡 يمكنك سحب الأعضاء وإفلاتهم بين الفرق لنقلهم
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
              {teams.filter(t => t.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">مشاريع مسلمة</div>
            <div className="text-2xl font-bold text-purple-600">
              {teams.filter(t => t.submissionUrl).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">مشاريع مكتملة</div>
            <div className="text-2xl font-bold text-indigo-600">
              {teams.filter(t => t.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams List with Drag and Drop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {teams.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد فرق في هذا الهاكاثون</p>
            </CardContent>
          </Card>
        ) : (
          teams.map((team) => (
            <DroppableTeam key={team.id} team={team} onDrop={handleDrop}>
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg truncate">{team.name}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {team.members.length} عضو
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(team.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Team Members - Draggable */}
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      أعضاء الفريق
                    </h4>
                    <div className="space-y-2">
                      {team.members.map((member) => (
                        <DraggableMember
                          key={member.participantId}
                          member={member}
                          teamId={team.id}
                          onViewDetails={(m) => {
                            setSelectedMember(m)
                            setDetailsDialogOpen(true)
                          }}
                          onRemove={removeMemberFromTeam}
                        />
                      ))}
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
                            رابط المشروع
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
                            <Github className="w-4 h-4" />
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
                            العرض التقديمي
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
                            <Video className="w-4 h-4" />
                            فيديو توضيحي
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                  {/* Created Date */}
                  <div className="text-xs text-gray-500">
                    تم الإنشاء: {new Date(team.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </CardContent>
              </Card>
            </DroppableTeam>
          ))
        )}
      </div>

      {/* Member Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
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
                  {selectedMember.name.charAt(0).toUpperCase()}
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
  )
}
