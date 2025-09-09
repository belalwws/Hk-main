"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
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
	const [initialized, setInitialized] = useState(false)
	const router = useRouter()

	// Initialize auth state on mount
	useEffect(() => {
		if (initialized) return

		const initializeAuth = async () => {
			try {
				console.log('🚀 Initializing auth state...')

				const response = await fetch('/api/verify-session', {
					method: 'GET',
					credentials: 'include',
					headers: {
						'Cache-Control': 'no-cache',
						'Pragma': 'no-cache'
					}
				})

				console.log('📡 Auth init response status:', response.status)

				if (response.ok) {
					const data = await response.json()
					console.log('📊 Auth init response data:', data)

					if (data.user) {
						console.log('✅ User found on init:', data.user.email, 'role:', data.user.role)
						setUser(data.user)
					} else {
						console.log('❌ No user in response')
						setUser(null)
					}
				} else {
					console.log('❌ Auth init failed, status:', response.status)
					setUser(null)
				}
			} catch (error) {
				console.error('❌ Auth initialization error:', error)
				setUser(null)
			} finally {
				setLoading(false)
				setInitialized(true)
			}
		}

		initializeAuth()
	}, [initialized])

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
				console.log('📊 Refresh response data:', data)

				if (data.user) {
					console.log('✅ User refreshed:', data.user.email, 'role:', data.user.role)
					setUser(data.user)
					return data.user
				} else {
					console.log('❌ No user in refresh response')
					return null
				}
			} else {
				console.log('❌ Refresh failed, status:', res.status)
				if (res.status === 401) {
					console.log('🚪 Setting user to null due to 401')
					setUser(null)
				}
				return null
			}
		} catch (error) {
			console.error('❌ Refresh error:', error)
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