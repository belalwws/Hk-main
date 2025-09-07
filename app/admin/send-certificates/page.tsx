'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, Medal, Award, Users, Star, Download, Mail, FileText, Send, CheckCircle, XCircle, Clock, Eye, ArrowLeft } from 'lucide-react'
import { Certificate } from '@/components/Certificate'

interface TeamResult {
  id: string
  teamNumber: number
  name: string
  ideaTitle?: string
  ideaDescription?: string
  participants: Array<{
    id: string
    user: { name: string, email: string }
    teamRole: string
  }>
  totalScore: number
  averageScore: number
  evaluationsCount: number
  rank: number
}

interface Hackathon {
  id: string
  title: string
  description: string
  status: string
}

interface EmailResult {
  email: string
  name: string
  team: string
  rank: number
  status: 'success' | 'failed'
  error?: string
}

export default function SendCertificatesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null)
  const [results, setResults] = useState<TeamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingEmails, setSendingEmails] = useState(false)
  const [emailResults, setEmailResults] = useState<EmailResult[]>([])
  const [showEmailResults, setShowEmailResults] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [previewParticipant, setPreviewParticipant] = useState<any>(null)
  const [previewEmail, setPreviewEmail] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (user.role !== 'admin') {
      router.push('/admin/dashboard')
      return
    }
    fetchHackathons()
  }, [user, router])

  const fetchHackathons = async () => {
    try {
      const response = await fetch('/api/admin/hackathons')
      if (response.ok) {
        const data = await response.json()
        setHackathons(data.hackathons || [])
        if (data.hackathons?.length > 0) {
          setSelectedHackathon(data.hackathons[0])
          fetchResults(data.hackathons[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchResults = async (hackathonId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/evaluations`)
      if (response.ok) {
        const data = await response.json()
        const teamsWithRanks = data.teams
          .sort((a: TeamResult, b: TeamResult) => b.totalScore - a.totalScore)
          .map((team: TeamResult, index: number) => ({
            ...team,
            rank: index + 1
          }))
        setResults(teamsWithRanks)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleHackathonChange = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon)
    fetchResults(hackathon.id)
    setShowEmailResults(false)
    setEmailResults([])
    setPreviewMode(false)
  }

  const previewCertificateAndEmail = (participant: any, team: TeamResult) => {
    setPreviewParticipant({
      ...participant,
      team: team,
      hackathonTitle: selectedHackathon?.title || '',
      rank: team.rank,
      isWinner: team.rank <= 3,
      totalScore: team.totalScore,
      date: new Date().toLocaleDateString('ar-SA')
    })
    
    // Generate preview email
    const isWinner = team.rank <= 3
    const emailSubject = isWinner 
      ? `🏆 تهانينا! حصلت على ${team.rank === 1 ? 'المركز الأول' : team.rank === 2 ? 'المركز الثاني' : 'المركز الثالث'} في ${selectedHackathon?.title}`
      : `🎉 شكراً لمشاركتك في ${selectedHackathon?.title}`

    setPreviewEmail(`
الموضوع: ${emailSubject}

مرحباً ${participant.user.name},

${isWinner ? 
  `🏆 تهانينا الحارة! لقد حصلت على ${team.rank === 1 ? 'المركز الأول' : team.rank === 2 ? 'المركز الثاني' : 'المركز الثالث'} في ${selectedHackathon?.title}!

النتيجة النهائية: ${team.totalScore.toFixed(2)} نقطة
الفريق: ${team.name}

نحن فخورون بإنجازك المتميز وإبداعك في هذا الهاكاثون.` :
  `شكراً لك على مشاركتك الرائعة في ${selectedHackathon?.title}!

الفريق: ${team.name}
لقد كانت مشاركتك قيمة ومؤثرة، ونتطلع لرؤيتك في فعالياتنا القادمة.`}

يتشرف رئيس اللجنة المنظمة لهاكاثون الابتكار في الخدمات الحكومية بتقديم جزيل الشكر والتقدير لك على عطائك المتميز ومساهمتك الفاعلة في إنجاح فعاليات الهاكاثون.

🏆 عرض الشهادة الرقمية: [رابط الشهادة]

مع أطيب التحيات،
فريق هاكاثون الابتكار التقني
    `)
    
    setPreviewMode(true)
  }

  const sendCertificatesAndEmails = async () => {
    if (!selectedHackathon) return

    const totalParticipants = results.reduce((total, team) => total + team.participants.length, 0)
    const winnersCount = results.filter(team => team.rank <= 3).reduce((total, team) => total + team.participants.length, 0)
    const regularCount = totalParticipants - winnersCount

    // تأكيد الإرسال
    const confirmMessage = `
🎯 هل أنت متأكد من إرسال الشهادات والرسائل؟

📊 الإحصائيات:
• إجمالي المشاركين: ${totalParticipants}
• الفائزون (مراكز 1-3): ${winnersCount}
• المشاركون العاديون: ${regularCount}

📧 سيتم إرسال:
• رسائل تهنئة + شهادات فوز للفائزين
• رسائل شكر + شهادات مشاركة للباقي

⚠️ هذه العملية لا يمكن التراجع عنها!
    `

    if (!confirm(confirmMessage)) {
      return
    }

    setSendingEmails(true)
    setShowEmailResults(false)

    try {
      const response = await fetch(`/api/admin/hackathons/${selectedHackathon.id}/send-certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        setEmailResults(data.results || [])
        setShowEmailResults(true)

        // رسالة نجاح مفصلة
        const successMessage = `
✅ تم إرسال الشهادات والرسائل بنجاح!

📊 النتائج:
• تم الإرسال بنجاح: ${data.successCount}
• فشل في الإرسال: ${data.failureCount}
• إجمالي المحاولات: ${data.successCount + data.failureCount}

🎉 جميع المشاركين سيحصلون على شهاداتهم ورسائل التقدير!
        `
        alert(successMessage)
      } else {
        const error = await response.json()
        alert(`❌ حدث خطأ: ${error.error}`)
      }
    } catch (error) {
      console.error('Error sending certificates:', error)
      alert('❌ حدث خطأ في إرسال الشهادات. يرجى المحاولة مرة أخرى.')
    } finally {
      setSendingEmails(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <div className="w-6 h-6 bg-[#01645e] rounded-full flex items-center justify-center text-white text-xs font-bold">{rank}</div>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#01645e] mx-auto"></div>
          <p className="mt-4 text-[#01645e] text-xl">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  if (previewMode && previewParticipant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4]">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setPreviewMode(false)}
              className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة
            </button>
            <h1 className="text-3xl font-bold text-[#01645e]">معاينة الشهادة والإيميل</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Email Preview */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h2 className="text-xl font-bold text-[#01645e] mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6" />
                معاينة الإيميل
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                  {previewEmail}
                </pre>
              </div>
            </div>

            {/* Certificate Preview */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h2 className="text-xl font-bold text-[#01645e] mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                معاينة الشهادة
              </h2>
              <div className="transform scale-50 origin-top-left">
                <Certificate
                  participantName={previewParticipant.user.name}
                  hackathonTitle={previewParticipant.hackathonTitle}
                  date={previewParticipant.date || new Date().toLocaleDateString('ar-SA')}
                  rank={previewParticipant.rank}
                  isWinner={previewParticipant.isWinner}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-6 mt-8">
            {/* Main Send Button */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#c3e956] to-[#3ab666] rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              <button
                onClick={sendCertificatesAndEmails}
                disabled={sendingEmails || !selectedHackathon || results.length === 0}
                className="relative bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] text-white px-12 py-4 rounded-2xl font-bold shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-lg"
              >
                {sendingEmails ? (
                  <>
                    <Clock className="w-6 h-6 animate-spin" />
                    جاري إرسال الشهادات والرسائل...
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    📧 إرسال الشهادات والرسائل لجميع المشاركين
                  </>
                )}
              </button>
            </div>

            {/* Info Text */}
            {selectedHackathon && results.length > 0 && (
              <div className="text-center">
                <p className="text-[#01645e] font-semibold text-lg mb-2">
                  🎯 سيتم إرسال الشهادات والرسائل إلى {results.reduce((total, team) => total + team.participants.length, 0)} مشارك
                </p>
                <p className="text-[#8b7632] text-sm">
                  • الفائزون (المراكز 1-3): رسالة تهنئة + شهادة فوز
                  <br />
                  • باقي المشاركين: رسالة شكر + شهادة مشاركة
                </p>
              </div>
            )}

            {/* Warning if no data */}
            {(!selectedHackathon || results.length === 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                <p className="text-yellow-800 font-semibold">⚠️ يرجى اختيار هاكاثون يحتوي على مشاركين أولاً</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-[#c3e956] to-[#3ab666] rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-[#01645e] to-[#3ab666] p-6 rounded-full shadow-2xl w-24 h-24 mx-auto flex items-center justify-center">
              <Send className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#01645e] via-[#3ab666] to-[#c3e956] bg-clip-text text-transparent mb-4">
            📧 إرسال الشهادات والإيميلات
          </h1>
          <p className="text-[#8b7632] text-xl">معاينة وإرسال شهادات التقدير للمشاركين</p>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => router.push('/admin/results')}
            className="bg-gradient-to-r from-[#3ab666] to-[#c3e956] text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            عرض النتائج
          </button>
          
          <button
            onClick={() => router.push('/admin/results-management')}
            className="bg-gradient-to-r from-[#c3e956] to-[#01645e] text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            إدارة النتائج
          </button>
        </div>

        {/* Hackathon Selection */}
        {hackathons.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h3 className="text-xl font-bold text-[#01645e] mb-4">اختر الهاكاثون:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hackathons.map((hackathon) => (
                  <button
                    key={hackathon.id}
                    onClick={() => handleHackathonChange(hackathon)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedHackathon?.id === hackathon.id
                        ? 'border-[#01645e] bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10'
                        : 'border-gray-200 hover:border-[#01645e]/50'
                    }`}
                  >
                    <h4 className="font-bold text-[#01645e]">{hackathon.title}</h4>
                    <p className="text-sm text-[#8b7632] mt-1">{hackathon.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Stats */}
        {selectedHackathon && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h2 className="text-xl font-bold text-[#01645e] mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" />
                إحصائيات الهاكاثون - {selectedHackathon.title}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-[#01645e]/10 to-[#3ab666]/10 rounded-xl p-4 text-center border border-[#01645e]/20">
                  <div className="text-2xl font-bold text-[#01645e]">{results.length}</div>
                  <div className="text-sm text-[#8b7632]">فريق مشارك</div>
                </div>
                <div className="bg-gradient-to-br from-[#3ab666]/10 to-[#c3e956]/10 rounded-xl p-4 text-center border border-[#3ab666]/20">
                  <div className="text-2xl font-bold text-[#3ab666]">
                    {results.reduce((total, team) => total + team.participants.length, 0)}
                  </div>
                  <div className="text-sm text-[#8b7632]">مشارك إجمالي</div>
                </div>
                <div className="bg-gradient-to-br from-[#c3e956]/10 to-[#01645e]/10 rounded-xl p-4 text-center border border-[#c3e956]/20">
                  <div className="text-2xl font-bold text-[#c3a635]">
                    {results.filter(team => team.rank <= 3).reduce((total, team) => total + team.participants.length, 0)}
                  </div>
                  <div className="text-sm text-[#8b7632]">فائز (مراكز 1-3)</div>
                </div>
                <div className="bg-gradient-to-br from-[#8b7632]/10 to-[#c3e956]/10 rounded-xl p-4 text-center border border-[#8b7632]/20">
                  <div className="text-2xl font-bold text-[#8b7632]">
                    {results.filter(team => team.rank > 3).reduce((total, team) => total + team.participants.length, 0)}
                  </div>
                  <div className="text-sm text-[#8b7632]">مشارك عادي</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Teams List for Preview */}
        {selectedHackathon && results.length > 0 && !showEmailResults && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h2 className="text-2xl font-bold text-[#01645e] mb-6 text-center">
                الفرق المشاركة - اضغط على أي مشارك للمعاينة
              </h2>
              
              <div className="space-y-4">
                {results.slice(0, 10).map((team) => (
                  <div key={team.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getRankIcon(team.rank)}
                        <div>
                          <h3 className="font-bold text-[#01645e]">{team.name}</h3>
                          <p className="text-sm text-[#8b7632]">فريق رقم {team.teamNumber} - النتيجة: {team.totalScore.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {team.participants.map((participant, idx) => (
                        <button
                          key={participant.id ?? participant.user?.email ?? participant.user?.name ?? String(idx)}
                          onClick={() => previewCertificateAndEmail(participant, team)}
                          className="bg-white border border-[#01645e]/20 rounded-lg p-3 hover:bg-[#01645e]/5 transition-all duration-300 text-left flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4 text-[#01645e]" />
                          <div>
                            <p className="font-medium text-[#01645e]">{participant.user.name}</p>
                            <p className="text-xs text-[#8b7632]">{participant.teamRole}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Email Results */}
        {showEmailResults && emailResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h3 className="text-xl font-bold text-[#01645e] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                نتائج إرسال الإيميلات
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {emailResults.filter(r => r.status === 'success').length}
                  </div>
                  <div className="text-sm text-green-600">تم الإرسال بنجاح</div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">
                    {emailResults.filter(r => r.status === 'failed').length}
                  </div>
                  <div className="text-sm text-red-600">فشل في الإرسال</div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <Mail className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {emailResults.length}
                  </div>
                  <div className="text-sm text-blue-600">إجمالي المحاولات</div>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {emailResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        result.status === 'success'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {result.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{result.name}</div>
                          <div className="text-sm text-gray-600">{result.email}</div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium">{result.team}</div>
                        <div className="text-xs text-gray-500">المركز #{result.rank}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {selectedHackathon && results.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 border border-[#01645e]/20 shadow-xl">
              <FileText className="w-16 h-16 text-[#8b7632] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#01645e] mb-2">لا توجد نتائج متاحة</h3>
              <p className="text-[#8b7632]">لم يتم العثور على نتائج لهذا الهاكاثون بعد</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
