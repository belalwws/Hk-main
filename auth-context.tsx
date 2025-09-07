"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const MOCK_USERS = [
  { id: "1", email: "judge1@email.com", password: "pass123", name: "المحكم الأول", role: "judge" },
  { id: "2", email: "judge2@email.com", password: "pass123", name: "المحكم الثاني", role: "judge" },
  { id: "3", email: "judge3@email.com", password: "pass123", name: "المحكم الثالث", role: "judge" },
]

function safeParseJSON(str: string) {
  try {
    if (!str || str === "undefined" || str === "null") {
      return null
    }
    return JSON.parse(str)
  } catch {
    return null
  }
}

function safeStringifyJSON(obj: any) {
  try {
    return JSON.stringify(obj)
  } catch {
    return ""
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = () => {
      try {
        if (typeof window !== "undefined") {
          const savedUser = localStorage.getItem("hackathon_user")
          const parsedUser = safeParseJSON(savedUser || "")
          if (parsedUser && parsedUser.id) {
            setUser(parsedUser)
          }
        }
      } catch (error) {
        console.error("Error loading user:", error)
        if (typeof window !== "undefined") {
          localStorage.removeItem("hackathon_user")
        }
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return false
      const nextUser: User = {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.name,
        role: data.user?.role,
      }
      setUser(nextUser)
      try {
        if (typeof window !== 'undefined') {
          const userString = safeStringifyJSON(nextUser)
          if (userString) localStorage.setItem('hackathon_user', userString)
        }
      } catch (e) {
        console.error('Error saving user:', e)
      }
      return true
    } catch (e) {
      return false
    }
  }

  const logout = () => {
    setUser(null)
    try {
      fetch('/api/logout', { method: 'POST' }).catch(() => {})
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hackathon_user')
        localStorage.removeItem('hackathon_evaluations')
      }
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
