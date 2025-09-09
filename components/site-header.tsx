"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronDown, LogOut, User as UserIcon, Menu, X, Calendar, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'

export function SiteHeader() {
  const { user, loading, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-[#c3e956]/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo - Enhanced with hover effect */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <Link href="/" className="flex items-center space-x-4 rtl:space-x-reverse hover:opacity-80 transition-all duration-300 group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-white font-bold text-xl sm:text-2xl">ه</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#01645e] to-[#3ab666] bg-clip-text text-transparent group-hover:from-[#3ab666] group-hover:to-[#01645e] transition-all duration-300">
                  هاكاثون الابتكار
                </h1>
                <p className="text-xs sm:text-sm text-[#8b7632] group-hover:text-[#01645e] transition-colors duration-300">منصة الهاكاثونات التقنية</p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:flex items-center space-x-6 rtl:space-x-reverse">
            <nav className="flex space-x-8 rtl:space-x-reverse">
              <Link href="/hackathons" className="text-[#01645e] hover:text-[#3ab666] font-medium transition-colors">الهاكاثونات</Link>
              <Link href="/#features" className="text-[#01645e] hover:text-[#3ab666] font-medium transition-colors">المميزات</Link>
              <Link href="/#criteria" className="text-[#01645e] hover:text-[#3ab666] font-medium transition-colors">معايير التقييم</Link>
            </nav>
            {loading ? (
              <div className="w-8 h-8 border-2 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin"></div>
            ) : !user ? (
              <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                <Link href="/register" className="bg-white text-[#01645e] border border-[#01645e] px-3 lg:px-5 py-2 lg:py-2.5 rounded-xl font-semibold shadow hover:bg-[#01645e] hover:text-white transition-colors text-sm lg:text-base">
                  إنشاء حساب
                </Link>
                <Link href="/login" className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-3 lg:px-5 py-2 lg:py-2.5 rounded-xl font-semibold shadow hover:from-[#014a46] hover:to-[#2d8f52] text-sm lg:text-base">
                  تسجيل الدخول
                </Link>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      className="flex items-center gap-3 bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 hover:from-[#01645e]/20 hover:to-[#3ab666]/20 border border-[#01645e]/20 rounded-xl px-4 py-2 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-[#01645e]">{user.name}</div>
                        <div className="text-xs text-[#8b7632]">
                          {user.role === 'admin' ? 'مدير النظام' :
                           user.role === 'judge' ? 'محكم' : 'مشارك'}
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-[#01645e] transition-transform duration-200" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-white/95 backdrop-blur-md border border-[#01645e]/20 shadow-xl rounded-xl p-2"
                >
                  <div className="px-3 py-2 bg-gradient-to-r from-[#01645e]/5 to-[#3ab666]/5 rounded-lg mb-2">
                    <div className="font-semibold text-[#01645e]">{user.name}</div>
                    <div className="text-sm text-[#8b7632]">{user.email}</div>
                    <div className="text-xs text-[#3ab666] mt-1">
                      {user.role === 'admin' ? '🔧 مدير النظام' :
                       user.role === 'judge' ? '⚖️ محكم معتمد' : '👨‍💻 مشارك'}
                    </div>
                  </div>

                  <DropdownMenuSeparator className="bg-[#01645e]/10" />

                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#01645e]/10 transition-colors">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">🏛️</span>
                        </div>
                        <div>
                          <div className="font-medium text-[#01645e]">لوحة تحكم الأدمن</div>
                          <div className="text-xs text-[#8b7632]">إدارة النظام والمشاركين</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {user.role === 'judge' && (
                    <DropdownMenuItem asChild>
                      <Link href="/judge" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#3ab666]/10 transition-colors">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#3ab666] to-[#c3e956] rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">⚖️</span>
                        </div>
                        <div>
                          <div className="font-medium text-[#01645e]">منطقة المحكم</div>
                          <div className="text-xs text-[#8b7632]">تقييم المشاريع والحلول</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {user.role === 'participant' && (
                    <DropdownMenuItem asChild>
                      <Link href="/participant/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#c3e956]/10 transition-colors">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#c3e956] to-[#8b7632] rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">👨‍💻</span>
                        </div>
                        <div>
                          <div className="font-medium text-[#01645e]">لوحة المشارك</div>
                          <div className="text-xs text-[#8b7632]">متابعة مشروعك وحالة المشاركة</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-[#01645e]/10 my-2" />

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#3ab666]/10 transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#3ab666] to-[#c3e956] rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">👤</span>
                      </div>
                      <div>
                        <div className="font-medium text-[#01645e]">الملف الشخصي</div>
                        <div className="text-xs text-[#8b7632]">معلوماتك ومشاركاتك</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/hackathons" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#c3e956]/10 transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#c3e956] to-[#8b7632] rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">🏆</span>
                      </div>
                      <div>
                        <div className="font-medium text-[#01645e]">الهاكاثونات</div>
                        <div className="text-xs text-[#8b7632]">تصفح الفعاليات المتاحة</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-[#01645e]/10 my-2" />

                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-600 hover:text-red-700"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium">تسجيل الخروج</div>
                      <div className="text-xs text-red-500">إنهاء الجلسة الحالية</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </motion.div>

          {/* Mobile Menu Button & User Menu */}
          <div className="lg:hidden flex items-center gap-2">
            {/* User Avatar for Mobile */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 rounded-full"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <DropdownMenuLabel className="text-center pb-2">
                    <div className="font-semibold text-[#01645e]">{user.name}</div>
                    <div className="text-xs text-[#8b7632]">
                      {user.role === 'admin' ? 'مدير النظام' :
                       user.role === 'judge' ? 'محكم' : 'مشارك'}
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {/* Dashboard Links */}
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard" className="flex items-center gap-2 w-full">
                        <Settings className="w-4 h-4" />
                        لوحة التحكم
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {user.role === 'judge' && (
                    <DropdownMenuItem asChild>
                      <Link href="/judge" className="flex items-center gap-2 w-full">
                        <Settings className="w-4 h-4" />
                        منطقة التحكيم
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {user.role === 'participant' && (
                    <DropdownMenuItem asChild>
                      <Link href="/participant/dashboard" className="flex items-center gap-2 w-full">
                        <Settings className="w-4 h-4" />
                        لوحة المشارك
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 w-full">
                      <UserIcon className="w-4 h-4" />
                      الملف الشخصي
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-[#c3e956]/30 bg-white/98 backdrop-blur-md shadow-lg"
          >
            <div className="px-4 py-6 space-y-6">
              {/* User Info for Mobile (if logged in) */}
              {user && (
                <div className="bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 rounded-xl p-4 border border-[#01645e]/20 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-[#01645e] text-lg">{user.name}</div>
                      <div className="text-sm text-[#8b7632] font-medium">
                        {user.role === 'admin' ? '👑 مدير النظام' :
                         user.role === 'judge' ? '⚖️ محكم' : '🚀 مشارك'}
                      </div>
                      <div className="text-xs text-[#01645e]/70 mt-1">مرحباً بك في المنصة</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#8b7632] mb-3 px-2">التنقل</h3>
                <Link
                  href="/hackathons"
                  className="flex items-center gap-3 text-[#01645e] hover:text-white hover:bg-gradient-to-r hover:from-[#01645e] hover:to-[#3ab666] font-medium transition-all duration-300 py-3 px-3 rounded-xl shadow-sm hover:shadow-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Calendar className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold">الهاكاثونات</span>
                </Link>
                <Link
                  href="/#features"
                  className="flex items-center gap-3 text-[#01645e] hover:text-white hover:bg-gradient-to-r hover:from-[#01645e] hover:to-[#3ab666] font-medium transition-all duration-300 py-3 px-3 rounded-xl shadow-sm hover:shadow-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserIcon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold">المميزات</span>
                </Link>
                <Link
                  href="/#criteria"
                  className="flex items-center gap-3 text-[#01645e] hover:text-white hover:bg-gradient-to-r hover:from-[#01645e] hover:to-[#3ab666] font-medium transition-all duration-300 py-3 px-3 rounded-xl shadow-sm hover:shadow-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold">معايير التقييم</span>
                </Link>
              </div>

              {/* Dashboard Links for Logged in Users */}
              {user && (
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-[#8b7632] mb-3 px-2">لوحة التحكم</h3>

                  {user.role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-3 text-[#01645e] hover:text-white hover:bg-gradient-to-r hover:from-[#01645e] hover:to-[#3ab666] font-medium transition-all duration-300 py-3 px-3 rounded-xl shadow-sm hover:shadow-md border border-[#01645e]/20"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5 flex-shrink-0" />
                      <span className="font-semibold">👑 لوحة الإدارة</span>
                    </Link>
                  )}

                  {user.role === 'judge' && (
                    <Link
                      href="/judge"
                      className="flex items-center gap-3 text-[#01645e] hover:text-white hover:bg-gradient-to-r hover:from-[#01645e] hover:to-[#3ab666] font-medium transition-all duration-300 py-3 px-3 rounded-xl shadow-sm hover:shadow-md border border-[#01645e]/20"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5 flex-shrink-0" />
                      <span className="font-semibold">⚖️ منطقة التحكيم</span>
                    </Link>
                  )}

                  {user.role === 'participant' && (
                    <Link
                      href="/participant/dashboard"
                      className="flex items-center gap-3 text-[#01645e] hover:text-white hover:bg-gradient-to-r hover:from-[#01645e] hover:to-[#3ab666] font-medium transition-all duration-300 py-3 px-3 rounded-xl shadow-sm hover:shadow-md border border-[#01645e]/20"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserIcon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-semibold">🚀 لوحة المشارك</span>
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    className="flex items-center gap-3 text-[#01645e] hover:text-white hover:bg-gradient-to-r hover:from-[#01645e] hover:to-[#3ab666] font-medium transition-all duration-300 py-3 px-3 rounded-xl shadow-sm hover:shadow-md border border-[#01645e]/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold">👤 الملف الشخصي</span>
                  </Link>
                </div>
              )}

              {/* Auth Buttons for Mobile */}
              {!user ? (
                <div className="space-y-3 pt-4 border-t border-[#01645e]/20">
                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 w-full text-center bg-white text-[#01645e] border-2 border-[#01645e] px-4 py-4 rounded-xl font-bold shadow-md hover:bg-[#01645e] hover:text-white transition-all duration-300 hover:shadow-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>✨ إنشاء حساب جديد</span>
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full text-center bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-4 py-4 rounded-xl font-bold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogOut className="w-5 h-5 rotate-180" />
                    <span>🚀 تسجيل الدخول</span>
                  </Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-[#01645e]/20">
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center justify-center gap-3 w-full text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 font-bold transition-all duration-300 py-4 px-3 rounded-xl border-2 border-red-200 hover:border-red-500 shadow-md hover:shadow-lg"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>👋 تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
}


