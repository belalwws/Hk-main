import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ConditionalHeader } from "@/components/conditional-header"
import { HeartbeatTracker } from "@/components/heartbeat-tracker"

export const metadata: Metadata = {
  title: "هاكاثون الابتكار التقني",
  description: "منصة متكاملة لإدارة وتنظيم الهاكاثونات التقنية",
  generator: "v0.app",
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans">
        <AuthProvider>
          <HeartbeatTracker />
          <ConditionalHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
