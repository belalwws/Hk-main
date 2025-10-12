"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Trophy, 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  AlertCircle,
  ExternalLink
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

export default function SupervisorHackathons() {
  const { user } = useAuth()
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchHackathons()
  }, [])

  const fetchHackathons = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/hackathons/active", {
        credentials: 'include'
      })
      const data = await response.json()

      if (response.ok) {
        setHackathons(data.hackathons || [])
      } else {
        setError(data.error || "حدث خطأ في جلب البيانات")
      }
    } catch (error) {
      console.error("Error fetching hackathons:", error)
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'open': { label: 'مفتوح للتسجيل', color: 'bg-green-100 text-green-800' },
      'closed': { label: 'مغلق', color: 'bg-red-100 text-red-800' },
      'completed': { label: 'مكتمل', color: 'bg-gray-100 text-gray-800' },
      'draft': { label: 'مسودة', color: 'bg-yellow-100 text-yellow-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
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
          <p className="mt-4 text-gray-600">جاري تحميل الهاكاثونات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الهاكاثونات المتاحة</h1>
          <p className="text-gray-600 mt-2">
            استعرض الهاكاثونات المتاحة للإشراف عليها
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          للحصول على صلاحيات الإشراف على هاكاثون معين، يرجى التواصل مع الإدارة.
        </AlertDescription>
      </Alert>

      {/* Hackathons Grid */}
      {hackathons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((hackathon) => (
            <Card key={hackathon.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Trophy className="w-5 h-5 text-blue-600" />
                      {hackathon.title}
                    </CardTitle>
                    <div className="mt-2">
                      {getStatusBadge(hackathon.status)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-3">
                  {hackathon.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{hackathon.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{hackathon.currentParticipants} / {hackathon.maxParticipants} مشارك</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={hackathon.status !== 'open'}
                  >
                    <ExternalLink className="w-4 h-4 ml-2" />
                    عرض التفاصيل
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              لا توجد هاكاثونات متاحة حالياً
            </h3>
            <p className="text-gray-600">
              سيتم عرض الهاكاثونات المتاحة هنا عند إضافتها
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
