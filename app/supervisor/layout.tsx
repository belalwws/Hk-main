"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ErrorBoundary from "@/components/ErrorBoundary"
import {
  Trophy,
  BarChart3,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Settings,
  FileText,
  ClipboardList,
  Award,
  Mail
} from "lucide-react"

const sidebarItems = [
  {
    title: "الرئيسية",
    href: "/supervisor/dashboard",
    icon: Home,
    description: "لوحة التحكم الرئيسية"
  },
  {
    title: "الهاكاثونات",
    href: "/supervisor/hackathons",
    icon: Trophy,
    description: "إدارة الهاكاثونات المسندة"
  },
  {
    title: "الفرق",
    href: "/supervisor/teams",
    icon: BarChart3,
    description: "إدارة الفرق"
  },
  {
    title: "العروض التقديمية",
    href: "/supervisor/presentations",
    icon: FileText,
    description: "متابعة وإرسال روابط العروض",
    badge: "جديد"
  },
  {
    title: "الفورمات",
    href: "/supervisor/forms",
    icon: ClipboardList,
    description: "نماذج التسجيل"
  },
  {
    title: "الشهادات",
    href: "/supervisor/certificates",
    icon: Award,
    description: "إصدار الشهادات"
  },
  {
    title: "إدارة الإيميلات",
    href: "/supervisor/email-management",
    icon: Mail,
    description: "قوالب الإيميلات التلقائية"
  },
  {
    title: "التقارير",
    href: "/supervisor/reports",
    icon: BarChart3,
    description: "التقارير والإحصائيات"
  },
  {
    title: "الرسائل",
    href: "/supervisor/messages",
    icon: MessageSquare,
    description: "الرسائل والإشعارات"
  },
  {
    title: "الملف الشخصي",
    href: "/supervisor/profile",
    icon: User,
    description: "إعدادات الحساب"
  }
]

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, loading, refreshUser } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [allowAccess, setAllowAccess] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔍 [SupervisorLayout] Auth state - loading:', loading, 'user:', user?.email, 'role:', user?.role)

    // Don't redirect if still loading
    if (loading) {
      console.log('⏳ [SupervisorLayout] Still loading, waiting...')
      return
    }

    // If no user, check localStorage as fallback
    if (!user) {
      console.log('🔄 [SupervisorLayout] No user found, checking localStorage...')

      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('auth-user')
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser)
            if (userData.role === 'supervisor') {
              console.log('✅ [SupervisorLayout] Found supervisor in localStorage, allowing access')
              setAllowAccess(true)
              setProfilePicture(userData.profilePicture || null)
              return // Don't redirect, user is valid
            }
          } catch (e) {
            console.log('❌ [SupervisorLayout] Invalid localStorage data')
          }
        }
      }

      // If no valid user found, redirect after a delay
      const timer = setTimeout(() => {
        console.log('🔀 [SupervisorLayout] Redirecting to login - no valid user found')
        router.push("/login?redirect=/supervisor/dashboard")
      }, 1000) // Give more time for auth to load

      return () => clearTimeout(timer)
    }

    // If user exists but wrong role
    if (user.role !== "supervisor") {
      console.log('🔀 [SupervisorLayout] Wrong role, redirecting to login')
      router.push("/login?redirect=/supervisor/dashboard")
      return
    }

    console.log('✅ [SupervisorLayout] User authenticated as supervisor:', user.email)
    setAllowAccess(true)
    setProfilePicture(user.profilePicture || null)
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // Allow access if user is supervisor OR if localStorage indicates supervisor access
  const shouldAllowAccess = allowAccess || (user && user.role === "supervisor")

  if (!shouldAllowAccess) {
    return null
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-30 lg:z-10
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-blue-800">لوحة المشرف</h2>
                  <p className="text-sm text-gray-600">{user?.name || 'مشرف'}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={logout}
            >
              <LogOut className="w-5 h-5 ml-3" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:mr-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="text-right">
                <p className="text-sm text-gray-600">مرحباً،</p>
                <p className="font-semibold text-gray-900">{user?.name || 'مشرف'}</p>
              </div>
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt={user?.name || 'مشرف'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 relative z-10"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center relative z-10">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
    </ErrorBoundary>
  )
}
