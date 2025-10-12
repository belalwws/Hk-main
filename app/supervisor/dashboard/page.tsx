"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Trophy,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  Calendar,
  Activity,
  UserCircle
} from "lucide-react"

interface DashboardStats {
  totalParticipants: number
  approvedParticipants: number
  pendingParticipants: number
  rejectedParticipants: number
  totalTeams: number
  activeTeams: number
  completedProjects: number
}

interface RecentActivity {
  id: string
  type: string
  message: string
  timestamp: string
  status: "info" | "success" | "warning" | "error"
}

interface SupervisorInfo {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
  department?: string
  hackathon?: {
    id: string
    title: string
    status: string
  }
  permissions?: any
  isProfileComplete: boolean
}

export default function SupervisorDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalParticipants: 0,
    approvedParticipants: 0,
    pendingParticipants: 0,
    rejectedParticipants: 0,
    totalTeams: 0,
    activeTeams: 0,
    completedProjects: 0
  })

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [supervisor, setSupervisor] = useState<SupervisorInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Auth check
  useEffect(() => {
    if (authLoading) {
      console.log('🔄 [Dashboard] Auth still loading...')
      return
    }

    if (!user) {
      console.log('❌ [Dashboard] No user found, redirecting to login')
      router.push('/login?redirect=/supervisor/dashboard')
      return
    }

    if (user.role !== 'supervisor') {
      console.log('❌ [Dashboard] User is not supervisor, role:', user.role, 'redirecting to home')
      router.push('/')
      return
    }

    console.log('✅ [Dashboard] User authenticated as supervisor:', user.email)
    fetchDashboardData()
  }, [user, authLoading]) // ✅ Remove router from dependencies

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/supervisor/dashboard", {
        credentials: 'include' // ✅ Include cookies
      })
      const data = await response.json()

      if (response.ok) {
        setStats(data.stats)
        setRecentActivity(data.recentActivity)
        setSupervisor(data.supervisor)

        // Check if profile is complete
        if (data.supervisor && !data.supervisor.isProfileComplete) {
          setError("يرجى إكمال بياناتك الشخصية للوصول الكامل للنظام")
        }
      } else {
        setError(data.error || "حدث خطأ في جلب البيانات")
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "participant":
        return <Users className="w-4 h-4" />
      case "team":
        return <Trophy className="w-4 h-4" />
      case "alert":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50"
      case "warning":
        return "text-yellow-600 bg-yellow-50"
      case "error":
        return "text-red-600 bg-red-50"
      default:
        return "text-blue-600 bg-blue-50"
    }
  }

  // Show loading while auth is loading OR data is loading
  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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

  // Don't render if no user (will redirect)
  if (!user || user.role !== 'supervisor') {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Profile Incomplete Warning */}
      {supervisor && !supervisor.isProfileComplete && (
        <Alert className="border-orange-200 bg-orange-50">
          <UserCircle className="w-4 h-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <Button size="sm" onClick={() => router.push('/supervisor/profile')} className="bg-orange-600 hover:bg-orange-700">
                إكمال البيانات
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          مرحباً {supervisor?.name || 'بك'} في لوحة تحكم المشرف
        </h1>
        <p className="text-blue-100">
          {supervisor?.hackathon ? `إدارة ${supervisor.hackathon.title}` : 'تابع أداء المشاركين والفرق'}
        </p>
        {supervisor?.department && (
          <Badge className="mt-2 bg-blue-500">{supervisor.department}</Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي المشاركين</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalParticipants}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4" />
                  +12% من الأسبوع الماضي
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">المشاركين المعتمدين</p>
                <p className="text-3xl font-bold text-green-600">{stats.approvedParticipants}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.pendingParticipants} في انتظار المراجعة
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي الفرق</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalTeams}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.activeTeams} فريق نشط
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">الطلبات المعلقة</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingParticipants}</p>
                <p className="text-sm text-yellow-600 mt-1">
                  تحتاج مراجعة
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">المشاريع المكتملة</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.completedProjects}</p>
                <p className="text-sm text-gray-500 mt-1">
                  من {stats.totalTeams} فريق
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">معدل الإنجاز</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {Math.round((stats.completedProjects / stats.totalTeams) * 100)}%
                </p>
                <p className="text-sm text-emerald-600 mt-1">
                  أداء ممتاز
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              النشاط الأخير
            </CardTitle>
            <CardDescription>
              آخر الأحداث والتحديثات في النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
            <CardDescription>
              الإجراءات الأكثر استخداماً
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Users className="w-6 h-6" />
                <span className="text-sm">مراجعة المشاركين</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Trophy className="w-6 h-6" />
                <span className="text-sm">إدارة الفرق</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Calendar className="w-6 h-6" />
                <span className="text-sm">جدولة الأحداث</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Activity className="w-6 h-6" />
                <span className="text-sm">عرض التقارير</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
