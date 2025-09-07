import fs from 'fs'
import path from 'path'

export interface Hackathon {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxParticipants?: number
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'COMPLETED'
  prizes: {
    first: string
    second: string
    third: string
  }
  requirements: string[]
  categories: string[]
  createdAt: string
  updatedAt: string
  createdBy: string // admin user id
}

export interface HackathonParticipant {
  id: string
  hackathonId: string
  userId: string
  teamName?: string
  projectTitle?: string
  projectDescription?: string
  githubRepo?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  submittedAt: string
  approvedAt?: string
  rejectedAt?: string
  score?: number
  feedback?: string
}

const HACKATHONS_FILE = path.join(process.cwd(), 'data', 'hackathons.json')
const PARTICIPANTS_FILE = path.join(process.cwd(), 'data', 'hackathon-participants.json')

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Initialize files if they don't exist
if (!fs.existsSync(HACKATHONS_FILE)) {
  fs.writeFileSync(HACKATHONS_FILE, JSON.stringify([], null, 2))
}

if (!fs.existsSync(PARTICIPANTS_FILE)) {
  fs.writeFileSync(PARTICIPANTS_FILE, JSON.stringify([], null, 2))
}

// Hackathon Management Functions
export function getAllHackathons(): Hackathon[] {
  try {
    const data = fs.readFileSync(HACKATHONS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading hackathons:', error)
    return []
  }
}

export function getHackathonById(id: string): Hackathon | null {
  const hackathons = getAllHackathons()
  return hackathons.find(h => h.id === id) || null
}

export function getActiveHackathons(): Hackathon[] {
  const hackathons = getAllHackathons()
  const now = new Date().toISOString()
  return hackathons.filter(h => 
    h.status === 'OPEN' && 
    h.registrationDeadline > now
  )
}

export function createHackathon(hackathon: Omit<Hackathon, 'id' | 'createdAt' | 'updatedAt'>): Hackathon {
  const hackathons = getAllHackathons()
  const newHackathon: Hackathon = {
    ...hackathon,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  hackathons.push(newHackathon)
  fs.writeFileSync(HACKATHONS_FILE, JSON.stringify(hackathons, null, 2))
  return newHackathon
}

export function updateHackathon(id: string, updates: Partial<Hackathon>): Hackathon | null {
  const hackathons = getAllHackathons()
  const index = hackathons.findIndex(h => h.id === id)
  
  if (index === -1) return null
  
  hackathons[index] = {
    ...hackathons[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  fs.writeFileSync(HACKATHONS_FILE, JSON.stringify(hackathons, null, 2))
  return hackathons[index]
}

export function deleteHackathon(id: string): boolean {
  const hackathons = getAllHackathons()
  const filteredHackathons = hackathons.filter(h => h.id !== id)
  
  if (filteredHackathons.length === hackathons.length) return false
  
  fs.writeFileSync(HACKATHONS_FILE, JSON.stringify(filteredHackathons, null, 2))
  
  // Also remove all participants for this hackathon
  const participants = getAllHackathonParticipants()
  const filteredParticipants = participants.filter(p => p.hackathonId !== id)
  fs.writeFileSync(PARTICIPANTS_FILE, JSON.stringify(filteredParticipants, null, 2))
  
  return true
}

// Hackathon Participants Management
export function getAllHackathonParticipants(): HackathonParticipant[] {
  try {
    const data = fs.readFileSync(PARTICIPANTS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading hackathon participants:', error)
    return []
  }
}

export function getHackathonParticipants(hackathonId: string): HackathonParticipant[] {
  const participants = getAllHackathonParticipants()
  return participants.filter(p => p.hackathonId === hackathonId)
}

export function getUserHackathonParticipations(userId: string): HackathonParticipant[] {
  const participants = getAllHackathonParticipants()
  return participants.filter(p => p.userId === userId)
}

export function registerForHackathon(
  hackathonId: string, 
  userId: string, 
  data: Partial<HackathonParticipant>
): HackathonParticipant {
  const participants = getAllHackathonParticipants()
  
  // Check if user already registered for this hackathon
  const existingParticipation = participants.find(p => 
    p.hackathonId === hackathonId && p.userId === userId
  )
  
  if (existingParticipation) {
    throw new Error('المستخدم مسجل بالفعل في هذا الهاكاثون')
  }
  
  const newParticipant: HackathonParticipant = {
    id: generateId(),
    hackathonId,
    userId,
    status: 'PENDING',
    submittedAt: new Date().toISOString(),
    ...data
  }
  
  participants.push(newParticipant)
  fs.writeFileSync(PARTICIPANTS_FILE, JSON.stringify(participants, null, 2))
  return newParticipant
}

export function updateHackathonParticipant(
  id: string, 
  updates: Partial<HackathonParticipant>
): HackathonParticipant | null {
  const participants = getAllHackathonParticipants()
  const index = participants.findIndex(p => p.id === id)
  
  if (index === -1) return null
  
  participants[index] = {
    ...participants[index],
    ...updates
  }
  
  // Add timestamp for status changes
  if (updates.status === 'APPROVED') {
    participants[index].approvedAt = new Date().toISOString()
  } else if (updates.status === 'REJECTED') {
    participants[index].rejectedAt = new Date().toISOString()
  }
  
  fs.writeFileSync(PARTICIPANTS_FILE, JSON.stringify(participants, null, 2))
  return participants[index]
}

// Utility function
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Statistics
export function getHackathonStats(hackathonId: string) {
  const participants = getHackathonParticipants(hackathonId)
  
  return {
    total: participants.length,
    pending: participants.filter(p => p.status === 'PENDING').length,
    approved: participants.filter(p => p.status === 'APPROVED').length,
    rejected: participants.filter(p => p.status === 'REJECTED').length
  }
}
