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

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params
    const userId = resolvedParams.id

    // Check if user exists and is not admin
    const user = await prismaClient.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    if (user.role === 'admin') {
      return NextResponse.json({ error: 'لا يمكن حذف المدير' }, { status: 403 })
    }

    // Delete user (cascade will handle related records)
    await prismaClient.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ message: 'تم حذف المستخدم بنجاح' })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'خطأ في حذف المستخدم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
