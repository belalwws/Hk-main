import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// PATCH /api/admin/judge-applications/[id] - Approve or reject application
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { action, reviewNotes, rejectionReason, password } = body

    console.log('🔄 Processing application:', { applicationId: params.id, action })

    // Get application
    const application = await prisma.judgeApplication.findUnique({
      where: { id: params.id }
    })

    if (!application) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    if (application.status !== 'pending') {
      return NextResponse.json({ error: 'تم معالجة هذا الطلب بالفعل' }, { status: 400 })
    }

    if (action === 'approve') {
      // Approve and create judge account
      if (!password) {
        return NextResponse.json({ error: 'كلمة المرور مطلوبة' }, { status: 400 })
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: application.email }
      })

      if (existingUser) {
        return NextResponse.json({
          error: 'هذا البريد الإلكتروني مسجل بالفعل'
        }, { status: 400 })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user and judge in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            name: application.name,
            email: application.email,
            phone: application.phone,
            password: hashedPassword,
            role: 'judge'
          }
        })

        // Create judge record
        const judge = await tx.judge.create({
          data: {
            userId: user.id,
            hackathonId: application.hackathonId,
            isActive: true
          }
        })

        // Update application status
        const updatedApplication = await tx.judgeApplication.update({
          where: { id: params.id },
          data: {
            status: 'approved',
            reviewedBy: payload.userId,
            reviewNotes,
            reviewedAt: new Date()
          }
        })

        return { user, judge, application: updatedApplication }
      })

      console.log('✅ Application approved and judge account created')

      return NextResponse.json({
        message: 'تم قبول الطلب وإنشاء حساب المحكم بنجاح',
        application: result.application,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email
        }
      })

    } else if (action === 'reject') {
      // Reject application
      if (!rejectionReason) {
        return NextResponse.json({ error: 'سبب الرفض مطلوب' }, { status: 400 })
      }

      const updatedApplication = await prisma.judgeApplication.update({
        where: { id: params.id },
        data: {
          status: 'rejected',
          reviewedBy: payload.userId,
          reviewNotes,
          rejectionReason,
          reviewedAt: new Date()
        }
      })

      console.log('✅ Application rejected')

      return NextResponse.json({
        message: 'تم رفض الطلب',
        application: updatedApplication
      })

    } else {
      return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Error processing application:', error)
    return NextResponse.json({
      error: 'خطأ في معالجة الطلب',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE /api/admin/judge-applications/[id] - Delete application
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    await prisma.judgeApplication.delete({
      where: { id: params.id }
    })

    console.log('✅ Application deleted')

    return NextResponse.json({ message: 'تم حذف الطلب بنجاح' })

  } catch (error) {
    console.error('❌ Error deleting application:', error)
    return NextResponse.json({ error: 'خطأ في حذف الطلب' }, { status: 500 })
  }
}

