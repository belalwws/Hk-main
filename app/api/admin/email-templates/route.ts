import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Default global email templates
const DEFAULT_TEMPLATES = {
  registration_confirmation: {
    subject: 'تأكيد التسجيل في الهاكاثون - {{hackathonTitle}}',
    body: `مرحباً {{participantName}},

تم تأكيد تسجيلك بنجاح في هاكاثون {{hackathonTitle}}.

تفاصيل التسجيل:
- اسم المشارك: {{participantName}}
- البريد الإلكتروني: {{participantEmail}}
- تاريخ التسجيل: {{registrationDate}}

سنقوم بإرسال المزيد من التفاصيل قريباً.

مع أطيب التحيات,
فريق الهاكاثون`
  },
  acceptance: {
    subject: 'مبروك! تم قبولك في {{hackathonTitle}}',
    body: `مرحباً {{participantName}},

يسعدنا إبلاغك بأنه تم قبولك للمشاركة في هاكاثون {{hackathonTitle}}.

تفاصيل المشاركة:
- اسم المشارك: {{participantName}}
- الدور المفضل: {{teamRole}}
- تاريخ بداية الهاكاثون: {{hackathonDate}}
- الموقع: {{hackathonLocation}}

سنقوم بإرسال تفاصيل الفريق قريباً.

مبروك مرة أخرى!

مع أطيب التحيات,
فريق الهاكاثون`
  },
  rejection: {
    subject: 'شكراً لاهتمامك بـ {{hackathonTitle}}',
    body: `مرحباً {{participantName}},

شكراً لك على اهتمامك بالمشاركة في هاكاثون {{hackathonTitle}}.

للأسف، لم نتمكن من قبول طلبك هذه المرة نظراً لمحدودية الأماكن المتاحة.

نشجعك على المشاركة في الفعاليات القادمة.

مع أطيب التحيات,
فريق الهاكاثون`
  },
  team_formation: {
    subject: 'تم تكوين فريقك في {{hackathonTitle}}',
    body: `مرحباً {{participantName}},

تم تكوين فريقك بنجاح في هاكاثون {{hackathonTitle}}.

تفاصيل الفريق:
- اسم الفريق: {{teamName}}
- رقم الفريق: {{teamNumber}}
- دورك في الفريق: {{teamRole}}

أعضاء الفريق:
{{teamMembers}}

مع أطيب التحيات,
فريق الهاكاثون`
  },
  evaluation_results: {
    subject: 'نتائج التقييم - {{hackathonTitle}}',
    body: `مرحباً {{participantName}},

تم الانتهاء من تقييم المشاريع في هاكاثون {{hackathonTitle}}.

نتائج فريقك:
- اسم الفريق: {{teamName}}
- المركز: {{teamRank}}
- النتيجة الإجمالية: {{totalScore}}

{{#if isWinner}}
مبروك! فريقك من الفائزين!
{{/if}}

شكراً لمشاركتكم المميزة.

مع أطيب التحيات,
فريق الهاكاثون`
  },
  reminder: {
    subject: 'تذكير: {{hackathonTitle}} - {{reminderType}}',
    body: `مرحباً {{participantName}},

هذا تذكير بخصوص {{hackathonTitle}}.

{{reminderMessage}}

{{#if deadlineDate}}
الموعد النهائي: {{deadlineDate}}
{{/if}}

مع أطيب التحيات,
فريق الهاكاثون`
  },
  welcome: {
    subject: 'مرحباً بك في منصة الهاكاثونات',
    body: `مرحباً {{participantName}},

أهلاً وسهلاً بك في منصة الهاكاثونات!

تم إنشاء حسابك بنجاح:
- الاسم: {{participantName}}
- البريد الإلكتروني: {{participantEmail}}
- تاريخ التسجيل: {{registrationDate}}

يمكنك الآن تصفح الهاكاثونات المتاحة والتسجيل فيها.

مع أطيب التحيات,
فريق المنصة`
  },
  certificate_ready: {
    subject: 'شهادتك جاهزة للتحميل - {{hackathonTitle}}',
    body: `مرحباً {{participantName}},

يسعدنا إبلاغك بأن شهادة المشاركة في {{hackathonTitle}} جاهزة للتحميل.

تفاصيل الشهادة:
- اسم المشارك: {{participantName}}
- اسم الفريق: {{teamName}}
- المركز: {{teamRank}}

يمكنك تحميل الشهادة من الرابط التالي:
{{certificateUrl}}

مبروك على إنجازك!

مع أطيب التحيات,
فريق الهاكاثون`
  }
}

// GET /api/admin/email-templates - Get global email templates
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    console.log('🔍 Fetching email templates...')
    
    // Try to get templates from database
    try {
      const templates = await prisma.$queryRaw`
        SELECT * FROM email_templates 
        WHERE id = 'global_templates'
        LIMIT 1
      ` as any[]
      
      if (templates.length > 0) {
        const templatesData = JSON.parse(templates[0].htmlContent || '{}')
        console.log('✅ Email templates loaded from database')
        return NextResponse.json({
          success: true,
          templates: {
            ...DEFAULT_TEMPLATES,
            ...templatesData
          }
        })
      }
    } catch (dbError: any) {
      console.log('⚠️ Database query failed:', dbError?.message)
    }
    
    console.log('⚠️ No email templates found, returning defaults')
    return NextResponse.json({
      success: true,
      templates: DEFAULT_TEMPLATES
    })

  } catch (error) {
    console.error('Error fetching global email templates:', error)
    return NextResponse.json({ error: 'خطأ في جلب قوالب الإيميلات' }, { status: 500 })
  }
}

// PUT /api/admin/email-templates - Update global email templates
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { templates } = await request.json()

    if (!templates || typeof templates !== 'object') {
      return NextResponse.json({ error: 'قوالب الإيميلات مطلوبة' }, { status: 400 })
    }

    // Validate template structure
    const validTemplateTypes = Object.keys(DEFAULT_TEMPLATES)
    for (const [templateType, template] of Object.entries(templates)) {
      if (!validTemplateTypes.includes(templateType)) {
        return NextResponse.json({ 
          error: `نوع القالب غير صحيح: ${templateType}` 
        }, { status: 400 })
      }

      if (!template || typeof template !== 'object') {
        return NextResponse.json({ 
          error: `قالب غير صحيح: ${templateType}` 
        }, { status: 400 })
      }

      const { subject, body } = template as any
      if (!subject || !body || typeof subject !== 'string' || typeof body !== 'string') {
        return NextResponse.json({ 
          error: `عنوان ونص القالب مطلوبان: ${templateType}` 
        }, { status: 400 })
      }
    }

    // Save to database using raw SQL to avoid model issues
    try {
      await prisma.$executeRaw`
        INSERT INTO email_templates (id, name, subject, "htmlContent", "textContent", variables, "isActive", "createdAt", "updatedAt")
        VALUES ('global_templates', 'Global Email Templates', 'Global Templates', ${JSON.stringify(templates)}, '', '{}', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
        "htmlContent" = ${JSON.stringify(templates)},
        "updatedAt" = CURRENT_TIMESTAMP
      `
      console.log('✅ Email templates saved successfully')
    } catch (dbError: any) {
      console.log('⚠️ Database save failed, using fallback:', dbError?.message)
      
      // Fallback: try to create table if it doesn't exist
      try {
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS email_templates (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            subject TEXT NOT NULL,
            "htmlContent" TEXT NOT NULL,
            "textContent" TEXT,
            variables JSONB,
            "isActive" BOOLEAN DEFAULT true,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
        
        await prisma.$executeRaw`
          INSERT INTO email_templates (id, name, subject, "htmlContent", "textContent", variables, "isActive")
          VALUES ('global_templates', 'Global Email Templates', 'Global Templates', ${JSON.stringify(templates)}, '', '{}', true)
          ON CONFLICT (id) DO UPDATE SET
          "htmlContent" = ${JSON.stringify(templates)},
          "updatedAt" = CURRENT_TIMESTAMP
        `
        console.log('✅ Email templates saved with fallback method')
      } catch (fallbackError: any) {
        console.error('❌ Fallback also failed:', fallbackError?.message)
        throw new Error('Failed to save email templates')
      }
    }

    return NextResponse.json({
      success: true,
      message: 'تم حفظ قوالب الإيميلات بنجاح',
      templates
    })

  } catch (error) {
    console.error('Error updating global email templates:', error)
    return NextResponse.json({ error: 'خطأ في حفظ قوالب الإيميلات' }, { status: 500 })
  }
}
