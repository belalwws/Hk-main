import { NextRequest, NextResponse } from 'next/server'
import { testConnection } from '@/lib/simple-db'

// GET /api/admin/dashboard-stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const isConnected = await testConnection()

    if (!isConnected) {
      return NextResponse.json({ error: 'خطأ في الاتصال بقاعدة البيانات' }, { status: 500 })
    }

    // Return basic stats for now
    const stats = {
      totalParticipants: 1,
      pendingParticipants: 0,
      approvedParticipants: 1,
      rejectedParticipants: 0,
      recentParticipants: [
        {
          id: 'sample-1',
          name: 'مستخدم تجريبي',
          email: 'test@example.com',
          status: 'approved',
          registeredAt: new Date().toISOString(),
          preferredRole: 'developer'
        }
      ]
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
