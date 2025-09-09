"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

type Role = "admin" | "judge" | "participant"

interface User {
	id: string
	name: string
	email: string
	role: Role
}

interface AuthContextValue {
	user: User | null
	loading: boolean
	login: (email: string, password: string) => Promise<boolean>
	logout: () => void
	refreshUser: () => Promise<any>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const router = useRouter()

	// Check session validity on mount and periodically
	React.useEffect(() => {
		const verifySession = async () => {
			try {
				console.log('🔍 Verifying session on mount...')
				const response = await fetch('/api/verify-session', {
					method: 'GET',
					credentials: 'include',
					headers: {
						'Cache-Control': 'no-cache'
					}
				})

				if (response.ok) {
					const data = await response.json()
					if (data.user) {
						console.log('✅ Session verified on mount:', data.user.email)
						setUser(data.user)
					} else {
						console.log('❌ No user data in response')
						setUser(null)
					}
				} else {
					console.log('❌ Session verification failed, status:', response.status)
					// Don't set user to null immediately, maybe it's a temporary error
					if (response.status === 401) {
						setUser(null)
					}
				}
			} catch (error) {
				console.error('❌ Session verification failed on mount:', error)
				// Don't set user to null on network errors
			} finally {
				setLoading(false)
			}
		}

		verifySession()

		// Set up periodic session verification (every 10 minutes)
		const interval = setInterval(verifySession, 10 * 60 * 1000)
		return () => clearInterval(interval)
	}, [])

	const login = useCallback(async (email: string, password: string) => {
		try {
			const res = await fetch("/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			})
			const data = await res.json()
			if (!res.ok) return false
			setUser(data.user as User)

			// Redirect based on user role
			switch (data.user.role) {
				case 'admin':
					router.push('/admin/dashboard')
					break
				case 'judge':
					router.push('/judge/dashboard')
					break
				case 'participant':
					router.push('/participant/dashboard')
					break
				default:
					router.push('/admin')
			}

			return true
		} catch {
			return false
		}
	}, [router])

	const logout = useCallback(async () => {
		try {
			await fetch("/api/logout", { method: "POST" })
		} finally {
			setUser(null)
		}
	}, [])

	const refreshUser = useCallback(async () => {
		try {
			console.log('🔄 Refreshing user session...')
			const res = await fetch("/api/verify-session", {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Cache-Control': 'no-cache',
					'Pragma': 'no-cache'
				}
			})

			console.log('📊 Refresh response status:', res.status)

			if (res.ok) {
				const data = await res.json()
				console.log('📊 Session verification response:', data)

				if (data.user) {
					console.log('✅ User session refreshed successfully:', data.user.email, 'role:', data.user.role)
					setUser(data.user)
					return data.user
				} else {
					console.log('❌ No user data in response')
					return null
				}
			} else {
				console.log('❌ Session verification failed, status:', res.status)
				if (res.status === 401) {
					setUser(null)
				}
				return null
			}
		} catch (error) {
			console.error('❌ Failed to refresh user:', error)
			return null
		}
	}, [])

	return <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error("useAuth must be used within AuthProvider")
	return ctx
} 