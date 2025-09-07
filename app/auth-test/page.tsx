"use client"

import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'

export default function AuthTestPage() {
  const { user, loading } = useAuth()
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [cookieInfo, setCookieInfo] = useState<string>('')

  useEffect(() => {
    // Check cookie
    const cookies = document.cookie
    setCookieInfo(cookies)

    // Test API
    fetch('/api/auth/verify')
      .then(res => res.json())
      .then(data => setTokenInfo(data))
      .catch(err => setTokenInfo({ error: err.message }))
  }, [])

  if (loading) {
    return <div className="p-8">جاري التحميل...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">اختبار المصادقة</h1>
      
      <div className="grid gap-6">
        {/* User Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">معلومات المستخدم</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {/* Token Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">معلومات الرمز المميز</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(tokenInfo, null, 2)}
          </pre>
        </div>

        {/* Cookie Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">معلومات الكوكيز</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {cookieInfo || 'لا توجد كوكيز'}
          </pre>
        </div>

        {/* Test Links */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">روابط الاختبار</h2>
          <div className="space-y-2">
            <a href="/login" className="block text-blue-600 hover:underline">
              صفحة تسجيل الدخول
            </a>
            <a href="/admin/dashboard" className="block text-blue-600 hover:underline">
              لوحة تحكم الأدمن
            </a>
            <a href="/admin/emails" className="block text-blue-600 hover:underline">
              صفحة الإيميلات
            </a>
            <a href="/api/auth/verify" className="block text-blue-600 hover:underline">
              API التحقق من الرمز
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">إجراءات</h2>
          <div className="space-x-4">
            <button 
              onClick={() => {
                document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                window.location.reload()
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              حذف الكوكيز
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              إعادة تحميل
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
