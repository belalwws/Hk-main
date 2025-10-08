'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Download, CheckCircle2, XCircle, Eye, Users, Trash2 } from 'lucide-react'
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

export default function PresentationsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [hackathons, setHackathons] = useState<any[]>([])
  const [selectedHackathon, setSelectedHackathon] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { showSuccess, showError, showConfirm, ModalComponents } = useModal()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch hackathons
      const hackathonsRes = await fetch('/api/admin/hackathons')
      if (hackathonsRes.ok) {
        const data = await hackathonsRes.json()
        setHackathons(data.hackathons || [])
      }

      // Fetch all teams
      const teamsRes = await fetch('/api/admin/teams')
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

  const filteredTeams = selectedHackathon === 'all'
    ? teams
    : teams.filter(t => t.hackathonId === selectedHackathon)

  const teamsWithPresentation = filteredTeams.filter(t => t.ideaFile)
  const teamsWithoutPresentation = filteredTeams.filter(t => !t.ideaFile)

  const handleDownload = (fileUrl: string, teamName: string) => {
    // For Cloudinary URLs, add fl_attachment flag to force download
    let downloadUrl = fileUrl

    if (fileUrl.includes('cloudinary.com')) {
      // Insert fl_attachment before the file path
      downloadUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/')
    }

    // Open in new tab (will download due to fl_attachment flag)
    window.open(downloadUrl, '_blank')
  }

  const handleDelete = async (teamId: string, teamName: string) => {
    showConfirm(
      `هل أنت متأكد من حذف العرض التقديمي للفريق "${teamName}"؟\n\nسيتمكن الفريق من رفع عرض جديد بعد الحذف.`,
      async () => {
        setDeleting(teamId)
        try {
          const response = await fetch(`/api/admin/teams/${teamId}/delete-presentation`, {
            method: 'DELETE'
          })

          if (response.ok) {
            showSuccess('تم حذف العرض التقديمي بنجاح')
            fetchData() // Reload data
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
      },
      '🗑️ تأكيد الحذف',
      'حذف',
      'إلغاء',
      'danger'
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#01645e] font-semibold">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-[#01645e] mb-2">
            متابعة العروض التقديمية
          </h1>
          <p className="text-[#8b7632]">
            تتبع الفرق التي رفعت عروضها التقديمية
          </p>
        </motion.div>

        {/* Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <label className="text-[#01645e] font-medium">الهاكاثون:</label>
              <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الهاكاثونات</SelectItem>
                  {hackathons.map(h => (
                    <SelectItem key={h.id} value={h.id}>{h.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-[#01645e]" />
                إجمالي الفرق
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#01645e]">{filteredTeams.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                رفعوا العرض
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{teamsWithPresentation.length}</p>
              <p className="text-sm text-gray-500">
                {filteredTeams.length > 0 ? Math.round((teamsWithPresentation.length / filteredTeams.length) * 100) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                لم يرفعوا
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{teamsWithoutPresentation.length}</p>
              <p className="text-sm text-gray-500">
                {filteredTeams.length > 0 ? Math.round((teamsWithoutPresentation.length / filteredTeams.length) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Teams with Presentations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              الفرق التي رفعت العرض ({teamsWithPresentation.length})
            </CardTitle>
            <CardDescription>
              الفرق التي قامت برفع عروضها التقديمية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamsWithPresentation.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا توجد فرق رفعت عروضها بعد</p>
              ) : (
                teamsWithPresentation.map(team => (
                  <div
                    key={team.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-[#01645e]">{team.name}</h3>
                          <Badge className="bg-green-600">رفع العرض</Badge>
                        </div>
                        {team.ideaTitle && (
                          <p className="text-sm text-[#8b7632] mb-1">
                            <strong>العنوان:</strong> {team.ideaTitle}
                          </p>
                        )}
                        {team.ideaDescription && (
                          <p className="text-sm text-gray-600 mb-2">
                            {team.ideaDescription}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mb-1">
                          الأعضاء: {team.participants.map(p => p.user.name).join(', ')}
                        </p>
                        {team.ideaFile && (
                          <p className="text-xs text-gray-400">
                            📎 {team.ideaFile.split('/').pop()?.split('?')[0]}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => window.open(team.ideaFile!, '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 ml-2" />
                          عرض
                        </Button>
                        <Button
                          onClick={() => handleDownload(team.ideaFile!, team.name)}
                          className="bg-gradient-to-r from-[#01645e] to-[#3ab666]"
                          size="sm"
                        >
                          <Download className="w-4 h-4 ml-2" />
                          تحميل
                        </Button>
                        <Button
                          onClick={() => handleDelete(team.id, team.name)}
                          disabled={deleting === team.id}
                          variant="destructive"
                          size="sm"
                        >
                          {deleting === team.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                              جاري...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 ml-2" />
                              حذف
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Teams without Presentations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-600" />
              الفرق التي لم ترفع العرض ({teamsWithoutPresentation.length})
            </CardTitle>
            <CardDescription>
              الفرق التي لم تقم برفع عروضها التقديمية بعد
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamsWithoutPresentation.length === 0 ? (
                <p className="text-center text-green-600 py-8">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                  رائع! جميع الفرق رفعت عروضها
                </p>
              ) : (
                teamsWithoutPresentation.map(team => (
                  <div
                    key={team.id}
                    className="border border-red-200 rounded-lg p-4 bg-red-50/50"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-red-700">{team.name}</h3>
                      <Badge variant="destructive">لم يرفع</Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      الأعضاء: {team.participants.map(p => p.user.name).join(', ')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ModalComponents />
    </div>
  )
}

