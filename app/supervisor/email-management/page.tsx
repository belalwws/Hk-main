'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Mail, 
  Send, 
  Save, 
  Eye, 
  Users, 
  RefreshCw,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  AlertCircle
} from "lucide-react"

interface EmailTemplate {
  id: string
  templateKey: string
  nameAr: string
  nameEn: string
  subject: string
  bodyHtml: string
  bodyText?: string
  category: string
  variables?: Record<string, string>
  isActive: boolean
  isSystem: boolean
  description?: string
  lastEditedBy?: string
  createdAt: string
  updatedAt: string
}

interface EmailStats {
  totalSent: number
  deliveryRate: number
  openRate: number
  lastSent?: string
}

const TEMPLATE_CATEGORIES = [
  { value: 'participant', label: 'المشاركين', icon: '👥' },
  { value: 'judge', label: 'المحكمين', icon: '⚖️' },
  { value: 'supervisor', label: 'المشرفين', icon: '👨‍💼' },
  { value: 'team', label: 'الفرق', icon: '🏆' },
  { value: 'certificate', label: 'الشهادات', icon: '📜' },
  { value: 'general', label: 'عام', icon: '📧' }
]

export default function SupervisorEmailManagementPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  // Custom email state
  const [customEmail, setCustomEmail] = useState({
    subject: '',
    body: '',
    recipients: 'all', // all, hackathon, judges, supervisors
    hackathonId: '',
    filters: {}
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/email-templates', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates)
          console.log('✅ Loaded templates:', data.templates.length)
        } else {
          // إذا لم توجد قوالب، تحميل القوالب الافتراضية
          console.log('⚠️ No templates found, initializing defaults...')
          await initializeDefaultTemplates()
        }
      } else {
        console.error('Failed to load templates:', response.status)
        toast({
          title: "تنبيه",
          description: "فشل تحميل قوالب الإيميلات. سيتم تهيئة القوالب الافتراضية.",
          variant: "destructive"
        })
        await initializeDefaultTemplates()
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      toast({
        title: "خطأ",
        description: "فشل تحميل قوالب الإيميلات",
        variant: "destructive"
      })
      await initializeDefaultTemplates()
    } finally {
      setLoading(false)
    }
  }

  const initializeDefaultTemplates = async () => {
    try {
      console.log('🔄 Initializing default templates...')
      const response = await fetch('/api/admin/email-templates/initialize', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
        console.log('✅ Initialized templates:', data.templates?.length)
        toast({
          title: "تم التهيئة",
          description: `تم تحميل ${data.templates?.length || 0} قالب افتراضي بنجاح`
        })
      } else {
        console.error('Failed to initialize templates:', response.status)
        throw new Error('Failed to initialize')
      }
    } catch (error) {
      console.error('Error initializing templates:', error)
      toast({
        title: "خطأ",
        description: "فشل تهيئة القوالب الافتراضية",
        variant: "destructive"
      })
    }
  }

  const saveTemplate = async (template: EmailTemplate) => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      })

      if (response.ok) {
        toast({
          title: "✅ تم الحفظ",
          description: "تم حفظ القالب بنجاح"
        })
        await loadTemplates()
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حفظ القالب",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const sendTestEmail = async (template: EmailTemplate) => {
    try {
      const response = await fetch('/api/admin/email-templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateKey: template.templateKey,
          testEmail: 'admin@example.com' // يمكن تخصيصه
        })
      })

      if (response.ok) {
        toast({
          title: "✅ تم الإرسال",
          description: "تم إرسال إيميل تجريبي بنجاح"
        })
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إرسال الإيميل التجريبي",
        variant: "destructive"
      })
    }
  }

  const sendCustomEmail = async () => {
    try {
      if (!customEmail.subject || !customEmail.body) {
        toast({
          title: "تنبيه",
          description: "يرجى ملء العنوان والمحتوى",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/admin/email-templates/send-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customEmail)
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "✅ تم الإرسال",
          description: `تم إرسال الإيميل إلى ${data.sentCount} مستلم`
        })
        
        // Reset form
        setCustomEmail({
          subject: '',
          body: '',
          recipients: 'all',
          hackathonId: '',
          filters: {}
        })
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إرسال الإيميل المخصص",
        variant: "destructive"
      })
    }
  }

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.templateKey.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === 'all') return matchesSearch
    return matchesSearch && t.category === activeTab
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-600" />
          <p className="text-slate-600">جاري تحميل قوالب الإيميلات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 text-slate-800">
          <Mail className="w-8 h-8 text-indigo-600" />
          إدارة الإيميلات
        </h1>
        <p className="text-slate-600">
          إدارة شاملة لكل قوالب الإيميلات التلقائية وإرسال إيميلات مخصصة
        </p>
        
        {/* Important Templates Notice */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">القوالب التلقائية المهمة:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>تأكيد التسجيل</strong> - يُرسل تلقائياً عند تسجيل مشارك جديد</li>
                <li>• <strong>قبول المشاركة</strong> - يُرسل تلقائياً عند قبول طلب مشارك</li>
                <li>• <strong>رفض المشاركة</strong> - يُرسل تلقائياً عند رفض طلب مشارك</li>
                <li>• <strong>تكوين الفريق</strong> - يُرسل عند تشكيل الفرق</li>
              </ul>
              <p className="text-xs text-blue-700 mt-2">
                💡 يمكنك تعديل محتوى ومظهر جميع القوالب حسب احتياجاتك
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8 bg-slate-100">
          <TabsTrigger value="all" className="data-[state=active]:bg-white">
            الكل ({templates.length})
          </TabsTrigger>
          {TEMPLATE_CATEGORIES.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value} className="data-[state=active]:bg-white">
              {cat.icon} {cat.label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="custom" className="data-[state=active]:bg-white">
            <Sparkles className="w-4 h-4 ml-1" />
            إيميل مخصص
          </TabsTrigger>
        </TabsList>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="ابحث في القوالب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 border-slate-200"
            />
          </div>
          <Button onClick={() => initializeDefaultTemplates()} variant="outline" className="border-slate-200">
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة تحميل القوالب
          </Button>
        </div>

        {/* Templates List */}
        {activeTab !== 'custom' && (
          <TabsContent value={activeTab} className="space-y-4">
            {filteredTemplates.length === 0 && !loading && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  لا توجد قوالب. اضغط على "إعادة تحميل القوالب" لتهيئة القوالب الافتراضية.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => {
                // Highlight important automated templates
                const isImportantAutomatic = ['registration_confirmation', 'acceptance', 'rejection', 'team_formation'].includes(template.templateKey)
                
                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md border-slate-200 ${
                      selectedTemplate?.id === template.id ? 'ring-2 ring-indigo-500' : ''
                    } ${isImportantAutomatic ? 'border-l-4 border-l-indigo-500 bg-indigo-50/30' : ''}`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-slate-800">
                            {isImportantAutomatic && <Sparkles className="w-4 h-4 text-indigo-600" />}
                            {template.nameAr}
                            {template.isSystem && (
                              <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                                أساسي
                              </Badge>
                            )}
                            {isImportantAutomatic && (
                              <Badge className="text-xs bg-indigo-600 text-white">
                                تلقائي
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1 text-slate-600">
                            {template.nameEn}
                          </CardDescription>
                        </div>
                        {template.isActive ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-slate-200 text-slate-700">{template.category}</Badge>
                          <span className="text-xs text-slate-500">
                            {template.templateKey}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Template Editor */}
            {selectedTemplate && (
              <Card className="mt-6 border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-slate-800">
                    <span>تحرير القالب: {selectedTemplate.nameAr}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="border-slate-200"
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        {previewMode ? 'تحرير' : 'معاينة'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendTestEmail(selectedTemplate)}
                        className="border-slate-200"
                      >
                        <Send className="w-4 h-4 ml-2" />
                        إرسال تجريبي
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => saveTemplate(selectedTemplate)}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Save className="w-4 h-4 ml-2" />
                        حفظ
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!previewMode ? (
                    <>
                      <div>
                        <Label className="text-slate-700">عنوان الإيميل</Label>
                        <Input
                          value={selectedTemplate.subject}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            subject: e.target.value
                          })}
                          className="mt-1 border-slate-200"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700">محتوى HTML</Label>
                        <Textarea
                          value={selectedTemplate.bodyHtml}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            bodyHtml: e.target.value
                          })}
                          rows={20}
                          className="mt-1 font-mono text-sm border-slate-200"
                        />
                      </div>
                      {selectedTemplate.variables && (
                        <div>
                          <Label className="text-slate-700">المتغيرات المتاحة</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {Object.entries(selectedTemplate.variables).map(([key, desc]) => (
                              <div key={key} className="text-sm p-2 bg-slate-50 rounded border border-slate-200">
                                <code className="text-indigo-600">{`{{${key}}}`}</code>
                                <p className="text-xs text-slate-600 mt-1">{desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="border rounded p-4 bg-white border-slate-200">
                      <div className="mb-4 pb-4 border-b border-slate-200">
                        <p className="text-sm text-slate-600">الموضوع:</p>
                        <p className="font-semibold text-slate-800">{selectedTemplate.subject}</p>
                      </div>
                      <div
                        dangerouslySetInnerHTML={{ __html: selectedTemplate.bodyHtml }}
                        style={{ maxWidth: '600px', margin: '0 auto' }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Custom Email Tab */}
        <TabsContent value="custom">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                إرسال إيميل مخصص
              </CardTitle>
              <CardDescription className="text-slate-600">
                أرسل إيميلات مخصصة لمجموعات مختلفة من المستخدمين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-700">المستلمون</Label>
                <Select
                  value={customEmail.recipients}
                  onValueChange={(value) => setCustomEmail({...customEmail, recipients: value})}
                >
                  <SelectTrigger className="mt-1 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        جميع المستخدمين
                      </div>
                    </SelectItem>
                    <SelectItem value="participants">
                      <div className="flex items-center gap-2">
                        👥 المشاركين
                      </div>
                    </SelectItem>
                    <SelectItem value="judges">
                      <div className="flex items-center gap-2">
                        ⚖️ المحكمين
                      </div>
                    </SelectItem>
                    <SelectItem value="supervisors">
                      <div className="flex items-center gap-2">
                        👨‍💼 المشرفين
                      </div>
                    </SelectItem>
                    <SelectItem value="hackathon">
                      <div className="flex items-center gap-2">
                        🏆 هاكاثون محدد
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {customEmail.recipients === 'hackathon' && (
                <div>
                  <Label className="text-slate-700">اختر الهاكاثون</Label>
                  <Input
                    placeholder="معرف الهاكاثون"
                    value={customEmail.hackathonId}
                    onChange={(e) => setCustomEmail({...customEmail, hackathonId: e.target.value})}
                    className="mt-1 border-slate-200"
                  />
                </div>
              )}

              <div>
                <Label className="text-slate-700">الموضوع</Label>
                <Input
                  placeholder="عنوان الإيميل"
                  value={customEmail.subject}
                  onChange={(e) => setCustomEmail({...customEmail, subject: e.target.value})}
                  className="mt-1 border-slate-200"
                />
              </div>

              <div>
                <Label className="text-slate-700">المحتوى</Label>
                <Textarea
                  placeholder="اكتب محتوى الإيميل هنا..."
                  value={customEmail.body}
                  onChange={(e) => setCustomEmail({...customEmail, body: e.target.value})}
                  rows={15}
                  className="mt-1 border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewMode(!previewMode)} className="border-slate-200">
                  <Eye className="w-4 h-4 ml-2" />
                  معاينة
                </Button>
                <Button onClick={sendCustomEmail} className="bg-indigo-600 hover:bg-indigo-700">
                  <Send className="w-4 h-4 ml-2" />
                  إرسال الآن
                </Button>
              </div>

              {previewMode && customEmail.body && (
                <div className="mt-6 border rounded p-4 bg-white border-slate-200">
                  <div className="mb-4 pb-4 border-b border-slate-200">
                    <p className="text-sm text-slate-600">الموضوع:</p>
                    <p className="font-semibold text-slate-800">{customEmail.subject}</p>
                  </div>
                  <div className="whitespace-pre-wrap text-slate-700">{customEmail.body}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

