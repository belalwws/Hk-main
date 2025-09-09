"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Upload, FileText, CheckCircle, Clock, XCircle, Calendar, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserProfile {
  id: string
  name: string
  email: string
  participations: Array<{
    id: string
    status: string
    registeredAt: string
    approvedAt?: string
    rejectedAt?: string
    teamRole?: string
    teamName?: string
    projectTitle?: string
    projectDescription?: string
    hackathon: {
      id: string
      title: string
      description: string
      startDate: string
      endDate: string
      status: string
    }
    team?: {
      id: string
      name: string
      teamNumber: number
      ideaFile?: string
      ideaTitle?: string
      ideaDescription?: string
      participants: Array<{
        id: string
        user: {
          id: string
          name: string
          preferredRole?: string
        }
      }>
    }
  }>
}

export default function ParticipantDashboard() {
  const { user, loading: authLoading, refreshUser } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [ideaForm, setIdeaForm] = useState({
    title: '',
    description: '',
    file: null as File | null
  })

  useEffect(() => {
    // Don't redirect immediately if auth is still loading
    if (authLoading) {
      console.log('🔄 Auth still loading, waiting...')
      return
    }

    if (!user) {
      console.log('❌ No user found, trying to refresh...')
      // Try to refresh user before redirecting
      refreshUser().then((refreshedUser) => {
        if (!refreshedUser) {
          console.log('❌ Refresh failed, redirecting to login')
          router.push('/login')
        } else {
          console.log('✅ User refreshed successfully:', refreshedUser.email)
        }
      })
      return
    }

    console.log('✅ User found in participant dashboard:', user.email)
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (!response.ok) {
        router.push('/login')
        return
      }
      const data = await response.json()
      setProfile(data.user)
    } catch (error) {
      console.error('Error fetching profile:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'في الانتظار', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { label: 'مقبول', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-800', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <Badge className={config.color}>
        <config.icon className="w-3 h-3 ml-1" />
        {config.label}
      </Badge>
    )
  }

  const handleFileUpload = async (teamId: string) => {
    if (!ideaForm.file || !ideaForm.title.trim()) {
      alert('يجب إدخال عنوان الفكرة ورفع ملف العرض التقديمي')
      return
    }

    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', ideaForm.file)
      formData.append('title', ideaForm.title)
      formData.append('description', ideaForm.description)

      // استخدام API endpoint الجديد الذي يجد الفريق تلقائياً
      const response = await fetch(`/api/participant/upload-idea`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        alert(`تم رفع العرض التقديمي بنجاح! \n${result.teamName || ''}`)
        setIdeaForm({ title: '', description: '', file: null })
        fetchProfile() // Refresh data
      } else {
        const error = await response.json()
        console.error('Upload error:', error)
        alert(`فشل في رفع الملف: ${error.error || 'خطأ غير معروف'}\n${error.debug ? JSON.stringify(error.debug) : ''}`)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('حدث خطأ في رفع الملف')
    } finally {
      setUploadingFile(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#01645e] font-semibold">جاري تحميل لوحة التحكم...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get the most recent participation
  const currentParticipation = profile?.participations?.[0]
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-[#01645e] mb-2">لوحة تحكم المشارك</h1>
            <p className="text-[#8b7632] text-lg">
              مرحباً {profile?.name}،
              {currentParticipation ?
                ` متابعة مشاركتك في ${currentParticipation.hackathon.title}` :
                ' لم تسجل في أي هاكاثون بعد'
              }
            </p>
          </div>

          <div className="flex space-x-4 rtl:space-x-reverse">
            {currentParticipation?.status === 'APPROVED' && (
              <>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-5 h-5 ml-2" />
                  رفع المشروع
                </Button>
                {currentParticipation.team && (
                  <Button variant="outline">
                    <Users className="w-5 h-5 ml-2" />
                    فريقي
                  </Button>
                )}
              </>
            )}
            <Link href="/profile">
              <Button variant="outline">
                <Trophy className="w-5 h-5 ml-2" />
                الملف الشخصي
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Status Cards */}
        {currentParticipation ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {/* Participation Status */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#01645e]">حالة المشاركة</h3>
                  {currentParticipation.status === 'APPROVED' && <CheckCircle className="w-6 h-6 text-green-600" />}
                  {currentParticipation.status === 'PENDING' && <Clock className="w-6 h-6 text-yellow-600" />}
                  {currentParticipation.status === 'REJECTED' && <XCircle className="w-6 h-6 text-red-600" />}
                </div>
                {getStatusBadge(currentParticipation.status)}
                <p className="text-sm text-[#8b7632] mt-2">
                  {currentParticipation.status === 'APPROVED' && 'تم قبول مشاركتك بنجاح'}
                  {currentParticipation.status === 'PENDING' && 'طلبك قيد المراجعة'}
                  {currentParticipation.status === 'REJECTED' && 'لم يتم قبول مشاركتك'}
                </p>
              </CardContent>
            </Card>

            {/* Team Status */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#01645e]">الفريق</h3>
                  <Users className="w-6 h-6 text-[#3ab666]" />
                </div>
                {currentParticipation.team ? (
                  <div className="space-y-2">
                    <div className="font-semibold text-[#01645e]">{currentParticipation.team.name}</div>
                    <div className="text-sm text-[#8b7632]">فريق رقم {currentParticipation.team.teamNumber}</div>
                    <div className="text-sm text-[#8b7632]">{currentParticipation.team.participants.length} أعضاء</div>
                    <Badge className="bg-blue-100 text-blue-800 mt-2">تم التعيين</Badge>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-[#8b7632]">
                      {currentParticipation.status === 'APPROVED' ?
                        'سيتم تعيينك في فريق قريباً' :
                        'في انتظار قبول المشاركة'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Status */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#01645e]">المشروع</h3>
                  <FileText className="w-6 h-6 text-[#c3e956]" />
                </div>
                {currentParticipation.projectTitle ? (
                  <div>
                    <Badge className="bg-blue-100 text-blue-800">مُرسل</Badge>
                    <p className="text-sm font-semibold text-[#01645e] mt-2">{currentParticipation.projectTitle}</p>
                    {currentParticipation.projectDescription && (
                      <p className="text-xs text-[#8b7632] mt-1">{currentParticipation.projectDescription}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Badge className="bg-gray-100 text-gray-800">لم يتم الرفع</Badge>
                    <p className="text-sm text-[#8b7632] mt-2">
                      {currentParticipation.status === 'APPROVED' ?
                        'يمكنك رفع مشروعك الآن' :
                        'في انتظار قبول المشاركة'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Presentation Upload */}
            {currentParticipation.team && currentParticipation.status === 'APPROVED' && (
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#01645e]">العرض التقديمي</h3>
                    <Upload className="w-6 h-6 text-[#c3e956]" />
                  </div>

                  {currentParticipation.team.ideaFile ? (
                    <div className="space-y-3">
                      <Badge className="bg-green-100 text-green-800">تم الرفع</Badge>
                      <div>
                        <p className="font-semibold text-[#01645e]">{currentParticipation.team.ideaTitle}</p>
                        {currentParticipation.team.ideaDescription && (
                          <p className="text-sm text-[#8b7632] mt-1">{currentParticipation.team.ideaDescription}</p>
                        )}
                      </div>
                      <a
                        href={`/uploads/${currentParticipation.team.ideaFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-[#01645e] hover:underline"
                      >
                        <FileText className="w-4 h-4 ml-1" />
                        عرض الملف
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#01645e] mb-2">
                          عنوان الفكرة *
                        </label>
                        <input
                          type="text"
                          value={ideaForm.title}
                          onChange={(e) => setIdeaForm({...ideaForm, title: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01645e] focus:border-transparent"
                          placeholder="أدخل عنوان فكرة مشروعك"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#01645e] mb-2">
                          وصف الفكرة
                        </label>
                        <textarea
                          value={ideaForm.description}
                          onChange={(e) => setIdeaForm({...ideaForm, description: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01645e] focus:border-transparent"
                          rows={3}
                          placeholder="وصف مختصر لفكرة المشروع"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#01645e] mb-2">
                          ملف العرض التقديمي (PowerPoint) *
                        </label>
                        <input
                          type="file"
                          accept=".ppt,.pptx,.pdf"
                          onChange={(e) => setIdeaForm({...ideaForm, file: e.target.files?.[0] || null})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01645e] focus:border-transparent"
                        />
                        <p className="text-xs text-[#8b7632] mt-1">
                          الملفات المدعومة: PowerPoint (.ppt, .pptx) أو PDF
                        </p>
                      </div>

                      <Button
                        onClick={() => handleFileUpload(currentParticipation.team!.id)}
                        disabled={uploadingFile || !ideaForm.file || !ideaForm.title.trim()}
                        className="w-full bg-gradient-to-r from-[#01645e] to-[#3ab666]"
                      >
                        {uploadingFile ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin ml-2" />
                            جاري الرفع...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 ml-2" />
                            رفع العرض التقديمي
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#01645e] mb-2">لا توجد مشاركات</h3>
            <p className="text-[#8b7632] mb-6">لم تسجل في أي هاكاثون بعد</p>
            <Link href="/hackathons">
              <Button className="bg-gradient-to-r from-[#01645e] to-[#3ab666]">
                استكشف الهاكاثونات المتاحة
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Hackathon Timeline */}
        {currentParticipation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{currentParticipation.hackathon.title}</h3>
                    <p className="text-white/80">
                      {formatDate(currentParticipation.hackathon.startDate)} - {formatDate(currentParticipation.hackathon.endDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      {Math.max(0, Math.ceil((new Date(currentParticipation.hackathon.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                    </div>
                    <div className="text-white/80">يوم متبقي</div>
                  </div>
                </div>
                <Badge className={`${
                  (currentParticipation.hackathon.status === 'open' || currentParticipation.hackathon.status === 'OPEN') ? 'bg-green-100 text-green-800' :
                  (currentParticipation.hackathon.status === 'closed' || currentParticipation.hackathon.status === 'CLOSED') ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {(currentParticipation.hackathon.status === 'open' || currentParticipation.hackathon.status === 'OPEN') ? 'نشط' :
                   (currentParticipation.hackathon.status === 'closed' || currentParticipation.hackathon.status === 'CLOSED') ? 'مغلق' :
                   (currentParticipation.hackathon.status === 'completed' || currentParticipation.hackathon.status === 'COMPLETED') ? 'مكتمل' : 'مسودة'}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
    </div>
  )
}
