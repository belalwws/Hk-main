"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Award,
  Mail,
  CheckCircle,
  Clock,
  User,
  Search,
  Download,
  FileImage,
  AlertCircle
} from "lucide-react"

interface Judge {
  id: string
  userId: string
  hackathonId: string
  certificateUrl: string | null
  certificateSent: boolean
  certificateSentAt: string | null
  user: {
    name: string
    email: string
  }
  hackathon: {
    title: string
  }
}

interface Supervisor {
  id: string
  userId: string
  hackathonId: string | null
  certificateUrl: string | null
  certificateSent: boolean
  certificateSentAt: string | null
  user: {
    name: string
    email: string
  }
  hackathon: {
    title: string
  } | null
}

export default function SupervisorCertificatesManagement() {
  const [judges, setJudges] = useState<Judge[]>([])
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch judges and supervisors for hackathons assigned to this supervisor
      const [judgesRes, supervisorsRes] = await Promise.all([
        fetch('/api/supervisor/certificates/judges'),
        fetch('/api/supervisor/certificates/supervisors')
      ])

      if (judgesRes.ok) {
        const data = await judgesRes.json()
        setJudges(data.judges || [])
      }

      if (supervisorsRes.ok) {
        const data = await supervisorsRes.json()
        setSupervisors(data.supervisors || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterData = (data: any[]) => {
    return data.filter(item =>
      item.user.name.toLowerCase().includes(search.toLowerCase()) ||
      item.user.email.toLowerCase().includes(search.toLowerCase())
    )
  }

  const renderTable = (data: any[], type: 'judge' | 'supervisor') => (
    <div className="space-y-4">
      {data.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد بيانات</h3>
            <p className="text-gray-600">لم يتم العثور على {type === 'judge' ? 'محكمين' : 'مشرفين'}</p>
          </CardContent>
        </Card>
      ) : (
        filterData(data).map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-lg">{item.user.name}</h3>
                    {item.certificateUrl && (
                      <Badge className="bg-green-100 text-green-800">
                        <FileImage className="w-3 h-3 ml-1" />
                        شهادة محملة
                      </Badge>
                    )}
                    {item.certificateSent && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <CheckCircle className="w-3 h-3 ml-1" />
                        تم الإرسال
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {item.user.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      {item.hackathon?.title || 'مشرف عام'}
                    </div>
                    {item.certificateSentAt && (
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <Clock className="w-3 h-3" />
                        تم الإرسال في: {new Date(item.certificateSentAt).toLocaleDateString('ar-EG')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mr-4">
                  {item.certificateUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <a href={item.certificateUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 ml-1" />
                        عرض الشهادة
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 font-semibold">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  const judgesWithCerts = judges.filter(j => j.certificateUrl).length
  const judgesSent = judges.filter(j => j.certificateSent).length
  const supervisorsWithCerts = supervisors.filter(s => s.certificateUrl).length
  const supervisorsSent = supervisors.filter(s => s.certificateSent).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Award className="w-8 h-8" />
          متابعة الشهادات
        </h1>
        <p className="text-gray-600">
          متابعة حالة الشهادات للمحكمين والمشرفين
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          يمكنك متابعة حالة الشهادات فقط. لرفع أو إرسال الشهادات، يرجى التواصل مع الأدمن.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">محكمين - شهادات محملة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{judgesWithCerts} / {judges.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">محكمين - تم الإرسال</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{judgesSent} / {judges.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">مشرفين - شهادات محملة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{supervisorsWithCerts} / {supervisors.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">مشرفين - تم الإرسال</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{supervisorsSent} / {supervisors.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="ابحث بالاسم أو البريد الإلكتروني..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="judges" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="judges">
            المحكمين ({judges.length})
          </TabsTrigger>
          <TabsTrigger value="supervisors">
            المشرفين ({supervisors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="judges" className="mt-6">
          {renderTable(judges, 'judge')}
        </TabsContent>

        <TabsContent value="supervisors" className="mt-6">
          {renderTable(supervisors, 'supervisor')}
        </TabsContent>
      </Tabs>
    </div>
  )
}

