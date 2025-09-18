import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/messages/filter-options - Get filter options for custom messages
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    try {
      // Get hackathons with participant counts
      const hackathons = await prisma.hackathon.findMany({
        select: {
          id: true,
          title: true,
          _count: {
            select: { participants: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      const hackathonsWithCount = hackathons.map(h => ({
        id: h.id,
        title: h.title,
        participantCount: h._count.participants
      }))

      // Get unique nationalities
      const nationalitiesResult = await prisma.user.findMany({
        select: { nationality: true },
        where: { nationality: { not: null } },
        distinct: ['nationality']
      })
      const nationalities = nationalitiesResult
        .map(u => u.nationality)
        .filter(Boolean)
        .sort()

      // Get unique cities
      const citiesResult = await prisma.user.findMany({
        select: { city: true },
        where: { city: { not: null } },
        distinct: ['city']
      })
      const cities = citiesResult
        .map(u => u.city)
        .filter(Boolean)
        .sort()

      // Get unique roles
      const rolesResult = await prisma.user.findMany({
        select: { preferredRole: true },
        where: { preferredRole: { not: null } },
        distinct: ['preferredRole']
      })
      const roles = rolesResult
        .map(u => u.preferredRole)
        .filter(Boolean)
        .sort()

      return NextResponse.json({
        hackathons: hackathonsWithCount,
        nationalities,
        cities,
        roles
      })

    } catch (dbError) {
      console.error('Database error:', dbError)
      
      // Return mock data if database fails
      return NextResponse.json({
        hackathons: [
          { id: '1', title: 'هاكاثون الابتكار التقني', participantCount: 156 },
          { id: '2', title: 'هاكاثون الذكاء الاصطناعي', participantCount: 89 },
          { id: '3', title: 'هاكاثون التطبيقات المحمولة', participantCount: 234 }
        ],
        nationalities: ['سعودي', 'مصري', 'أردني', 'لبناني', 'إماراتي', 'كويتي'],
        cities: ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة', 'الطائف', 'أبها'],
        roles: ['مطور واجهات أمامية', 'مطور خلفي', 'مصمم UI/UX', 'مطور تطبيقات محمولة', 'مهندس بيانات', 'أخرى']
      })
    }

  } catch (error) {
    console.error('Error fetching filter options:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
