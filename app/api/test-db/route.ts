import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Test users table
    const userCount = await prisma.user.count()
    console.log('👥 Users count:', userCount)
    
    // Test hackathons table
    const hackathonCount = await prisma.hackathon.count()
    console.log('🏆 Hackathons count:', hackathonCount)
    
    // Test admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    })
    console.log('👤 Admin user found:', adminUser ? 'Yes' : 'No')
    
    // Test pinned hackathon
    const pinnedHackathon = await prisma.hackathon.findFirst({
      where: { isPinned: true }
    })
    console.log('📌 Pinned hackathon found:', pinnedHackathon ? 'Yes' : 'No')
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      data: {
        userCount,
        hackathonCount,
        hasAdmin: !!adminUser,
        hasPinnedHackathon: !!pinnedHackathon,
        adminEmail: adminUser?.email,
        pinnedHackathonTitle: pinnedHackathon?.title
      }
    })
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export const dynamic = 'force-dynamic'
