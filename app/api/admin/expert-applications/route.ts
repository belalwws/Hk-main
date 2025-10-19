import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/expert-applications - Get all expert applications
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const status = searchParams.get('status')
    const hackathonId = searchParams.get('hackathonId')

    console.log('📋 Fetching expert applications...', { status, hackathonId })

    const where: any = {}
    if (status) where.status = status
    if (hackathonId) where.hackathonId = hackathonId

    const applications = await prisma.expertApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    console.log(`✅ Found ${applications.length} applications`)

    return NextResponse.json({
      applications,
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      approved: applications.filter(a => a.status === 'approved').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    })

  } catch (error) {
    console.error('❌ Error fetching applications:', error)
    return NextResponse.json({ error: 'خطأ في جلب الطلبات' }, { status: 500 })
  }
}
