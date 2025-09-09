"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronDown, LogOut, User as UserIcon, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'

export function SiteHeader() {
  const { user, loading, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-[#c3e956]/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-4 rtl:space-x-reverse">
            <img src="/placeholder-logo.png" alt="هاكاثون الابتكار الحكومي" className="h-12 sm:h-16 w-auto" />
            <div className="hidden sm:block">
              <Link href="/" className="text-xl sm:text-2xl font-bold text-[#01645e]">هاكاثون الابتكار </Link>
              <p className="text-xs sm:text-sm text-[#8b7632]">نظام احترافي متطور</p>
            </div>
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

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-[#c3e956]/30 bg-white/95 backdrop-blur-md"
          >
            <div className="px-4 py-6 space-y-4">
              {/* Navigation Links */}
              <div className="space-y-3">
                <Link
                  href="/hackathons"
                  className="block text-[#01645e] hover:text-[#3ab666] font-medium transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  الهاكاثونات
                </Link>
                <Link
                  href="/#features"
                  className="block text-[#01645e] hover:text-[#3ab666] font-medium transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  المميزات
                </Link>
                <Link
                  href="/#criteria"
                  className="block text-[#01645e] hover:text-[#3ab666] font-medium transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  معايير التقييم
                </Link>
              </div>

              {/* Auth Buttons for Mobile */}
              {!user && (
                <div className="space-y-3 pt-4 border-t border-[#c3e956]/30">
                  <Link
                    href="/register"
                    className="block w-full text-center bg-white text-[#01645e] border border-[#01645e] px-4 py-3 rounded-xl font-semibold shadow hover:bg-[#01645e] hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    إنشاء حساب
                  </Link>
                  <Link
                    href="/login"
                    className="block w-full text-center bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-4 py-3 rounded-xl font-semibold shadow hover:from-[#014a46] hover:to-[#2d8f52] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    تسجيل الدخول
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
}


