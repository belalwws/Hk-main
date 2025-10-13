"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Send,
  Users,
  Mail,
  Eye,
  MessageSquare,
  UserCheck,
  Clock,
  Search,
  Filter,
  FileText
} from "lucide-react"

interface MessageTemplate {
  id: string
  title: string
  content: string
}

interface Participant {
  id: string
  name: string
  email: string
  city?: string
  status: string
  team: string
}

export default function SupervisorMessages() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Form state
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [recipientType, setRecipientType] = useState("all")
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [participantFilter, setParticipantFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Dialog state
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState("")

  useEffect(() => {
    fetchTemplates()
    fetchParticipants()
  }, [statusFilter])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/supervisor/messages")
      const data = await response.json()
      
      if (response.ok) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`/api/supervisor/messages?status=${statusFilter}`, {
        method: "PATCH"
      })
      const data = await response.json()
      
      if (response.ok) {
        setParticipants(data.participants)
      }
    } catch (error) {
      console.error("Error fetching participants:", error)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSubject(template.title)
      setMessage(template.content)
      setSelectedTemplate(templateId)
    }
  }

  const handlePreview = async () => {
    if (!message) {
      setError("يرجى كتابة الرسالة أولاً")
      return
    }

    try {
      const response = await fetch("/api/supervisor/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "preview",
          message,
          customData: {
            date: new Date().toLocaleDateString('ar-SA')
          }
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setPreviewContent(data.preview)
        setPreviewOpen(true)
      } else {
        setError(data.error || "حدث خطأ في المعاينة")
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالخادم")
    }
  }

  const handleSend = async () => {
    setError("")
    setSuccess("")

    if (!subject || !message) {
      setError("الموضوع والرسالة مطلوبان")
      return
    }

    let recipients = []
    if (recipientType === "all") {
      recipients = ["all"]
    } else if (recipientType === "pending") {
      recipients = ["pending"]
    } else if (recipientType === "approved") {
      recipients = ["approved"]
    } else if (recipientType === "selected") {
      if (selectedParticipants.length === 0) {
        setError("يرجى اختيار المشاركين")
        return
      }
      recipients = selectedParticipants
    }

    setSending(true)

    try {
      const response = await fetch("/api/supervisor/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "send",
          recipients,
          subject,
          message,
          customData: {
            date: new Date().toLocaleDateString('ar-SA')
          }
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess(data.message)
        // Reset form
        setSubject("")
        setMessage("")
        setSelectedTemplate("")
        setSelectedParticipants([])
        setRecipientType("all")
      } else {
        setError(data.error || "حدث خطأ في إرسال الرسائل")
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setSending(false)
    }
  }

  const handleParticipantToggle = (participantId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    )
  }

  const filteredParticipants = participants.filter(p => 
    p.name.toLowerCase().includes(participantFilter.toLowerCase()) ||
    p.email.toLowerCase().includes(participantFilter.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">معتمد</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">معلق</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">مرفوض</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إرسال الرسائل</h1>
        <p className="text-gray-600">إرسال إشعارات ورسائل للمشاركين</p>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Composer */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                إنشاء رسالة
              </CardTitle>
              <CardDescription>
                اكتب رسالتك أو اختر من القوالب الجاهزة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Selection */}
              <div>
                <Label htmlFor="template">اختيار قالب (اختياري)</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر قالب جاهز..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {template.title}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="subject">موضوع الرسالة *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="أدخل موضوع الرسالة..."
                />
              </div>

              {/* Message Content */}
              <div>
                <Label htmlFor="message">محتوى الرسالة *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  placeholder="اكتب رسالتك هنا... يمكنك استخدام {name} لإدراج اسم المشارك"
                />
                <p className="text-sm text-gray-500 mt-1">
                  يمكنك استخدام: {"{name}"} للاسم، {"{email}"} للبريد الإلكتروني، {"{date}"} للتاريخ
                </p>
              </div>

              {/* Recipients */}
              <div>
                <Label>المستلمون *</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox
                      id="all"
                      checked={recipientType === "all"}
                      onCheckedChange={() => setRecipientType("all")}
                    />
                    <Label htmlFor="all" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      جميع المشاركين المعتمدين
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox
                      id="pending"
                      checked={recipientType === "pending"}
                      onCheckedChange={() => setRecipientType("pending")}
                    />
                    <Label htmlFor="pending" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      المشاركين المعلقين
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox
                      id="approved"
                      checked={recipientType === "approved"}
                      onCheckedChange={() => setRecipientType("approved")}
                    />
                    <Label htmlFor="approved" className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      المشاركين المعتمدين فقط
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox
                      id="selected"
                      checked={recipientType === "selected"}
                      onCheckedChange={() => setRecipientType("selected")}
                    />
                    <Label htmlFor="selected" className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      اختيار مشاركين محددين
                    </Label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handlePreview} variant="outline">
                  <Eye className="w-4 h-4 ml-2" />
                  معاينة
                </Button>
                <Button onClick={handleSend} disabled={sending}>
                  {sending ? "جاري الإرسال..." : (
                    <>
                      <Send className="w-4 h-4 ml-2" />
                      إرسال الرسالة
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participants Selection */}
        {recipientType === "selected" && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  اختيار المشاركين
                </CardTitle>
                <CardDescription>
                  اختر المشاركين الذين تريد إرسال الرسالة إليهم
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="البحث بالاسم أو البريد..."
                      value={participantFilter}
                      onChange={(e) => setParticipantFilter(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="approved">معتمد</SelectItem>
                      <SelectItem value="pending">معلق</SelectItem>
                      <SelectItem value="rejected">مرفوض</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Participants List */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredParticipants.map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-2 rtl:space-x-reverse p-2 border rounded">
                      <Checkbox
                        checked={selectedParticipants.includes(participant.id)}
                        onCheckedChange={() => handleParticipantToggle(participant.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{participant.name}</p>
                        <p className="text-xs text-gray-500 truncate">{participant.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(participant.status)}
                          {participant.team && (
                            <Badge variant="outline" className="text-xs">
                              {participant.team}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-600">
                  تم اختيار {selectedParticipants.length} من {filteredParticipants.length} مشارك
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>معاينة الرسالة</DialogTitle>
            <DialogDescription>
              هكذا ستبدو الرسالة للمشاركين
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>الموضوع:</Label>
              <p className="font-medium">{subject}</p>
            </div>
            <div>
              <Label>المحتوى:</Label>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="whitespace-pre-line">{previewContent}</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
