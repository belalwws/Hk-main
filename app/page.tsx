"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Trophy, Users, Target, Lightbulb, Rocket, CheckCircle, X, Gift, Award, Code, Brain, Heart, Settings, TrendingUp, Monitor } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

// Trophy Cup 3D Scene Component
const TrophyCup3DScene = () => (
  <div className="w-full h-full bg-gradient-to-br from-[#01645e]/5 to-[#3ab666]/5 rounded-2xl relative overflow-hidden">
    {/* Animated Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#01645e]/20 via-[#3ab666]/20 to-[#c3e956]/20"></div>

    {/* Floating Victory Particles */}
    <div className="absolute inset-0">
      {['🏆', '⭐', '💎', '👑', '🥇', '✨'].map((icon, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-15, 15, -15],
            rotate: [-10, 10, -10],
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        >
          {icon}
        </motion.div>
      ))}
    </div>

    {/* Central Trophy */}
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="relative"
        animate={{
          rotateY: [0, 360],
          y: [-5, 5, -5],
        }}
        transition={{
          rotateY: { duration: 15, repeat: Infinity, ease: "linear" },
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Trophy Structure */}
        <div className="relative w-32 h-40">
          {/* Trophy Cup */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-20">
            {/* Cup Bowl */}
            <div className="w-full h-16 bg-gradient-to-b from-[#c3e956] via-[#8b7632] to-[#c3e956] rounded-t-full relative overflow-hidden">
              {/* Cup Shine */}
              <div className="absolute top-2 left-2 w-4 h-8 bg-white/40 rounded-full blur-sm"></div>
              <div className="absolute top-1 right-3 w-2 h-6 bg-white/60 rounded-full blur-sm"></div>

              {/* Cup Handles */}
              <div className="absolute top-4 -left-3 w-6 h-8 border-4 border-[#8b7632] rounded-full"></div>
              <div className="absolute top-4 -right-3 w-6 h-8 border-4 border-[#8b7632] rounded-full"></div>
            </div>

            {/* Cup Rim */}
            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-[#c3e956] via-[#8b7632] to-[#c3e956] rounded-full shadow-lg"></div>
          </div>

          {/* Trophy Stem */}
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-4 h-12 bg-gradient-to-b from-[#8b7632] to-[#c3e956] rounded-sm"></div>

          {/* Trophy Base */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-8">
            <div className="w-full h-6 bg-gradient-to-b from-[#8b7632] to-[#c3e956] rounded-lg shadow-xl"></div>
            <div className="absolute bottom-0 w-full h-2 bg-[#01645e] rounded-lg"></div>
          </div>

          {/* Victory Glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#c3e956]/30 via-transparent to-[#c3e956]/30 rounded-full blur-xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Orbiting Stars */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-400 text-lg"
            style={{
              left: '50%',
              top: '50%',
              transformOrigin: `0 ${70 + (i % 2) * 20}px`,
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            ⭐
          </motion.div>
        ))}
      </motion.div>
    </div>

    {/* Victory Confetti */}
    <div className="absolute inset-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`confetti-${i}`}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: ['#c3e956', '#3ab666', '#8b7632', '#01645e'][i % 4],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-40, -80],
            x: [0, Math.random() * 40 - 20],
            rotate: [0, 360],
            opacity: [1, 0],
            scale: [1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeOut",
          }}
        />
      ))}
    </div>

    {/* Champion Glow Effects */}
    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#c3e956]/20 to-transparent"></div>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8b7632]/10 to-transparent"></div>

    {/* Victory Rays */}
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={{
        rotate: [0, 360],
      }}
      transition={{
        duration: 30,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {[...Array(12)].map((_, i) => (
        <div
          key={`ray-${i}`}
          className="absolute w-1 bg-gradient-to-t from-transparent via-[#c3e956]/30 to-transparent"
          style={{
            height: '200px',
            transformOrigin: 'bottom center',
            transform: `rotate(${i * 30}deg)`,
          }}
        />
      ))}
    </motion.div>
  </div>
)

// Interactive 3D Scene Component for the main section
const Interactive3DScene = () => (
  <div className="w-full h-full bg-gradient-to-br from-[#01645e]/10 to-[#3ab666]/10 rounded-2xl relative overflow-hidden">
    {/* Animated Grid Background */}
    <div className="absolute inset-0">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full opacity-20">
        {[...Array(64)].map((_, i) => (
          <motion.div
            key={i}
            className="border border-[#01645e]/20"
            animate={{
              opacity: [0.1, 0.3, 0.1],
              backgroundColor: [
                'rgba(1, 100, 94, 0.1)',
                'rgba(58, 182, 102, 0.1)',
                'rgba(195, 233, 86, 0.1)',
                'rgba(1, 100, 94, 0.1)'
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: (i % 8) * 0.1 + Math.floor(i / 8) * 0.05,
            }}
          />
        ))}
      </div>
    </div>

    {/* Central 3D Structure */}
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="relative"
        animate={{
          rotateY: [0, 360],
          rotateZ: [0, 5, 0, -5, 0],
        }}
        transition={{
          rotateY: { duration: 25, repeat: Infinity, ease: "linear" },
          rotateZ: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Main Geometric Structure */}
        <div className="relative w-40 h-40">
          {/* Central Core */}
          <motion.div
            className="absolute inset-8 bg-gradient-to-br from-[#c3e956] to-[#3ab666] rounded-full shadow-2xl"
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: [
                '0 0 20px rgba(195, 233, 86, 0.5)',
                '0 0 40px rgba(195, 233, 86, 0.8)',
                '0 0 20px rgba(195, 233, 86, 0.5)'
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Orbiting Rings */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`ring-${i}`}
              className="absolute inset-0 border-2 rounded-full"
              style={{
                borderColor: ['#01645e', '#3ab666', '#c3e956'][i],
                transform: `rotateX(${i * 60}deg)`,
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 15 + i * 5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

          {/* Floating Data Points */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`point-${i}`}
              className="absolute w-3 h-3 bg-gradient-to-r from-[#c3e956] to-[#8b7632] rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transformOrigin: `0 ${80 + (i % 3) * 20}px`,
                transform: `rotate(${i * 30}deg)`,
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, delay: i * 0.2 },
                opacity: { duration: 2, repeat: Infinity, delay: i * 0.2 },
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>

    {/* Floating Tech Elements */}
    <div className="absolute inset-0">
      {['💻', '🚀', '⚡', '🔬', '🎯', '💡'].map((icon, i) => (
        <motion.div
          key={`tech-${i}`}
          className="absolute text-2xl"
          style={{
            left: `${20 + (i % 3) * 30}%`,
            top: `${20 + Math.floor(i / 3) * 60}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            rotate: [-5, 5, -5],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        >
          {icon}
        </motion.div>
      ))}
    </div>

    {/* Energy Waves */}
    <div className="absolute inset-0 flex items-center justify-center">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`wave-${i}`}
          className="absolute border border-[#c3e956]/30 rounded-full"
          style={{
            width: `${100 + i * 50}px`,
            height: `${100 + i * 50}px`,
          }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>

    {/* Interactive Cursor Effect */}
    <motion.div
      className="absolute inset-0 opacity-0 pointer-events-none"
      style={{
        background: 'radial-gradient(circle, rgba(195, 233, 86, 0.2) 0%, transparent 70%)'
      }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  </div>
)
import LightParticles from "@/components/3d/LightParticles"
import InnovationNetwork from "@/components/3d/InnovationNetwork"
import FloatingCubes from "@/components/3d/FloatingCubes"
import AnimatedBlobs from "@/components/3d/AnimatedBlobs"



export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false)
  const [pinnedHackathon, setPinnedHackathon] = useState<any>(null)
  const router = useRouter()
  const { user, loading } = useAuth()

  // جلب الهاكاثون المثبت
  useEffect(() => {
    const fetchPinnedHackathon = async () => {
      try {
        const response = await fetch('/api/hackathons/pinned')
        if (response.ok) {
          const data = await response.json()
          setPinnedHackathon(data.hackathon)
        }
      } catch (error) {
        console.error('Error fetching pinned hackathon:', error)
      }
    }

    fetchPinnedHackathon()
  }, [])

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

  if (showDemo) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-[#01645e]">شاهد الشرح التوضيحي</h2>
              <button onClick={() => setShowDemo(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-block bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 border border-[#01645e]/20 rounded-full px-6 py-3 mb-6">
                  <span className="text-[#01645e] font-semibold">📚 دليل المشاركة</span>
                </div>
                <h3 className="text-2xl font-bold text-[#01645e] mb-4">كيفية المشاركة في الهاكاثون</h3>
                <p className="text-[#8b7632] text-lg">تعرف على خطوات المشاركة من التسجيل إلى الفوز</p>
              </div>

              {/* Evaluation Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-3d rounded-3xl p-8 border border-[#01645e]/20 mb-8">
                <div className="text-center mb-6">
                  <div className="inline-block bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-6 py-3 rounded-full mb-4">
                    <span className="font-bold">🚀 مراحل المشاركة</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#01645e] mb-2">أربع خطوات بسيطة للمشاركة</h3>
                  <p className="text-[#8b7632]">اتبع هذه الخطوات للانضمام إلى رحلة الابتكار</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "سجل حسابك", step: "1", color: "#01645e", desc: "أنشئ حساباً جديداً وأدخل معلوماتك الشخصية" },
                    { name: "اختر الهاكاثون", step: "2", color: "#3ab666", desc: "اختر الهاكاثون المناسب لك من القائمة المتاحة" },
                    { name: "كون فريقك", step: "3", color: "#c3e956", desc: "انضم لفريق موجود أو كون فريقاً جديداً" },
                    { name: "ابدأ الابتكار", step: "4", color: "#8b7632", desc: "طور فكرتك واعرضها أمام لجنة التحكيم" },
                  ].map((step, index) => (
                    <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }} className="glass rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: step.color }}>
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[#01645e] mb-1">{step.name}</h4>
                          <p className="text-[#8b7632] text-sm">{step.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Benefits Guide */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "تطوير المهارات", desc: "اكتسب خبرات جديدة في البرمجة والتصميم والابتكار", icon: Brain, color: "#01645e" },
                  { title: "شبكة علاقات", desc: "تواصل مع أفضل المطورين والمصممين في المملكة", icon: Users, color: "#3ab666" },
                  { title: "جوائز قيمة", desc: "فرصة للفوز بجوائز مالية تصل إلى 100,000 ريال", icon: Gift, color: "#c3e956" },
                  { title: "أثر إيجابي", desc: "ساهم في تطوير حلول تخدم المجتمع السعودي", icon: Heart, color: "#8b7632" },
                ].map((item, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="glass rounded-2xl p-6 border border-white/20">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: item.color }}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#01645e] mb-2">{item.title}</h4>
                        <p className="text-[#8b7632] text-sm">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center pt-6">
                <motion.button onClick={() => { setShowDemo(false); router.push("/register") }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-8 py-4 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Rocket className="w-5 h-5 ml-2" />
                  ابدأ رحلتك الآن
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }
  return (
    <>
      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(195, 233, 86, 0.3); }
          50% { box-shadow: 0 0 40px rgba(195, 233, 86, 0.6), 0 0 60px rgba(58, 182, 102, 0.3); }
        }

        .hero-gradient {
          background: linear-gradient(135deg,
            rgba(195, 233, 86, 0.1) 0%,
            rgba(58, 182, 102, 0.05) 25%,
            rgba(1, 100, 94, 0.1) 50%,
            rgba(139, 118, 50, 0.05) 75%,
            rgba(195, 233, 86, 0.1) 100%);
          animation: glow 4s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen hero-gradient relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated Gradient Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#01645e]/20 to-[#3ab666]/20 rounded-full blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#c3e956]/20 to-[#8b7632]/20 rounded-full blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, 60, -60, 0],
            y: [0, -40, 40, 0],
            scale: [1, 1.3, 0.8, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#3ab666]/15 to-[#c3e956]/15 rounded-full blur-2xl"
        />
          </div>

      {/* Header moved to global SiteHeader */}

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Minimal Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Reduced floating elements for better performance */}
          <div className="absolute top-20 left-10 w-12 h-12 bg-gradient-to-br from-[#01645e]/15 to-[#3ab666]/15 rounded-lg shadow-lg backdrop-blur-sm"
               style={{
                 animation: 'float 8s ease-in-out infinite',
               }} />

          <div className="absolute bottom-32 right-20 w-10 h-10 bg-gradient-to-br from-[#c3e956]/15 to-[#8b7632]/15 rounded-full shadow-lg backdrop-blur-sm"
               style={{
                 animation: 'bounce 6s ease-in-out infinite',
               }} />
        </div>

        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 opacity-20">
            <LightParticles />
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center lg:text-right">
              <div className="mb-8">
                {!user ? (
                  // Content for non-logged in users
                  <>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 200 }} className="inline-block">
                      <div className="bg-gradient-to-r from-[#01645e]/15 to-[#3ab666]/15 border-2 border-[#01645e]/30 rounded-full px-8 py-4 mb-8 shadow-lg backdrop-blur-sm">
                        <span className="text-[#01645e] font-bold text-xl flex items-center gap-2">
                          <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            🚀
                          </motion.span>
                          التسجيل مفتوح الآن - انضم لرحلة الابتكار!
                        </span>
                  </div>
                </motion.div>

                    {pinnedHackathon ? (
                      // عرض الهاكاثون المثبت
                      <>
                        <h1 className="text-4xl md:text-6xl font-bold text-[#01645e] mb-6 leading-tight">
                          {pinnedHackathon.title}
                </h1>

                <p className="text-xl md:text-2xl text-[#8b7632] mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                          {pinnedHackathon.description}
                        </p>

                        <div className="bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 border border-[#01645e]/20 rounded-2xl p-6 mb-8">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-[#01645e]">{pinnedHackathon.participantCount || 0}</div>
                              <div className="text-sm text-[#8b7632]">مشارك</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-[#3ab666]">
                                {new Date(pinnedHackathon.registrationDeadline).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}
                              </div>
                              <div className="text-sm text-[#8b7632]">آخر موعد</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-[#c3e956]">
                                {new Date(pinnedHackathon.startDate).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}
                              </div>
                              <div className="text-sm text-[#8b7632]">تاريخ البداية</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-[#8b7632]">
                                {(pinnedHackathon.status === 'open' || pinnedHackathon.status === 'OPEN') ? '🟢 مفتوح' :
                                 (pinnedHackathon.status === 'draft' || pinnedHackathon.status === 'DRAFT') ? '🟡 قريباً' :
                                 (pinnedHackathon.status === 'closed' || pinnedHackathon.status === 'CLOSED') ? '🔴 مغلق' : '✅ منتهي'}
                              </div>
                              <div className="text-sm text-[#8b7632]">الحالة</div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      // عرض الـ Hero Section المحسن
                      <>
                        <motion.h1
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.8 }}
                          className="text-5xl md:text-7xl font-black text-[#01645e] mb-8 leading-tight"
                        >
                          <span className="block">حوّل</span>
                          <span className="text-[#3ab666] block">أفكارك</span>
                          <span className="block">إلى واقع</span>
                        </motion.h1>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7, duration: 0.8 }}
                          className="mb-8"
                        >
                          <p className="text-2xl md:text-3xl text-[#8b7632] mb-6 max-w-3xl mx-auto lg:mx-0 leading-relaxed font-medium">
                            انضم إلى <span className="text-[#01645e] font-bold">أكبر مجتمع</span> للمطورين والمبدعين في المملكة
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto lg:mx-0">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.9, duration: 0.5 }}
                              className="bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 border border-[#01645e]/20 rounded-xl p-4 text-center"
                            >
                              <div className="text-2xl font-bold text-[#01645e]">1000+</div>
                              <div className="text-sm text-[#8b7632]">مطور ومبدع</div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 1.0, duration: 0.5 }}
                              className="bg-gradient-to-r from-[#3ab666]/10 to-[#c3e956]/10 border border-[#3ab666]/20 rounded-xl p-4 text-center"
                            >
                              <div className="text-2xl font-bold text-[#3ab666]">100K+</div>
                              <div className="text-sm text-[#8b7632]">ريال جوائز</div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 1.1, duration: 0.5 }}
                              className="bg-gradient-to-r from-[#c3e956]/10 to-[#8b7632]/10 border border-[#c3e956]/20 rounded-xl p-4 text-center"
                            >
                              <div className="text-2xl font-bold text-[#c3e956]">24</div>
                              <div className="text-sm text-[#8b7632]">ساعة إبداع</div>
                            </motion.div>
                          </div>
                        </motion.div>
                      </>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2, duration: 0.8 }}
                      className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
                    >
                      <Link href={pinnedHackathon ? `/hackathons/${pinnedHackathon.id}/register` : "/register"}>
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="group bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-12 py-6 text-2xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden"
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-[#3ab666] to-[#c3e956] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          />
                          <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="relative z-10"
                          >
                      <Rocket className="w-8 h-8" />
                          </motion.div>
                          <span className="relative z-10">
                            {pinnedHackathon ? 'سجل في الهاكاثون' : 'ابدأ رحلتك الآن'}
                          </span>
                    </motion.button>
                  </Link>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white/90 backdrop-blur-sm text-[#01645e] px-8 py-6 text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 border border-[#01645e]/20"
                        onClick={() => setShowDemo(true)}
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Lightbulb className="w-6 h-6" />
                        </motion.div>
                        شاهد كيف تعمل
                      </motion.button>

                      <Link href="/login">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-transparent border-2 border-[#01645e] text-[#01645e] px-8 py-6 text-xl font-bold rounded-2xl hover:bg-[#01645e] hover:text-white transition-all duration-300 flex items-center gap-3"
                        >
                          <Users className="w-6 h-6" />
                          لديك حساب؟
                        </motion.button>
                      </Link>
                    </motion.div>

                    {/* Quick Benefits Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4, duration: 0.8 }}
                      className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto lg:mx-0"
                    >
                      {[
                        { icon: "🏆", title: "جوائز قيمة", desc: "حتى 100K ريال" },
                        { icon: "🤝", title: "شبكة علاقات", desc: "تواصل مع الخبراء" },
                        { icon: "📚", title: "تعلم جديد", desc: "مهارات متقدمة" },
                        { icon: "🚀", title: "فرص وظيفية", desc: "مسار مهني مميز" }
                      ].map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.5 + index * 0.1, duration: 0.5 }}
                          whileHover={{ scale: 1.05, y: -5 }}
                          className="bg-white/80 backdrop-blur-sm border border-[#01645e]/20 rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <div className="text-3xl mb-2">{benefit.icon}</div>
                          <div className="text-sm font-bold text-[#01645e] mb-1">{benefit.title}</div>
                          <div className="text-xs text-[#8b7632]">{benefit.desc}</div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </>
                ) : (
                  // Content for logged in users
                  <>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 200 }} className="inline-block">
                      <div className="bg-gradient-to-r from-[#3ab666]/10 to-[#c3e956]/10 border border-[#3ab666]/20 rounded-full px-6 py-3 mb-6">
                        <span className="text-[#3ab666] font-semibold text-lg">
                          {user.role === 'admin' ? '🔧 مرحباً أيها المدير' :
                           user.role === 'judge' ? '⚖️ مرحباً أيها المحكم' : '👨‍💻 مرحباً أيها المشارك'}
                        </span>
                      </div>
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl font-bold text-[#01645e] mb-6 leading-tight">
                      أهلاً بك، <span className="text-[#3ab666]">{user.name}</span>
                    </h1>

                    {pinnedHackathon ? (
                      // عرض الهاكاثون المثبت للمستخدمين المسجلين
                      <>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.8 }}
                          className="mb-8"
                        >
                          <h2 className="text-2xl md:text-3xl font-bold text-[#01645e] mb-4">
                            {pinnedHackathon.title}
                          </h2>
                          <p className="text-lg md:text-xl text-[#8b7632] mb-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            {pinnedHackathon.description}
                          </p>

                          <div className="bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 border border-[#01645e]/20 rounded-2xl p-6 mb-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                              <div>
                                <div className="text-2xl font-bold text-[#01645e]">{pinnedHackathon.participantCount || 0}</div>
                                <div className="text-sm text-[#8b7632]">مشارك</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-[#3ab666]">
                                  {new Date(pinnedHackathon.registrationDeadline).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}
                                </div>
                                <div className="text-sm text-[#8b7632]">آخر موعد</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-[#c3e956]">
                                  {new Date(pinnedHackathon.startDate).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}
                                </div>
                                <div className="text-sm text-[#8b7632]">تاريخ البداية</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-[#8b7632]">
                                  {pinnedHackathon.status === 'OPEN' ? '🟢 مفتوح' :
                                   pinnedHackathon.status === 'DRAFT' ? '🟡 قريباً' :
                                   pinnedHackathon.status === 'CLOSED' ? '🔴 مغلق' : '✅ منتهي'}
                                </div>
                                <div className="text-sm text-[#8b7632]">الحالة</div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    ) : (
                      <p className="text-xl md:text-2xl text-[#8b7632] mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                        {user.role === 'admin' ? 'يمكنك إدارة النظام ومتابعة المشاركين من لوحة التحكم' :
                         user.role === 'judge' ? 'يمكنك تقييم المشاريع ومتابعة عملية التحكيم' :
                         'يمكنك متابعة مشروعك وحالة مشاركتك في الهاكاثون'}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                      {pinnedHackathon && pinnedHackathon.status === 'OPEN' && (
                        <Link href={`/hackathons/${pinnedHackathon.id}/register`}>
                          <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="group bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-12 py-6 text-2xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden"
                          >
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-[#3ab666] to-[#c3e956] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            />
                            <motion.div
                              animate={{ rotate: [0, 15, -15, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="relative z-10"
                            >
                              <Rocket className="w-8 h-8" />
                            </motion.div>
                            <span className="relative z-10">سجل في الهاكاثون</span>
                          </motion.button>
                        </Link>
                      )}

                      <Link href={
                        user.role === 'admin' ? '/admin/dashboard' :
                        user.role === 'judge' ? '/judge' :
                        '/participant/dashboard'
                      }>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`${pinnedHackathon && pinnedHackathon.status === 'OPEN' ? 'bg-white text-[#01645e]' : 'bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white'} px-12 py-6 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3`}
                        >
                          <Settings className="w-6 h-6" />
                          {user.role === 'admin' ? 'لوحة التحكم' :
                           user.role === 'judge' ? 'منطقة التحكيم' :
                           'لوحة المشارك'}
                        </motion.button>
                      </Link>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white/90 backdrop-blur-sm text-[#01645e] px-8 py-6 text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 border border-[#01645e]/20"
                        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                      >
                        <Target className="w-6 h-6" />
                        استكشف المزيد
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Right Content - Enhanced Visuals */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: 0.2, duration: 1.2, type: "spring", stiffness: 100 }}
              className="relative h-[600px] flex items-center justify-center"
            >
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#01645e] to-[#3ab666] backdrop-blur-sm border-2 border-white/30">

                {/* Video Background */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover z-5"
                  style={{
                    pointerEvents: 'none',
                    backgroundColor: 'transparent',
                    background: 'linear-gradient(135deg, #01645e, #3ab666)',
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    perspective: '1000px'
                  }}
                  onLoadStart={() => console.log('Video loading started')}
                  onCanPlay={() => console.log('Video can play')}
                  onError={(e) => console.log('Video error:', e)}
                  onLoadedData={() => console.log('Video data loaded')}
                  onPlaying={() => console.log('Video is playing')}
                >
                  <source src="/Search - LottieFiles Platform.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Video Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-6 pointer-events-none" />

                {/* Simple Overlay for Better Video Visibility */}
                <div className="absolute inset-0 z-7">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#01645e]/5 to-[#3ab666]/5" />
                </div>

                {/* Subtle Video Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  {/* Minimal overlay for better video visibility */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"
                  />
                </div>



                {/* Simple Corner Decorations */}
                <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-[#c3e956]/20 to-transparent rounded-full blur-xl z-10" />
                <div className="absolute bottom-4 left-4 w-20 h-20 bg-gradient-to-tr from-[#01645e]/20 to-transparent rounded-full blur-xl z-10" />

                {/* Creative Success Indicators */}
                <div className="absolute top-6 left-6 z-30">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.8, type: "spring" }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/95 backdrop-blur-md rounded-2xl px-6 py-3 shadow-xl border border-white/20"
                  >
                    <div className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-lg"
                      >
                        🎉
                      </motion.span>
                      <span className="text-sm font-bold text-[#01645e]">+1000 مشارك</span>
                    </div>
                  </motion.div>
                </div>

                <div className="absolute bottom-6 right-6 z-30">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 0.8, type: "spring" }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/95 backdrop-blur-md rounded-2xl px-6 py-3 shadow-xl border border-white/20"
                  >
                    <div className="flex items-center gap-2">
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-lg"
                      >
                        💰
                      </motion.span>
                      <span className="text-sm font-bold text-[#3ab666]">100K+ جوائز</span>
                    </div>
                  </motion.div>
                </div>

                {/* Creative Center Element */}
                <div className="absolute inset-0 flex items-center justify-center z-25">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 1, type: "spring", stiffness: 100 }}
                    className="relative"
                  >
                    <motion.div
                      animate={{
                        rotate: 360,
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                        scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full border-2 border-white/30 flex items-center justify-center shadow-2xl"
                    >
                      <motion.span
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="text-2xl"
                      >
                        💡
                      </motion.span>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white/50 backdrop-blur-sm relative overflow-hidden">

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 border border-[#01645e]/20 rounded-full px-6 py-3 mb-6">
              <span className="text-[#01645e] font-semibold">✨ لماذا تشارك معنا؟</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#01645e] mb-6">فرصة <span className="text-[#3ab666]">لا تُعوض</span> للإبداع</h2>
            <p className="text-xl text-[#8b7632] max-w-3xl mx-auto leading-relaxed">انضم إلى مجتمع المبدعين والمطورين لتطوير حلول مبتكرة تخدم المجتمع وتحقق أثراً إيجابياً حقيقياً</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Brain, title: "طور مهاراتك", desc: "اكتسب خبرات جديدة في البرمجة والتصميم والابتكار من خلال التحديات الحقيقية", gradient: "from-[#01645e] to-[#3ab666]" },
              { icon: Users, title: "تواصل مع المبدعين", desc: "التق بأفضل المطورين والمصممين وكون شبكة علاقات مهنية قوية", gradient: "from-[#3ab666] to-[#c3e956]" },
              { icon: Award, title: "جوائز قيمة", desc: "فرصة للفوز بجوائز مالية ومعنوية قيمة وشهادات معتمدة", gradient: "from-[#c3e956] to-[#8b7632]" },
              { icon: Heart, title: "أثر إيجابي", desc: "ساهم في تطوير حلول تخدم المجتمع وتحدث فرقاً حقيقياً في حياة الناس", gradient: "from-[#8b7632] to-[#01645e]" },
            ].map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.6 }} whileHover={{ scale: 1.05, y: -10 }} className="group relative">
                <div className="glass rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-white/20 relative overflow-hidden">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                  <div className="relative z-10">
                    <div className="flex justify-center mb-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[#01645e] mb-4 text-center group-hover:text-[#3ab666] transition-colors">{feature.title}</h3>
                    <p className="text-[#8b7632] text-center leading-relaxed">{feature.desc}</p>
                  </div>

                  {/* Decorative Corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-3xl" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm relative overflow-hidden">
        {/* Background 3D Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-10 right-10 opacity-20">
            <LightParticles />
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10">
            <FloatingCubes />
          </div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 border border-[#01645e]/20 rounded-full px-6 py-3 mb-6">
              <span className="text-[#01645e] font-semibold">⏰ الجدول الزمني</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#01645e] mb-6">
              رحلة <span className="text-[#3ab666]">الابتكار</span> خطوة بخطوة
            </h2>
            <p className="text-xl text-[#8b7632] max-w-3xl mx-auto">
              من التسجيل إلى الفوز - تعرف على مراحل الهاكاثون والجدول الزمني المفصل
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                phase: "المرحلة الأولى",
                title: "التسجيل والتأهيل",
                duration: "أسبوعان",
                color: "#01645e",
                icon: Users,
                desc: "فتح باب التسجيل ومراجعة الطلبات وتكوين الفرق"
              },
              {
                phase: "المرحلة الثانية",
                title: "العصف الذهني",
                duration: "3 أيام",
                color: "#3ab666",
                icon: Lightbulb,
                desc: "تطوير الأفكار وتحديد المشاكل وإيجاد الحلول المبتكرة"
              },
              {
                phase: "المرحلة الثالثة",
                title: "التطوير والبناء",
                duration: "48 ساعة",
                color: "#c3e956",
                icon: Code,
                desc: "تطوير النماذج الأولية والحلول التقنية"
              },
              {
                phase: "المرحلة الرابعة",
                title: "العرض والتقييم",
                duration: "يوم واحد",
                color: "#8b7632",
                icon: Trophy,
                desc: "عرض المشاريع أمام لجنة التحكيم وإعلان النتائج"
              }
            ].map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="relative"
              >
                <div className="glass rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-white/20 relative overflow-hidden">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg" style={{ backgroundColor: phase.color }}>
                      <phase.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-[#8b7632] mb-2">{phase.phase}</div>
                    <h3 className="text-xl font-bold text-[#01645e] mb-3">{phase.title}</h3>
                    <div className="inline-block bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 rounded-full px-4 py-2 mb-4">
                      <span className="text-[#01645e] font-semibold text-sm">{phase.duration}</span>
                    </div>
                    <p className="text-[#8b7632] text-sm leading-relaxed">{phase.desc}</p>
                  </div>
                </div>

                {/* Connection Line */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-[#01645e] to-[#3ab666] transform -translate-y-1/2 z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Criteria Section */}
      <section id="criteria" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 border border-[#01645e]/20 rounded-full px-6 py-3 mb-6">
              <span className="text-[#01645e] font-semibold">📊 معايير التقييم</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#01645e] mb-6">
              <span className="text-[#3ab666]">خمسة معايير</span> أساسية
            </h2>
            <p className="text-xl text-[#8b7632] max-w-3xl mx-auto">
              نظام تقييم شامل ومتوازن يغطي جميع جوانب المشروع من الفكرة إلى التنفيذ
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "الجدوى",
                weight: "20%",
                color: "#01645e",
                icon: Target,
                desc:
                  "مدى قدرة الفكرة على تحقيق قيمة واضحة وعائد ملموس للمؤسسة، مع قابلية استدامتها على المدى الطويل، وتوازن التكلفة مع الفوائد المتوقعة.",
              },
              {
                title: "ابتكارية الفكرة",
                weight: "25%",
                color: "#3ab666",
                icon: Lightbulb,
                desc:
                  "مدى إبداع الفكرة وجديدتها. هل تقدم الفكرة حلولًا مبتكرة لتحديات أو احتياجات قائمة؟ هل هناك تفكير متجدد يعكس تميز الفكرة ويعزز من فعالية العمليات في المؤسسة؟",
              },
              {
                title: "قابلية التطبيق",
                weight: "25%",
                color: "#c3e956",
                icon: Settings,
                desc:
                  "إمكانية تنفيذ الفكرة باستخدام الموارد المتاحة ضمن المعايير والقيود المحددة. هل يمكن تطبيق الفكرة في الإطار الزمني والمالي المحدد؟ وهل الفكرة قابلة للتنفيذ ضمن البيئات والظروف المتاحة؟",
              },
              {
                title: "التأثير على المؤسسة",
                weight: "20%",
                color: "#8b7632",
                icon: TrendingUp,
                desc:
                  "يركز هذا المعيار على تأثير الفكرة في تحسين أداء المؤسسة. هل ستسهم الفكرة في تعزيز كفاءة العمل ورفع الإنتاجية داخل المؤسسة؟ وهل سيكون لها تأثير إيجابي على العمليات والنتائج التشغيلية؟",
              },
              {
                title: "مهارات العرض",
                weight: "10%",
                color: "#01645e",
                icon: Monitor,
                desc:
                  "يتم تقييم طريقة تقديم الفكرة من قبل الفريق. كيف يعرض الفريق فكرته بشكل احترافي ومقنع؟ هل العرض واضح ومنظم بطريقة تسهل فهم الفكرة من قبل المعنيين في المؤسسة؟",
              },
            ].map((criterion, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.6 }} className="glass rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-white/20 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg" style={{ backgroundColor: criterion.color }}>
                    {criterion.weight}
                  </div>
                  <h3 className="text-xl font-bold text-[#01645e]">{criterion.title}</h3>
                </div>
                <p className="text-[#8b7632]">{criterion.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#01645e]/5 to-[#3ab666]/5 relative overflow-hidden">
        {/* Background 3D Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-10 left-10 opacity-30">
            <LightParticles />
          </div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 border border-[#01645e]/20 rounded-full px-6 py-3 mb-6">
              <span className="text-[#01645e] font-semibold">🏆 الجوائز والحوافز</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#01645e] mb-6">
              جوائز <span className="text-[#3ab666]">استثنائية</span> في انتظارك
            </h2>
            <p className="text-xl text-[#8b7632] max-w-3xl mx-auto">
              نقدر إبداعك ونكافئ تميزك بجوائز قيمة ومميزات حصرية
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                rank: "المركز الأول",
                prize: "100,000 ريال",
                color: "from-yellow-400 to-yellow-600",
                icon: "🥇",
                benefits: ["جائزة مالية", "شهادة معتمدة", "فرصة تطوير المشروع", "لقاء مع المسؤولين"]
              },
              {
                rank: "المركز الثاني",
                prize: "75,000 ريال",
                color: "from-gray-300 to-gray-500",
                icon: "🥈",
                benefits: ["جائزة مالية", "شهادة معتمدة", "ورش تدريبية", "شبكة علاقات مهنية"]
              },
              {
                rank: "المركز الثالث",
                prize: "50,000 ريال",
                color: "from-amber-600 to-amber-800",
                icon: "🥉",
                benefits: ["جائزة مالية", "شهادة معتمدة", "دورات تطويرية", "فرص تدريبية"]
              }
            ].map((prize, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="relative"
              >
                <div className="glass rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-white/20 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${prize.color} opacity-5`} />

                  <div className="relative z-10 text-center">
                    <div className="text-6xl mb-4">{prize.icon}</div>
                    <h3 className="text-2xl font-bold text-[#01645e] mb-2">{prize.rank}</h3>
                    <div className="text-3xl font-black text-[#3ab666] mb-6">{prize.prize}</div>

                    <div className="space-y-3">
                      {prize.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-[#3ab666] ml-2" />
                          <span className="text-[#8b7632]">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg relative overflow-hidden">
              {/* Background Trophy Scene */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <TrophyCup3DScene />
              </div>

              <div className="relative z-10">
              <h3 className="text-2xl font-bold text-[#01645e] mb-4">مميزات إضافية لجميع المشاركين</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: "📜", title: "شهادة مشاركة", desc: "شهادة معتمدة لجميع المشاركين" },
                  { icon: "🤝", title: "شبكة علاقات", desc: "تواصل مع خبراء ومختصين" },
                  { icon: "📚", title: "ورش تدريبية", desc: "ورش مجانية لتطوير المهارات" },
                  { icon: "💼", title: "فرص وظيفية", desc: "فرص عمل مع الشركات الراعية" }
                ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      className="text-center bg-white/50 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300"
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                    <div className="text-3xl mb-2">{benefit.icon}</div>
                    <h4 className="font-bold text-[#01645e] mb-1">{benefit.title}</h4>
                    <p className="text-sm text-[#8b7632]">{benefit.desc}</p>
                    </motion.div>
                ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Bottom CTA */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Background 3D Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <InnovationNetwork />
          </div>
          <div className="absolute top-1/4 right-1/4 opacity-20">
            <FloatingCubes />
          </div>
          <div className="absolute bottom-1/4 left-1/4 opacity-30">
            <LightParticles />
          </div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-3xl p-12 shadow-2xl text-white relative overflow-hidden"
          >
            {/* Inner 3D Elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 right-4 opacity-20">
                <LightParticles />
              </div>
              <div className="absolute bottom-4 left-4 opacity-15">
                <FloatingCubes />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              هل أنت مستعد لتغيير المستقبل؟
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              انضم إلى آلاف المبدعين والمطورين في رحلة الابتكار. سجل الآن ولا تفوت هذه الفرصة الذهبية!
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-[#01645e] px-12 py-6 text-2xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Rocket className="w-8 h-8" />
                  سجل الآن مجاناً
                </motion.button>
              </Link>

              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/10 backdrop-blur-sm border-2 border-white text-white px-10 py-6 text-xl font-bold rounded-2xl shadow-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Trophy className="w-6 h-6" />
                  دخول المحكمين
                </motion.button>
              </Link>
            </div>

            <div className="mt-8 text-center">
              <p className="text-white/80">
                ⏰ التسجيل مفتوح لفترة محدودة - لا تفوت الفرصة!
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md shadow-inner border-t border-[#c3e956]/30 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-[#8b7632]">
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} هاكاثون الابتكار الحكومي
          </p>
        </div>
      </footer>

      {/* Background Circles */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#c3e956]/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/4" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#01645e]/10 rounded-full blur-[150px] translate-x-1/2 translate-y-1/4" />

    </div>
    </>
  )
}
