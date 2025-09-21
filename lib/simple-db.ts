// Simple database operations using direct SQL queries
import { Pool } from 'pg'

let pool: Pool | null = null

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
  }
  return pool
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
  const client = getPool()
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const query = `
    INSERT INTO users (id, name, email, password, phone, city, nationality, role, "isActive", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING *
  `
  
  const values = [
    id,
    userData.name,
    userData.email,
    userData.password,
    userData.phone || null,
    userData.city || null,
    userData.nationality || null,
    userData.role,
    userData.isActive
  ]
  
  const result = await client.query(query, values)
  return result.rows[0]
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const client = getPool()
  const query = 'SELECT * FROM users WHERE email = $1'
  const result = await client.query(query, [email])
  return result.rows[0] || null
}

export async function findUserById(id: string): Promise<User | null> {
  const client = getPool()
  const query = 'SELECT * FROM users WHERE id = $1'
  const result = await client.query(query, [id])
  return result.rows[0] || null
}

export async function getPinnedHackathon(): Promise<Hackathon | null> {
  const client = getPool()
  const query = 'SELECT * FROM hackathons WHERE "isPinned" = true LIMIT 1'
  const result = await client.query(query)
  return result.rows[0] || null
}

export async function getAllHackathons(): Promise<Hackathon[]> {
  const client = getPool()
  const query = 'SELECT * FROM hackathons ORDER BY "createdAt" DESC'
  const result = await client.query(query)
  return result.rows
}

export async function testConnection(): Promise<boolean> {
  try {
    const client = getPool()
    await client.query('SELECT 1')
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}
