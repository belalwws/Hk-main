"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // إذا كان المستخدم مسجل دخول، توجيهه حسب دوره
        switch (user.role) {
          case 'admin':
            router.push('/admin/dashboard')
            break
          case 'judge':
            router.push('/judge/dashboard')
            break
          case 'supervisor':
            router.push('/supervisor/dashboard')
            break
          case 'participant':
            router.push('/participant/dashboard')
            break
          default:
            router.push('/login')
        }
      } else {
        // إذا لم يكن مسجل دخول، توجيهه لصفحة تسجيل الدخول
        router.push('/login')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#01645e] font-semibold">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // سيتم التوجيه تلقائياً، لا حاجة لعرض أي محتوى
  return null
}

