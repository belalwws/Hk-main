'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, UserPlus, Mail, Phone, Briefcase, CheckCircle2, XCircle, Edit, Trash2, Plus, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Judge {
  id: string
  userId: string
  isActive: boolean
  createdAt: string
  user: {
    name: string
    email: string
    phone: string
    role: string
  }
  _count: {
    evaluations: number
  }
}

export default function SupervisorJudgesPage() {
  const [judges, setJudges] = useState<Judge[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')

  useEffect(() => {
    fetchJudges()
  }, [])

  const fetchJudges = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/supervisor/judges', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setJudges(data.judges || [])
      }
    } catch (error) {
      console.error('Error fetching judges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteJudge = async () => {
    if (!inviteEmail || !inviteName) {
      alert('يرجى إدخال الاسم والبريد الإلكتروني')
      return
    }

    try {
      setInviting(true)
      const response = await fetch('/api/admin/judges/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          message: inviteMessage
        }),
        credentials: 'include'
      })

      if (response.ok) {
        alert('✅ تم إرسال الدعوة بنجاح')
        setInviteDialogOpen(false)
        setInviteEmail('')
        setInviteName('')
        setInviteMessage('')
        fetchJudges()
      } else {
        const data = await response.json()
        alert(`❌ ${data.error || 'فشل إرسال الدعوة'}`)
      }
    } catch (error) {
      console.error('Error inviting judge:', error)
      alert('حدث خطأ في إرسال الدعوة')
    } finally {
      setInviting(false)
    }
  }

  const toggleJudgeStatus = async (judgeId: string, currentStatus: boolean) => {
    if (!confirm(`هل تريد ${currentStatus ? 'تعطيل' : 'تفعيل'} هذا المحكم؟`)) return

    try {
      const response = await fetch(`/api/admin/judges/${judgeId}/toggle`, {
        method: 'PATCH',
        credentials: 'include'
      })

      if (response.ok) {
        alert(`تم ${currentStatus ? 'تعطيل' : 'تفعيل'} المحكم بنجاح`)
        fetchJudges()
      } else {
        alert('فشل في تحديث حالة المحكم')
      }
    } catch (error) {
      console.error('Error toggling judge status:', error)
      alert('حدث خطأ في تحديث حالة المحكم')
    }
  }

  const filteredJudges = judges.filter(judge =>
    judge.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    judge.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: judges.length,
    active: judges.filter(j => j.isActive).length,
    inactive: judges.filter(j => !j.isActive).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
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
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-[#01645e]">إدارة المحكمين</h1>
            <p className="text-[#8b7632] text-lg">عرض وإدارة المحكمين في النظام</p>
          </div>
          <Button
            onClick={() => setInviteDialogOpen(true)}
            className="bg-gradient-to-r from-[#01645e] to-[#3ab666]"
          >
            <UserPlus className="w-4 h-4 ml-2" />
            دعوة محكم
          </Button>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { title: 'إجمالي المحكمين', value: stats.total, icon: Users, color: 'from-[#01645e] to-[#3ab666]' },
            { title: 'نشط', value: stats.active, icon: CheckCircle2, color: 'from-[#3ab666] to-[#c3e956]' },
            { title: 'غير نشط', value: stats.inactive, icon: XCircle, color: 'from-red-500 to-red-600' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8b7632] mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-[#01645e]">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-br ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}></div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="البحث بالاسم أو البريد الإلكتروني..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Judges List */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة المحكمين</CardTitle>
            <CardDescription>
              عرض جميع المحكمين المسجلين في النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredJudges.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-[#01645e] mb-2">لا يوجد محكمين</h3>
                <p className="text-[#8b7632]">
                  {searchQuery ? 'لا توجد نتائج بحث' : 'لم يتم إضافة أي محكمين بعد'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJudges.map((judge) => (
                  <div
                    key={judge.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#01645e]">
                            {judge.user.name}
                          </h3>
                          <Badge className={judge.isActive ? 'bg-green-500' : 'bg-red-500'}>
                            {judge.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </div>
                        <div className="text-sm text-[#8b7632] space-y-1">
                          <p className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {judge.user.email}
                          </p>
                          {judge.user.phone && (
                            <p className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {judge.user.phone}
                            </p>
                          )}
                          <p className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            {judge._count.evaluations} تقييم
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleJudgeStatus(judge.id, judge.isActive)}
                        >
                          {judge.isActive ? (
                            <>
                              <XCircle className="w-4 h-4 ml-2" />
                              تعطيل
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 ml-2" />
                              تفعيل
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invite Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>دعوة محكم جديد</DialogTitle>
              <DialogDescription>
                إرسال دعوة لمحكم جديد للانضمام إلى المنصة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">الاسم *</Label>
                <Input
                  id="name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="اسم المحكم"
                />
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="judge@example.com"
                />
              </div>
              <div>
                <Label htmlFor="message">رسالة إضافية (اختياري)</Label>
                <Input
                  id="message"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="رسالة ترحيبية..."
                />
              </div>
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800 text-sm">
                  سيتم إرسال رابط الدعوة على البريد الإلكتروني المحدد
                </AlertDescription>
              </Alert>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
                disabled={inviting}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleInviteJudge}
                disabled={inviting || !inviteEmail || !inviteName}
              >
                {inviting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin ml-2" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 ml-2" />
                    إرسال الدعوة
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
