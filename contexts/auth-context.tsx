"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"

type Role = "admin" | "judge" | "participant" | "supervisor"

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
	forceSetUser: (userData: User) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const [initialized, setInitialized] = useState(false)
	const router = useRouter()

	// Check if current path is a supervisor invitation page
	const isInvitationPage = () => {
		if (typeof window === 'undefined') return false
		const pathname = window.location.pathname
		return pathname.includes('/supervisor/invitation/') ||
		       pathname.startsWith('/supervisor/invitation/')
	}

	// Initialize auth state on mount
	useEffect(() => {
		if (initialized) return

		const initializeAuth = async () => {
			try {
				console.log('🚀 Initializing auth state...')

				// Check if we're on the client side
				if (typeof window === 'undefined') {
					setLoading(false)
					setInitialized(true)
					return
				}

				// Skip auth check for invitation pages
				if (isInvitationPage()) {
					console.log('🔓 Skipping auth check for invitation page')
					setLoading(false)
					setInitialized(true)
					return
				}

				// First try to get user from localStorage as backup
				const storedUser = localStorage.getItem('auth-user')
				const lastVerified = localStorage.getItem('auth-last-verified')
				const now = Date.now()

				// If we have a stored user and it was verified recently (within 5 minutes), use it
				if (storedUser && lastVerified && (now - parseInt(lastVerified)) < 5 * 60 * 1000) {
					try {
						const userData = JSON.parse(storedUser)
						console.log('💾 Using cached user from localStorage:', userData.email)
						setUser(userData)
						setLoading(false)
						return
					} catch (e) {
						console.log('❌ Invalid localStorage data, clearing...')
						if (typeof window !== 'undefined') {
							localStorage.removeItem('auth-user')
							localStorage.removeItem('auth-last-verified')
						}
					}
				}

				// Set user from localStorage first if available
				if (storedUser) {
					try {
						const userData = JSON.parse(storedUser)
						console.log('💾 Found user in localStorage:', userData.email)
						setUser(userData)
					} catch (e) {
						console.log('❌ Invalid localStorage data, clearing...')
						if (typeof window !== 'undefined') {
							localStorage.removeItem('auth-user')
						}
					}
				}

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
						console.log('✅ User verified from server:', data.user.email, 'role:', data.user.role)
						setUser(data.user)
						// Store in localStorage as backup with timestamp
						if (typeof window !== 'undefined') {
							localStorage.setItem('auth-user', JSON.stringify(data.user))
							localStorage.setItem('auth-last-verified', now.toString())
						}
					} else {
						console.log('❌ No user in response')
						setUser(null)
						if (typeof window !== 'undefined') {
							localStorage.removeItem('auth-user')
							localStorage.removeItem('auth-last-verified')
						}
					}
				} else {
					console.log('❌ Auth init failed, status:', response.status)
					// If we have localStorage user and it's not too old, keep it
					if (storedUser && lastVerified && (now - parseInt(lastVerified)) < 30 * 60 * 1000) {
						console.log('⚠️ Server verification failed but keeping cached user')
					} else {
						setUser(null)
						if (typeof window !== 'undefined') {
							localStorage.removeItem('auth-user')
							localStorage.removeItem('auth-last-verified')
						}
					}
				}
			} catch (error) {
				console.error('❌ Auth initialization error:', error)
				// Keep localStorage user if available
				if (typeof window !== 'undefined') {
					const storedUser = localStorage.getItem('auth-user')
					if (!storedUser) {
						setUser(null)
					}
				} else {
					setUser(null)
				}
			} finally {
				setLoading(false)
				setInitialized(true)
			}
		}

		initializeAuth()
	}, [initialized])

	const login = useCallback(async (email: string, password: string) => {
		try {
			console.log('🔐 Attempting login for:', email)
			const res = await fetch("/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			})
			const data = await res.json()
			console.log('📊 Login response:', { status: res.status, data })

			if (!res.ok) return false

			console.log('✅ Login successful for:', data.user.email, 'role:', data.user.role)
			setUser(data.user as User)

			// Store in localStorage as backup
			if (typeof window !== 'undefined') {
				localStorage.setItem('auth-user', JSON.stringify(data.user))
			}

			// Redirect based on user role
			switch (data.user.role) {
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
					router.push('/admin')
			}

			return true
		} catch (error) {
			console.error("❌ Login failed:", error)
			return false
		}
	}, [router])

	const logout = useCallback(async () => {
		try {
			console.log('🚪 Logging out user...')
			await fetch("/api/logout", { method: "POST" })
		} finally {
			setUser(null)
			if (typeof window !== 'undefined') {
				localStorage.removeItem('auth-user')
				localStorage.removeItem('auth-last-verified')
			}
			console.log('✅ User logged out and localStorage cleared')
		}
	}, [])

	const refreshUser = useCallback(async () => {
		try {
			console.log('🔄 Refreshing user session...')

			// Check if we recently verified (within 2 minutes)
			if (typeof window !== 'undefined') {
				const lastVerified = localStorage.getItem('auth-last-verified')
				const now = Date.now()
				if (lastVerified && (now - parseInt(lastVerified)) < 2 * 60 * 1000) {
					console.log('⚡ Skipping refresh - recently verified')
					return user
				}
			}

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
					// Update localStorage with timestamp
					if (typeof window !== 'undefined') {
						localStorage.setItem('auth-user', JSON.stringify(data.user))
						localStorage.setItem('auth-last-verified', Date.now().toString())
					}
					return data.user
				} else {
					console.log('❌ No user in refresh response')
					return null
				}
			} else {
				console.log('❌ Refresh failed, status:', res.status)
				// Only clear user on 401 (unauthorized)
				if (res.status === 401) {
					console.log('🚪 Setting user to null due to 401')
					setUser(null)
					if (typeof window !== 'undefined') {
						localStorage.removeItem('auth-user')
						localStorage.removeItem('auth-last-verified')
					}
				}
				return user // Return current user if refresh fails but not unauthorized
			}
		} catch (error) {
			console.error('❌ Refresh error:', error)
			return null
		}
	}, [])

	// Force set user (for registration flow)
	const forceSetUser = useCallback((userData: User) => {
		console.log('🔥 Force setting user:', userData.email, 'role:', userData.role)
		setUser(userData)
		if (typeof window !== 'undefined') {
			localStorage.setItem('auth-user', JSON.stringify(userData))
		}
	}, [])

	return <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, forceSetUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error("useAuth must be used within AuthProvider")
	return ctx
} 