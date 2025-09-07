import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Lazy import prisma to avoid build-time errors
let prisma: any = null
async function getPrisma() {
  if (!prisma) {
    try {
      const { prisma: prismaClient } = await import('@/lib/prisma')
      prisma = prismaClient
    } catch (error) {
      console.error('Failed to import prisma:', error)
      return null
    }
  }
  return prisma
}

// GET /api/admin/evaluation/criteria - Get all evaluation criteria
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'تعذر تهيئة قاعدة البيانات' }, { status: 500 })
    }

    const criteria = await prismaClient.evaluationCriteria.findMany({
      orderBy: { weight: 'desc' }
    })

    return NextResponse.json({ criteria })

  } catch (error) {
    console.error('Error fetching evaluation criteria:', error)
    return NextResponse.json({ error: 'خطأ في جلب معايير التقييم' }, { status: 500 })
  }
}

// POST /api/admin/evaluation/criteria - Create evaluation criteria
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'تعذر تهيئة قاعدة البيانات' }, { status: 500 })
    }

    const body = await request.json()
    
    // Handle bulk creation (for default criteria)
    if (body.criteria && Array.isArray(body.criteria)) {
      const createdCriteria = []
      
      for (const criteriaData of body.criteria) {
        const criteria = await prismaClient.evaluationCriteria.create({
          data: {
            name: criteriaData.name,
            description: criteriaData.description || '',
            weight: criteriaData.weight,
            maxScore: criteriaData.maxScore,
            category: criteriaData.category
          }
        })
        createdCriteria.push(criteria)
      }
      
      return NextResponse.json({ 
        message: 'تم إنشاء معايير التقييم بنجاح',
        criteria: createdCriteria
      })
    }
    
    // Handle single creation
    const { name, description, weight, maxScore, category } = body

    if (!name || !weight || !maxScore) {
      return NextResponse.json({ 
        error: 'يرجى ملء جميع الحقول المطلوبة' 
      }, { status: 400 })
    }

    const criteria = await prismaClient.evaluationCriteria.create({
      data: {
        name,
        description: description || '',
        weight,
        maxScore,
        category: category || 'technical'
      }
    })

    return NextResponse.json({ 
      message: 'تم إنشاء معيار التقييم بنجاح',
      criteria
    })

  } catch (error) {
    console.error('Error creating evaluation criteria:', error)
    return NextResponse.json({ error: 'خطأ في إنشاء معيار التقييم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
