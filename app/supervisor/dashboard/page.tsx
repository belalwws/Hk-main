"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Trophy, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  AlertCircle,
  Calendar,
  Activity
} from "lucide-react"

interface DashboardStats {
  totalParticipants: number
  approvedParticipants: number
  pendingParticipants: number
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

export default function SupervisorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalParticipants: 0,
    approvedParticipants: 0,
    pendingParticipants: 0,
    totalTeams: 0,
    activeTeams: 0,
    completedProjects: 0
  })
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls - replace with actual API endpoints
      setStats({
        totalParticipants: 156,
        approvedParticipants: 142,
        pendingParticipants: 14,
        totalTeams: 38,
        activeTeams: 35,
        completedProjects: 28
      })

      setRecentActivity([
        {
          id: "1",
          type: "participant",
          message: "تم الموافقة على مشارك جديد: أحمد محمد",
          timestamp: "منذ 5 دقائق",
          status: "success"
        },
        {
          id: "2",
          type: "team",
          message: "فريق الابتكار قام بتسليم المشروع",
          timestamp: "منذ 15 دقيقة",
          status: "info"
        },
        {
          id: "3",
          type: "alert",
          message: "14 طلب مشاركة في انتظار المراجعة",
          timestamp: "منذ ساعة",
          status: "warning"
        }
      ])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
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

  if (loading) {
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">مرحباً بك في لوحة تحكم المشرف</h1>
        <p className="text-blue-100">
          تابع أداء المشاركين والفرق، وأدر العمليات اليومية للهاكاثون
        </p>
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
