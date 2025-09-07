"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestEmailPage() {
  const [to, setTo] = useState('racein668@gmail.com')
  const [subject, setSubject] = useState('Test Email from Hackathon Platform')
  const [message, setMessage] = useState('This is a test email to verify email functionality is working correctly.')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<any>(null)

  const sendTestEmail = async () => {
    setSending(true)
    setResult(null)
    
    try {
      console.log('🧪 Sending test email...')
      
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, message })
      })

      const data = await response.json()
      console.log('📧 Test email result:', data)
      setResult(data)

    } catch (error) {
      console.error('❌ Test email failed:', error)
      setResult({
        success: false,
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[#01645e]">
              🧪 اختبار الإيميلات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">إلى:</label>
                <Input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">الموضوع:</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="موضوع الإيميل"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">الرسالة:</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="محتوى الرسالة"
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={sendTestEmail}
                disabled={sending}
                className="w-full bg-gradient-to-r from-[#01645e] to-[#3ab666]"
              >
                {sending ? '🔄 جاري الإرسال...' : '📧 إرسال إيميل اختبار'}
              </Button>
            </div>

            {/* Result Display */}
            {result && (
              <Card className={`${result.success ? 'border-green-500' : 'border-red-500'}`}>
                <CardHeader>
                  <CardTitle className={`text-lg ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                    {result.success ? '✅ نجح الإرسال' : '❌ فشل الإرسال'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">📋 تعليمات الاختبار</CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700">
                <ul className="list-disc list-inside space-y-2">
                  <li>تأكد من أن إعدادات Gmail صحيحة في .env.local</li>
                  <li>تحقق من أن كلمة مرور التطبيق صحيحة</li>
                  <li>راقب Console للحصول على تفاصيل أكثر</li>
                  <li>إذا نجح الاختبار، فالمشكلة في API الإشعارات</li>
                  <li>إذا فشل، فالمشكلة في إعدادات الإيميل</li>
                </ul>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <a href="/admin/dashboard">🏠 لوحة التحكم</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/auth-test">🔐 اختبار المصادقة</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin/hackathons/cmf615vsc0000fdvwnr1jfiwy/notify">📧 صفحة الإشعارات</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
