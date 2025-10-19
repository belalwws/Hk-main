import { prisma } from './prisma'

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
    subject: 'مرحباً بك في منصة الهاكاثونات{{#if isPasswordEmail}} - كلمة المرور الخاصة بك{{/if}}',
    body: `مرحباً {{participantName}},

{{#if isPasswordEmail}}
تم إنشاء كلمة مرور لحسابك في منصة الهاكاثونات.

بيانات تسجيل الدخول:
- البريد الإلكتروني: {{participantEmail}}
- كلمة المرور المؤقتة: {{temporaryPassword}}

يمكنك الآن تسجيل الدخول من خلال الرابط التالي:
{{loginUrl}}

{{passwordInstructions}}

{{else}}
أهلاً وسهلاً بك في منصة الهاكاثونات!

تم إنشاء حسابك بنجاح:
- الاسم: {{participantName}}
- البريد الإلكتروني: {{participantEmail}}
- تاريخ التسجيل: {{registrationDate}}

يمكنك الآن تصفح الهاكاثونات المتاحة والتسجيل فيها.
{{/if}}

مع أطيب التحيات,
فريق المنصة`
  },
  custom: {
    subject: '{{subject}}',
    body: `{{content}}`
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
  },
  upload_link: {
    subject: '🎉 رابط رفع العرض التقديمي - {{hackathonTitle}}',
    body: `مرحباً {{participantName}},

يسعدنا إبلاغك بأنه تم قبولك في {{hackathonTitle}}! 🎊

تم تعيينك في فريق: {{teamName}}

يمكنك الآن رفع العرض التقديمي الخاص بفريقك من خلال الرابط التالي:
{{uploadLink}}

⚠️ ملاحظات هامة:
- هذا الرابط صالح حتى {{expiryDate}}
- الرابط خاص بك ولا يجب مشاركته مع الآخرين
- يمكنك رفع العرض التقديمي مرة واحدة فقط
- الملفات المقبولة: PowerPoint (.ppt, .pptx) أو PDF
- الحد الأقصى لحجم الملف: 10 ميجابايت

نتمنى لك التوفيق! 🚀

مع أطيب التحيات,
فريق الهاكاثون`
  }
}

export interface EmailTemplate {
  subject: string
  body: string
}

export interface EmailTemplates {
  registration_confirmation: EmailTemplate
  acceptance: EmailTemplate
  rejection: EmailTemplate
  team_formation: EmailTemplate
  evaluation_results: EmailTemplate
  reminder: EmailTemplate
  welcome: EmailTemplate
  certificate_ready: EmailTemplate
  upload_link: EmailTemplate
}

/**
 * Get email templates with priority:
 * 1. Database EmailTemplate table (by templateKey) - ACTIVE OR INACTIVE
 * 2. Default hardcoded templates
 */
export async function getEmailTemplates(hackathonId?: string): Promise<EmailTemplates> {
  try {
    let templates = { ...DEFAULT_TEMPLATES }

    // Get templates from EmailTemplate table - GET ALL TEMPLATES (not just active ones)
    try {
      const dbTemplates = await prisma.emailTemplate.findMany({
        // ✅ REMOVED isActive filter - get ALL templates even if inactive
        orderBy: { updatedAt: 'desc' }
      })
      
      if (dbTemplates && dbTemplates.length > 0) {
        console.log(`✅ Loaded ${dbTemplates.length} email templates from database`)
        
        // Map database templates to our template structure
        dbTemplates.forEach(dbTemplate => {
          const templateKey = dbTemplate.templateKey as keyof EmailTemplates
          if (DEFAULT_TEMPLATES[templateKey]) {
            templates[templateKey] = {
              subject: dbTemplate.subject,
              body: dbTemplate.bodyHtml || dbTemplate.bodyText || DEFAULT_TEMPLATES[templateKey].body
            }
            console.log(`  ✓ Template loaded: ${templateKey} - "${dbTemplate.nameAr}" (active: ${dbTemplate.isActive})`)
          }
        })
      } else {
        console.log('⚠️ No templates in database, using defaults')
      }
    } catch (error: any) {
      console.log('⚠️ Error loading templates from database:', error?.message || 'Unknown error')
      console.log('📋 Falling back to default templates')
    }

    return templates
  } catch (error) {
    console.error('Error getting email templates:', error)
    return DEFAULT_TEMPLATES
  }
}

/**
 * Get a specific email template
 */
export async function getEmailTemplate(
  templateType: keyof EmailTemplates,
  hackathonId?: string
): Promise<EmailTemplate> {
  const templates = await getEmailTemplates(hackathonId)
  return templates[templateType] || DEFAULT_TEMPLATES[templateType]
}

/**
 * Replace template variables with actual values
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, any>
): string {
  let result = template

  // Replace simple variables like {{variableName}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, String(value || ''))
  })

  // Handle conditional blocks like {{#if condition}}...{{/if}}
  result = result.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/g, (match, condition, content) => {
    return variables[condition] ? content : ''
  })

  return result
}

/**
 * Process email template with variables
 */
export async function processEmailTemplate(
  templateType: keyof EmailTemplates,
  variables: Record<string, any>,
  hackathonId?: string
): Promise<{ subject: string; body: string }> {
  const template = await getEmailTemplate(templateType, hackathonId)
  
  return {
    subject: replaceTemplateVariables(template.subject, variables),
    body: replaceTemplateVariables(template.body, variables)
  }
}
