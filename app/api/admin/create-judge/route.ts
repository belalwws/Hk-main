import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة سيتم إضافته لاحقاً
    // مؤقتاً نسمح بالوصول للاختبار

    const { name, email, password } = await request.json()

    // التحقق من البيانات المطلوبة
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني غير صحيح' },
        { status: 400 }
      )
    }

    // التحقق من طول كلمة المرور
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      )
    }

    // التحقق من عدم وجود المستخدم مسبقاً
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم مسبقاً' },
        { status: 400 }
      )
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 12)

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'judge',
        city: 'غير محدد',
        nationality: 'غير محدد',
        phone: 'غير محدد'
      }
    })

    // إنشاء سجل المحكم
    const judge = await prisma.judge.create({
      data: {
        userId: user.id,
        name,
        email,
        isActive: true
      }
    })

    // إرجاع النتيجة (بدون كلمة المرور)
    return NextResponse.json({
      message: 'تم إنشاء المحكم بنجاح',
      judge: {
        id: judge.id,
        name: judge.name,
        email: judge.email,
        isActive: judge.isActive,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    })

  } catch (error) {
    console.error('Error creating judge:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء المحكم' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
