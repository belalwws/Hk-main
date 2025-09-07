"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Mail, User, Crown, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TeamMember {
  id: string
  user: {
    name: string
    email: string
    preferredRole: string
  }
}

interface Team {
  id: string
  name: string
  createdAt: string
  members: TeamMember[]
}

interface TeamsDisplayProps {
  hackathonId: string
}

export default function TeamsDisplay({ hackathonId }: TeamsDisplayProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeams()
  }, [hackathonId])

  const fetchTeams = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/teams`)
      if (response.ok) {
        const data = await response.json()
        setTeams(data.teams || [])
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`هل أنت متأكد من حذف ${teamName}؟\n\nسيتم إلغاء تعيين جميع الأعضاء من الفريق.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/teams/${teamId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTeams() // Refresh teams
        alert(`تم حذف ${teamName} بنجاح`)
      } else {
        alert('فشل في حذف الفريق')
      }
    } catch (error) {
      console.error('Error deleting team:', error)
      alert('حدث خطأ في حذف الفريق')
    }
  }

  const sendTeamEmails = async (teamId: string, teamName: string) => {
    if (!confirm(`هل تريد إرسال إيميلات لجميع أعضاء ${teamName}؟`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/teams/${teamId}/send-emails`, {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        alert(`تم إرسال الإيميلات بنجاح!\n\nتم إرسال: ${result.emailsSent} إيميل`)
      } else {
        alert('فشل في إرسال الإيميلات')
      }
    } catch (error) {
      console.error('Error sending team emails:', error)
      alert('حدث خطأ في إرسال الإيميلات')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#8b7632]">جاري تحميل الفرق...</p>
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-[#01645e] mb-2">لا توجد فرق</h3>
        <p className="text-[#8b7632]">لم يتم تكوين أي فرق بعد. استخدم زر "تكوين الفرق تلقائياً" لإنشاء الفرق.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#01645e]">
          الفرق المكونة ({teams.length} فريق)
        </h3>
        <Badge variant="outline" className="text-[#3ab666] border-[#3ab666]">
          إجمالي الأعضاء: {teams.reduce((total, team) => total + team.members.length, 0)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team, index) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-[#01645e] flex items-center gap-2">
                    <Crown className="w-5 h-5 text-[#c3e956]" />
                    {team.name}
                  </CardTitle>
                  <Badge className="bg-[#3ab666] text-white">
                    {team.members.length} أعضاء
                  </Badge>
                </div>
                <CardDescription>
                  تم الإنشاء: {new Date(team.createdAt).toLocaleDateString('ar-SA')}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Team Members */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-[#01645e] text-sm">أعضاء الفريق:</h4>
                  {team.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <User className="w-4 h-4 text-[#3ab666]" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[#01645e] truncate">
                          {member.user.name}
                        </p>
                        <p className="text-xs text-[#8b7632] truncate">
                          {member.user.preferredRole}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Team Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => sendTeamEmails(team.id, team.name)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Mail className="w-3 h-3 ml-1" />
                    إرسال إيميلات
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteTeam(team.id, team.name)}
                    className="text-red-600 hover:text-red-700 border-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <h4 className="font-semibold text-[#01645e] mb-3">إحصائيات الفرق:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-[#3ab666]">{teams.length}</p>
            <p className="text-sm text-[#8b7632]">إجمالي الفرق</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#3ab666]">
              {teams.reduce((total, team) => total + team.members.length, 0)}
            </p>
            <p className="text-sm text-[#8b7632]">إجمالي الأعضاء</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#3ab666]">
              {teams.length > 0 ? Math.round(teams.reduce((total, team) => total + team.members.length, 0) / teams.length) : 0}
            </p>
            <p className="text-sm text-[#8b7632]">متوسط الأعضاء</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#3ab666]">
              {Math.max(...teams.map(team => team.members.length), 0)}
            </p>
            <p className="text-sm text-[#8b7632]">أكبر فريق</p>
          </div>
        </div>
      </div>
    </div>
  )
}
