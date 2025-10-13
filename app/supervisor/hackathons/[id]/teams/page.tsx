"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Mail
} from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  phone?: string
  role: string
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
}

interface Hackathon {
  id: string
  title: string
  status: string
}

export default function SupervisorTeamsPage() {
  const params = useParams()
  const router = useRouter()
  const hackathonId = params.id as string

  const [teams, setTeams] = useState<Team[]>([])
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

      {/* Teams List */}
      <div className="grid gap-4">
        {teams.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد فرق في هذا الهاكاثون</p>
            </CardContent>
          </Card>
        ) : (
          teams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{team.name}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {team.members.length} عضو
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(team.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Team Members */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">أعضاء الفريق</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {member.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{member.email}</div>
                        </div>
                        {member.role === 'leader' && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">قائد</Badge>
                        )}
                      </div>
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
          ))
        )}
      </div>
    </div>
  )
}
