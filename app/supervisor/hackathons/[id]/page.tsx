"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Trophy,
  ArrowRight,
  Calendar,
  MapPin,
  Target,
  CheckCircle,
  Clock,
  XCircle,
  Settings,
  UserPlus,
  Shuffle,
  AlertCircle
} from "lucide-react"

interface Hackathon {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  status: string
  maxParticipants: number
  currentParticipants: number
}

interface Stats {
  totalParticipants: number
  approvedParticipants: number
  pendingParticipants: number
  rejectedParticipants: number
  totalTeams: number
  activeTeams: number
}

export default function SupervisorHackathonDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const hackathonId = resolvedParams.id
  const router = useRouter()

  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [stats, setStats] = useState<Stats>({
    totalParticipants: 0,
    approvedParticipants: 0,
    pendingParticipants: 0,
    rejectedParticipants: 0,
    totalTeams: 0,
    activeTeams: 0
  })
  const [loading, setLoading] = useState(true)
  const [creatingTeams, setCreatingTeams] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchData()
  }, [hackathonId])

  const fetchData = async () => {
    try {
      setLoading(true)

      const [hackathonRes, statsRes] = await Promise.all([
        fetch(`/api/hackathons/${hackathonId}`, { credentials: 'include' }),
        fetch(`/api/supervisor/hackathons/${hackathonId}/stats`, { credentials: 'include' })
      ])

      if (hackathonRes.ok) {
        const data = await hackathonRes.json()
        setHackathon(data.hackathon)
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("حدث خطأ في جلب البيانات")
    } finally {
      setLoading(false)
    }
  }

  const handleAutoCreateTeams = async () => {
    if (!confirm(`هل أنت متأكد من تكوين الفرق تلقائياً؟\n\nسيتم توزيع المشاركين المقبولين (${stats.approvedParticipants}) على فرق متوازنة.`)) {
      return
    }

    setCreatingTeams(true)
    try {
      const response = await fetch(`/api/supervisor/hackathons/${hackathonId}/teams/auto-create`, {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ تم تكوين الفرق بنجاح!\n\nعدد الفرق المنشأة: ${data.teams.length}\nعدد الأعضاء: ${data.totalMembers}`)
        await fetchData()
      } else {
        alert(`❌ خطأ: ${data.error}`)
      }
    } catch (error) {
      alert("حدث خطأ في تكوين الفرق")
    } finally {
      setCreatingTeams(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!hackathon) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error || "الهاكاثون غير موجود"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            رجوع
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{hackathon.title}</h1>
          <p className="text-gray-600 mt-2">{hackathon.description}</p>
        </div>
        <Badge className={
          hackathon.status === 'open' ? 'bg-green-100 text-green-800' :
          hackathon.status === 'closed' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }>
          {hackathon.status === 'open' ? 'مفتوح' : hackathon.status === 'closed' ? 'مغلق' : 'مكتمل'}
        </Badge>
      </div>

      {/* Hackathon Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">تاريخ البداية</p>
                <p className="font-semibold">{formatDate(hackathon.startDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-500">تاريخ النهاية</p>
                <p className="font-semibold">{formatDate(hackathon.endDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">الموقع</p>
                <p className="font-semibold">{hackathon.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              إجمالي المشاركين
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalParticipants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              مقبول
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.approvedParticipants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              قيد الانتظار
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pendingParticipants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              مرفوض
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.rejectedParticipants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              إجمالي الفرق
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalTeams}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              فرق نشطة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">{stats.activeTeams}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
          <CardDescription>إدارة الهاكاثون والمشاركين والفرق</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => router.push(`/supervisor/hackathons/${hackathonId}/participants`)}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              إدارة المشاركين
            </Button>

            <Button
              onClick={() => router.push(`/supervisor/hackathons/${hackathonId}/teams`)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              إدارة الفرق
            </Button>

            <Button
              onClick={handleAutoCreateTeams}
              disabled={creatingTeams || stats.approvedParticipants === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              {creatingTeams ? "جاري التكوين..." : "تكوين تلقائي للفرق"}
            </Button>

            <Button
              onClick={() => router.push(`/supervisor/hackathons/${hackathonId}/settings`)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              إعدادات التكوين
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      {stats.approvedParticipants > 0 && stats.totalTeams === 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            لديك {stats.approvedParticipants} مشارك مقبول بدون فريق. استخدم "تكوين تلقائي للفرق" لتوزيعهم على فرق متوازنة.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
