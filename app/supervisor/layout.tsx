"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Trophy, 
  BarChart3, 
  MessageSquare, 
  User, 
  LogOut, 
  Menu,
  X,
  Home,
  Settings
} from "lucide-react"

const sidebarItems = [
  {
    title: "الرئيسية",
    href: "/supervisor/dashboard",
    icon: Home
  },
  {
    title: "المشاركون",
    href: "/supervisor/participants",
    icon: Users
  },
  {
    title: "الفرق",
    href: "/supervisor/teams",
    icon: Trophy
  },
  {
    title: "التقارير",
    href: "/supervisor/reports",
    icon: BarChart3
  },
  {
    title: "الرسائل",
    href: "/supervisor/messages",
    icon: MessageSquare
  },
  {
    title: "الملف الشخصي",
    href: "/supervisor/profile",
    icon: User
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
  if (!allowAccess && (!user || user.role !== "supervisor")) {
    return null
  }

  return (
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
        fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
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
                  <p className="text-sm text-gray-600">{user.name}</p>
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
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.title}</span>
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
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">مرحباً،</p>
                <p className="font-semibold text-gray-900">{user.name}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
