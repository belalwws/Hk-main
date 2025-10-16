'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Download, CheckCircle2, XCircle, Eye, Users, Trash2, Send, Loader2, Mail } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import { useModal } from '@/hooks/use-modal'

interface Team {
  id: string
  name: string
  teamNumber: number
  ideaTitle: string | null
  ideaDescription: string | null
  ideaFile: string | null
  hackathonId: string
  hackathon: {
    id: string
    title: string
  }
  participants: Array<{
    id: string
    user: {
      name: string
      email: string
    }
  }>
}

export default function SupervisorPresentationsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [hackathons, setHackathons] = useState<any[]>([])
  const [selectedHackathon, setSelectedHackathon] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [sendingLink, setSendingLink] = useState<string | null>(null)
  const { showSuccess, showError, showConfirm } = useModal()
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [selectedHackathon])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch hackathons assigned to supervisor
      const hackathonsRes = await fetch('/api/supervisor/hackathons')
      if (hackathonsRes.ok) {
        const data = await hackathonsRes.json()
        const hackathonsArray = data.hackathons || []
        setHackathons(hackathonsArray)
        
        // Set first hackathon as default if available
        if (hackathonsArray.length > 0 && !selectedHackathon) {
          setSelectedHackathon(hackathonsArray[0].id)
          return // Don't fetch teams yet, let the next useEffect handle it
        }
      }

      // Only fetch teams if hackathon is selected
      if (!selectedHackathon) {
        setLoading(false)
        return
      }

      // Fetch teams based on selected hackathon
      const teamsUrl = `/api/supervisor/teams?hackathonId=${selectedHackathon}`
      
      const teamsRes = await fetch(teamsUrl)
      if (teamsRes.ok) {
        const data = await teamsRes.json()
        setTeams(data.teams || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTeams = teams

  const teamsWithPresentation = filteredTeams.filter(t => t.ideaFile)
  const teamsWithoutPresentation = filteredTeams.filter(t => !t.ideaFile)

  const handleDownload = (teamId: string, teamName: string) => {
    window.open(`/api/files/${teamId}`, '_blank')
  }

  const handleView = (teamId: string) => {
    window.open(`/api/files/${teamId}`, '_blank')
  }

  const sendUploadLink = async (participantId: string, teamName: string) => {
    try {
      setSendingLink(participantId)
      const response = await fetch(`/api/admin/participants/${participantId}/send-upload-link`, {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "✅ تم الإرسال",
          description: data.emailSent
            ? `تم إرسال رابط رفع العرض التقديمي لفريق ${teamName}`
            : "تم إنشاء الرابط ولكن لم يتم إرسال الإيميل (SMTP غير مفعل)"
        })
        fetchData() // Refresh data
      } else {
        toast({
          title: "❌ خطأ",
          description: data.error || 'فشل في إرسال الرابط',
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error sending upload link:', error)
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ في إرسال الرابط",
        variant: "destructive"
      })
    } finally {
      setSendingLink(null)
    }
  }

  const sendBulkUploadLinks = async () => {
    const confirmMessage = `هل تريد إرسال روابط الرفع لجميع الفرق التي لم ترفع بعد؟\n\nسيتم الإرسال لـ ${teamsWithoutPresentation.length} فريق`

    if (!confirm(confirmMessage)) return

    toast({
      title: "⏳ جاري الإرسال...",
      description: `إرسال الروابط لـ ${teamsWithoutPresentation.length} فريق`
    })

    let successCount = 0
    let failCount = 0

    for (const team of teamsWithoutPresentation) {
      if (team.participants.length > 0) {
        try {
          const response = await fetch(`/api/admin/participants/${team.participants[0].id}/send-upload-link`, {
            method: 'POST',
            credentials: 'include'
          })

          if (response.ok) {
            successCount++
          } else {
            failCount++
          }
        } catch (error) {
          failCount++
        }
      }
    }

    toast({
      title: successCount > 0 ? "✅ تم الإرسال" : "❌ فشل الإرسال",
      description: `تم إرسال ${successCount} رابط بنجاح${failCount > 0 ? ` وفشل ${failCount}` : ''}`
    })

    fetchData() // Refresh data
  }

  const handleDelete = async (teamId: string, teamName: string) => {
    showConfirm({
      title: '🗑️ تأكيد الحذف',
      message: `هل أنت متأكد من حذف العرض التقديمي للفريق "${teamName}"؟\n\nسيتمكن الفريق من رفع عرض جديد بعد الحذف.`,
      type: 'danger',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      onConfirm: async () => {
        setDeleting(teamId)
        try {
          const response = await fetch(`/api/supervisor/teams/${teamId}/delete-presentation`, {
            method: 'DELETE'
          })

          if (response.ok) {
            showSuccess('تم حذف العرض التقديمي بنجاح')
            fetchData()
          } else {
            const error = await response.json()
            showError(error.error || 'فشل في حذف العرض التقديمي')
          }
        } catch (error) {
          console.error('Error deleting presentation:', error)
          showError('حدث خطأ في حذف العرض التقديمي')
        } finally {
          setDeleting(null)
        }
      }
    })
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          متابعة العروض التقديمية
        </h1>
        <p className="text-gray-600">
          تتبع الفرق التي رفعت عروضها التقديمية
        </p>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-gray-700 font-medium">اختر الهاكاثون:</label>
              <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="اختر هاكاثون" />
                </SelectTrigger>
                <SelectContent>
                  {hackathons.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedHackathon && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {hackathons.find(h => h.id === selectedHackathon)?.title}
                </Badge>
              )}
            </div>

            {teamsWithoutPresentation.length > 0 && (
              <Button
                onClick={sendBulkUploadLinks}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 ml-2" />
                إرسال جماعي للروابط ({teamsWithoutPresentation.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">إجمالي الفرق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{filteredTeams.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">رفعوا العروض</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{teamsWithPresentation.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">لم يرفعوا</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{teamsWithoutPresentation.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Teams with presentations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            الفرق التي رفعت العروض ({teamsWithPresentation.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamsWithPresentation.length === 0 ? (
            <p className="text-center text-gray-500 py-8">لا توجد فرق رفعت عروضها بعد</p>
          ) : (
            <div className="space-y-4">
              {teamsWithPresentation.map((team) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{team.name}</h3>
                        <Badge className="bg-green-100 text-green-800">تم الرفع</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>الهاكاثون:</strong> {team.hackathon.title}
                      </p>
                      {team.ideaTitle && (
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>عنوان الفكرة:</strong> {team.ideaTitle}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{team.participants.length} أعضاء</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(team.id)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        عرض
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(team.id, team.name)}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        تحميل
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(team.id, team.name)}
                        disabled={deleting === team.id}
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teams without presentations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            الفرق التي لم ترفع العروض ({teamsWithoutPresentation.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamsWithoutPresentation.length === 0 ? (
            <p className="text-center text-green-600 py-8">جميع الفرق رفعت عروضها! 🎉</p>
          ) : (
            <div className="space-y-4">
              {teamsWithoutPresentation.map((team) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 bg-red-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{team.name}</h3>
                        <Badge className="bg-red-100 text-red-800">لم يرفع</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>الهاكاثون:</strong> {team.hackathon.title}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{team.participants.length} أعضاء</span>
                      </div>
                    </div>

                    {team.participants.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 hover:text-blue-700 border-blue-600 hover:bg-blue-50"
                        onClick={() => sendUploadLink(team.participants[0].id, team.name)}
                        disabled={sendingLink === team.participants[0].id}
                      >
                        {sendingLink === team.participants[0].id ? (
                          <>
                            <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                            جاري الإرسال...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 ml-1" />
                            إرسال رابط الرفع
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

