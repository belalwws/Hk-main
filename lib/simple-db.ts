// Simple database operations using Supabase REST API
const SUPABASE_URL = 'https://yjsikwfrmufeuftfyyrl.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlqc2lrd2ZybXVmZXVmdGZ5eXJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQwMDk2NywiZXhwIjoyMDczOTc2OTY3fQ.dwf6pUy1laCCfC7vgK1yBdtgBbmZVk3asy0eROXgeB4'

async function supabaseQuery(table: string, method: 'GET' | 'POST' | 'PATCH' = 'GET', data?: any, filters?: string) {
  const url = `${SUPABASE_URL}/rest/v1/${table}${filters ? `?${filters}` : ''}`

  const response = await fetch(url, {
    method,
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: data ? JSON.stringify(data) : undefined
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Supabase query failed:', response.status, errorText)
    throw new Error(`Supabase query failed: ${response.statusText}`)
  }

  return response.json()
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  phone?: string
  city?: string
  nationality?: string
  role: 'admin' | 'judge' | 'participant'
  isActive: boolean
  createdAt: Date
}

export interface Hackathon {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  registrationDeadline: Date
  status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled'
  isPinned: boolean
  createdAt: Date
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const newUser = {
    id,
    name: userData.name,
    email: userData.email,
    password: userData.password,
    phone: userData.phone || null,
    city: userData.city || null,
    nationality: userData.nationality || null,
    role: userData.role,
    isActive: userData.isActive,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const result = await supabaseQuery('users', 'POST', newUser)
  return result[0]
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await supabaseQuery('users', 'GET', null, `email=eq.${email}`)
    return result[0] || null
  } catch (error) {
    console.error('Error finding user by email:', error)
    return null
  }
}

export async function findUserById(id: string): Promise<User | null> {
  try {
    const result = await supabaseQuery('users', 'GET', null, `id=eq.${id}`)
    return result[0] || null
  } catch (error) {
    console.error('Error finding user by id:', error)
    return null
  }
}

export async function getPinnedHackathon(): Promise<Hackathon | null> {
  try {
    const result = await supabaseQuery('hackathons', 'GET', null, 'isPinned=eq.true&limit=1')
    return result[0] || null
  } catch (error) {
    console.error('Error getting pinned hackathon:', error)
    return null
  }
}

export async function getAllHackathons(): Promise<Hackathon[]> {
  try {
    const result = await supabaseQuery('hackathons', 'GET', null, 'order=createdAt.desc')
    return result
  } catch (error) {
    console.error('Error getting all hackathons:', error)
    return []
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    await supabaseQuery('users', 'GET', null, 'limit=1')
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}
