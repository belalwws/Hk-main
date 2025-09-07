// Temporary storage for participants until database is fixed
import fs from 'fs'
import path from 'path'

const STORAGE_FILE = path.join(process.cwd(), 'participants-data.json')

export interface ParticipantData {
  id: string
  name: string
  email: string
  phone: string
  city: string
  nationality: string
  teamType: 'INDIVIDUAL' | 'TEAM'
  preferredRole: string
  teamPreference?: string
  experience?: string
  motivation?: string
  skills?: string
  passwordHash: string
  registeredAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export function saveParticipant(participant: Omit<ParticipantData, 'id' | 'registeredAt' | 'status'>): ParticipantData {
  const newParticipant: ParticipantData = {
    ...participant,
    id: Date.now().toString(),
    registeredAt: new Date().toISOString(),
    status: 'PENDING'
  }

  let participants: ParticipantData[] = []
  
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8')
      participants = JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading participants file:', error)
    participants = []
  }

  // Check if email already exists
  const existingParticipant = participants.find(p => p.email === participant.email)
  if (existingParticipant) {
    throw new Error('البريد الإلكتروني مستخدم بالفعل')
  }

  participants.push(newParticipant)

  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(participants, null, 2))
  } catch (error) {
    console.error('Error saving participants file:', error)
    throw new Error('خطأ في حفظ البيانات')
  }

  return newParticipant
}

export function getAllParticipants(): ParticipantData[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading participants file:', error)
  }
  return []
}

export function updateParticipantStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED'): boolean {
  try {
    const participants = getAllParticipants()
    const participantIndex = participants.findIndex(p => p.id === id)
    
    if (participantIndex === -1) {
      return false
    }

    participants[participantIndex].status = status
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(participants, null, 2))
    return true
  } catch (error) {
    console.error('Error updating participant status:', error)
    return false
  }
}
