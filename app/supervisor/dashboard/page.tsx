"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Users,
  Trophy,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  Activity,
  UserCircle,
  MessageSquare
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
  hackathons?: Array<{
    id: string
    title: string
    status: string
    startDate: string
    endDate: string
  }>
  permissions?: any
  isProfileComplete: boolean
  assignmentCount?: number
  isGeneralSupervisor?: boolean
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
  const [shouldCheckAuth, setShouldCheckAuth] = useState(false)

  // Define fetchDashboardData using useCallback
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
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
  }, []) // Empty dependency array since it doesn't depend on any props/state

  // Wait for initial auth load before checking
  useEffect(() => {
    if (!authLoading) {
      console.log('✅ [Dashboard] Auth finished loading, enabling auth check')
      setShouldCheckAuth(true)
    }
  }, [authLoading])

  // Auth check - only runs after auth has finished loading at least once
  useEffect(() => {
    // Don't check until auth has loaded at least once
    if (!shouldCheckAuth) {
      console.log('⏳ [Dashboard] Waiting for initial auth load...')
      return
    }

    // Wait for auth to finish loading
    if (authLoading) {
      console.log('🔄 [Dashboard] Auth still loading...')
      return
    }

    if (!user) {
      console.log('❌ [Dashboard] No user found after auth loaded, redirecting to login')
      // Add a small delay to prevent immediate redirect loops
      setTimeout(() => {
        router.push('/login?redirect=/supervisor/dashboard')
      }, 100)
      return
    }

    if (user.role !== 'supervisor') {
      console.log('❌ [Dashboard] User is not supervisor, role:', user.role, 'redirecting to home')
      setTimeout(() => {
        router.push('/')
      }, 100)
      return
    }

    console.log('✅ [Dashboard] User authenticated as supervisor:', user.email)
    fetchDashboardData()
  }, [user, authLoading, router, fetchDashboardData, shouldCheckAuth]) // ✅ Include shouldCheckAuth

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
          {supervisor?.hackathons && supervisor.hackathons.length > 0
            ? `إدارة ${supervisor.hackathons.length} هاكاثون${supervisor.hackathons.length > 1 ? 'ات' : ''}`
            : supervisor?.hackathon
            ? `إدارة ${supervisor.hackathon.title}`
            : 'تابع أداء المشاركين والفرق'
          }
        </p>
        {supervisor?.department && (
          <Badge className="mt-2 bg-blue-500">{supervisor.department}</Badge>
        )}
      </div>

      {/* Hackathon Assignment Info */}
      {supervisor && (
        <>
          {supervisor.isGeneralSupervisor && (
            <Alert className="border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">مشرف عام</AlertTitle>
              <AlertDescription className="text-green-700">
                أنت مشرف عام على جميع الهاكاثونات. يمكنك الوصول لجميع البيانات والإحصائيات.
              </AlertDescription>
            </Alert>
          )}

          {!supervisor.isGeneralSupervisor && supervisor.hackathons && supervisor.hackathons.length === 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">مرحباً بك!</AlertTitle>
              <AlertDescription className="text-blue-700">
                لم يتم تعيينك لهاكاثون محدد بعد. يمكنك استخدام الأدوات العامة أو انتظار تعيينك من قبل الإدارة.
                <br />
                <strong>الأدوات المتاحة:</strong> إدارة المشاركين، إدارة الفرق، إرسال الرسائل، والتقارير.
              </AlertDescription>
            </Alert>
          )}

          {!supervisor.isGeneralSupervisor && supervisor.hackathons && supervisor.hackathons.length > 0 && (
            <Alert className="border-purple-200 bg-purple-50">
              <AlertCircle className="h-4 w-4 text-purple-600" />
              <AlertTitle className="text-purple-800">هاكاثوناتك المعينة</AlertTitle>
              <AlertDescription className="text-purple-700">
                أنت مشرف على {supervisor.hackathons.length} هاكاثون. يمكنك إدارة المشاركين والفرق في هذه الهاكاثونات.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

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

      {/* Assigned Hackathons */}
      {supervisor && supervisor.hackathons && supervisor.hackathons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-600" />
              الهاكاثونات المعينة ({supervisor.hackathons.length})
            </CardTitle>
            <CardDescription>
              الهاكاثونات التي تشرف عليها حالياً
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supervisor.hackathons.map((hackathon) => (
                <div key={hackathon.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{hackathon.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(hackathon.startDate).toLocaleDateString('ar-EG')} - {new Date(hackathon.endDate).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      hackathon.status === 'open' ? 'bg-green-100 text-green-800' :
                      hackathon.status === 'closed' ? 'bg-red-100 text-red-800' :
                      hackathon.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {hackathon.status === 'open' ? 'مفتوح' :
                     hackathon.status === 'closed' ? 'مغلق' :
                     hackathon.status === 'completed' ? 'مكتمل' : 'مسودة'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
            {recentActivity.length > 0 ? (
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
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>لا توجد أنشطة حديثة</p>
                {supervisor && (!supervisor.hackathons || supervisor.hackathons.length === 0) && !supervisor.isGeneralSupervisor && (
                  <p className="text-sm mt-2">
                    ستظهر الأنشطة هنا بعد تعيينك لهاكاثون
                  </p>
                )}
              </div>
            )}
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
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => router.push('/supervisor/participants')}
              >
                <Users className="w-6 h-6" />
                <span className="text-sm">مراجعة المشاركين</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 hover:bg-purple-50 hover:border-purple-300"
                onClick={() => router.push('/supervisor/teams')}
              >
                <Trophy className="w-6 h-6" />
                <span className="text-sm">إدارة الفرق</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 hover:bg-green-50 hover:border-green-300"
                onClick={() => router.push('/supervisor/messages')}
              >
                <MessageSquare className="w-6 h-6" />
                <span className="text-sm">إرسال رسائل</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 hover:bg-orange-50 hover:border-orange-300"
                onClick={() => router.push('/supervisor/reports')}
              >
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
