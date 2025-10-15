import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Allow both admin and supervisor
    const userRole = request.headers.get("x-user-role");
    if (!["admin", "supervisor"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 });
    }

    // Initialize default templates
    const templates = await initializeTemplates();
    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error('Error initializing templates:', error);
    return NextResponse.json({ success: false, error: 'Failed to initialize templates' }, { status: 500 });
  }
}

async function initializeTemplates() {
  const DEFAULT_TEMPLATES = [
  {
    templateKey: 'registration_confirmation',
    nameAr: 'تأكيد التسجيل',
    nameEn: 'Registration Confirmation',
    category: 'participant',
    subject: 'تأكيد التسجيل في الهاكاثون - {{hackathonTitle}}',
    description: 'يُرسل عند تسجيل مشارك جديد في هاكاثون',
    bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2 style="color: #2563eb;">مرحباً {{participantName}}</h2><p>تم تأكيد تسجيلك بنجاح في هاكاثون <strong>{{hackathonTitle}}</strong>.</p><div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;"><h3>تفاصيل التسجيل:</h3><ul><li>📧 البريد: {{participantEmail}}</li><li>📅 التاريخ: {{registrationDate}}</li></ul></div></div>',
    variables: { 'participantName': 'اسم المشارك', 'participantEmail': 'البريد الإلكتروني', 'hackathonTitle': 'عنوان الهاكاثون', 'registrationDate': 'تاريخ التسجيل' },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'acceptance',
    nameAr: 'قبول المشاركة',
    nameEn: 'Application Acceptance',
    category: 'participant',
    subject: 'مبروك! تم قبولك في {{hackathonTitle}}',
    description: 'يُرسل عند قبول طلب مشارك',
    bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;"><h1 style="color: white; margin: 0;">🎉 مبروك!</h1></div><div style="padding: 30px;"><p>يسعدنا قبولك في <strong>{{hackathonTitle}}</strong>!</p></div></div>',
    variables: { 'participantName': 'اسم المشارك', 'hackathonTitle': 'عنوان الهاكاثون' },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'rejection',
    nameAr: 'رفض المشاركة',
    nameEn: 'Application Rejection',
    category: 'participant',
    subject: 'شكراً لاهتمامك بـ {{hackathonTitle}}',
    description: 'يُرسل عند رفض طلب مشارك',
    bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>مرحباً {{participantName}}</h2><p>شكراً لاهتمامك بـ <strong>{{hackathonTitle}}</strong>.</p><p>للأسف، لم نتمكن من قبول طلبك هذه المرة.</p></div>',
    variables: { 'participantName': 'اسم المشارك', 'hackathonTitle': 'عنوان الهاكاثون' },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'team_assignment',
    nameAr: 'تكوين الفريق',
    nameEn: 'Team Assignment',
    category: 'team',
    subject: 'تم تكوين فريقك في {{hackathonTitle}}',
    description: 'يُرسل عند تكوين الفرق',
    bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>مرحباً {{participantName}}</h2><p>تم تكوين فريقك: <strong>{{teamName}}</strong></p></div>',
    variables: { 'participantName': 'اسم المشارك', 'hackathonTitle': 'عنوان الهاكاثون', 'teamName': 'اسم الفريق' },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'judge_invitation',
    nameAr: 'دعوة محكم',
    nameEn: 'Judge Invitation',
    category: 'judge',
    subject: 'دعوة للانضمام كمحكم - {{hackathonTitle}}',
    description: 'يُرسل لدعوة محكم جديد',
    bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>مرحباً {{judgeName}}</h2><p>يسعدنا دعوتك كمحكم في <strong>{{hackathonTitle}}</strong>.</p></div>',
    variables: { 'judgeName': 'اسم المحكم', 'hackathonTitle': 'عنوان الهاكاثون' },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'supervisor_invitation',
    nameAr: 'دعوة مشرف',
    nameEn: 'Supervisor Invitation',
    category: 'supervisor',
    subject: 'دعوة للانضمام كمشرف',
    description: 'يُرسل لدعوة مشرف جديد',
    bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>مرحباً {{supervisorName}}</h2><p>يسعدنا دعوتك كمشرف.</p></div>',
    variables: { 'supervisorName': 'اسم المشرف' },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'certificate_judge',
    nameAr: 'شهادة محكم',
    nameEn: 'Judge Certificate',
    category: 'certificate',
    subject: 'شهادة التحكيم - {{hackathonTitle}}',
    description: 'يُرسل للمحكم مع الشهادة',
    bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>مرحباً {{judgeName}}</h2><p>شهادتك جاهزة!</p></div>',
    variables: { 'judgeName': 'اسم المحكم', 'hackathonTitle': 'عنوان الهاكاثون', 'certificateUrl': 'رابط الشهادة' },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'certificate_supervisor',
    nameAr: 'شهادة مشرف',
    nameEn: 'Supervisor Certificate',
    category: 'certificate',
    subject: 'شهادة الإشراف - {{hackathonTitle}}',
    description: 'يُرسل للمشرف مع الشهادة',
    bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>مرحباً {{supervisorName}}</h2><p>شهادتك جاهزة!</p></div>',
    variables: { 'supervisorName': 'اسم المشرف', 'hackathonTitle': 'عنوان الهاكاثون', 'certificateUrl': 'رابط الشهادة' },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'welcome_user',
    nameAr: 'ترحيب بمستخدم جديد',
    nameEn: 'Welcome New User',
    category: 'general',
    subject: 'مرحباً بك في منصة الهاكاثونات',
    description: 'يُرسل عند تسجيل مستخدم جديد',
    bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>مرحباً {{userName}}</h2><p>أهلاً بك في المنصة!</p></div>',
    variables: { 'userName': 'اسم المستخدم', 'userEmail': 'البريد الإلكتروني' },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'team_formation',
    nameAr: 'تشكيل الفريق',
    nameEn: 'Team Formation',
    category: 'team',
    subject: 'تم تشكيل فريقك - {{hackathonTitle}}',
    description: 'يُرسل عند إنشاء الفريق وتوزيع الأعضاء',
    bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>مرحباً {{participantName}}</h2><p>تم تشكيل فريقك بنجاح!</p><div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;"><h3>تفاصيل الفريق:</h3><p><strong>اسم الفريق:</strong> {{teamName}}</p><p><strong>رقم الفريق:</strong> {{teamNumber}}</p></div></div>',
    variables: { 'participantName': 'اسم المشارك', 'hackathonTitle': 'عنوان الهاكاثون', 'teamName': 'اسم الفريق', 'teamNumber': 'رقم الفريق' },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'team_member_added',
    nameAr: 'إضافة عضو للفريق',
    nameEn: 'Team Member Added',
    category: 'team',
    subject: 'تم إضافتك لفريق {{teamName}}',
    description: 'يُرسل عند نقل مشارك لفريق جديد',
    bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>مرحباً {{participantName}}</h2><p>تم إضافتك للفريق <strong>{{teamName}}</strong> في هاكاثون {{hackathonTitle}}.</p></div>',
    variables: { 'participantName': 'اسم المشارك', 'hackathonTitle': 'عنوان الهاكاثون', 'teamName': 'اسم الفريق' },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'team_member_removed',
    nameAr: 'إزالة عضو من الفريق',
    nameEn: 'Team Member Removed',
    category: 'team',
    subject: 'تحديث على فريقك - {{hackathonTitle}}',
    description: 'يُرسل عند إزالة عضو من فريق',
    bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>مرحباً {{participantName}}</h2><p>تم تحديث فريقك <strong>{{teamName}}</strong>.</p></div>',
    variables: { 'participantName': 'اسم المشارك', 'hackathonTitle': 'عنوان الهاكاثون', 'teamName': 'اسم الفريق' },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'reminder',
    nameAr: 'تذكير عام',
    nameEn: 'General Reminder',
    category: 'general',
    subject: 'تذكير: {{hackathonTitle}}',
    description: 'تذكير عام للمشاركين',
    bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>تذكير</h2><p>{{reminderMessage}}</p></div>',
    variables: { 'hackathonTitle': 'عنوان الهاكاثون', 'reminderMessage': 'رسالة التذكير' },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'evaluation_results',
    nameAr: 'نتائج التقييم',
    nameEn: 'Evaluation Results',
    category: 'team',
    subject: 'نتائج التقييم - {{hackathonTitle}}',
    description: 'يُرسل مع نتائج التقييم للفرق',
    bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>مرحباً فريق {{teamName}}</h2><p>تم الانتهاء من التقييم!</p><p><strong>النتيجة:</strong> {{totalScore}}</p></div>',
    variables: { 'teamName': 'اسم الفريق', 'hackathonTitle': 'عنوان الهاكاثون', 'totalScore': 'النتيجة الإجمالية' },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'certificate_ready',
    nameAr: 'الشهادة جاهزة',
    nameEn: 'Certificate Ready',
    category: 'certificate',
    subject: 'شهادتك جاهزة - {{hackathonTitle}}',
    description: 'يُرسل عند جاهزية شهادة المشارك',
    bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>مرحباً {{participantName}}</h2><p>شهادتك جاهزة! يمكنك تحميلها من الرابط التالي:</p><p><a href="{{certificateUrl}}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">تحميل الشهادة</a></p></div>',
    variables: { 'participantName': 'اسم المشارك', 'hackathonTitle': 'عنوان الهاكاثون', 'certificateUrl': 'رابط الشهادة' },
    isSystem: true,
    isActive: true
  },
  {
    templateKey: 'welcome',
    nameAr: 'ترحيب في الهاكاثون',
    nameEn: 'Welcome to Hackathon',
    category: 'participant',
    subject: 'أهلاً بك في {{hackathonTitle}}',
    description: 'رسالة ترحيب عامة',
    bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>مرحباً {{participantName}}</h2><p>أهلاً بك في {{hackathonTitle}}!</p></div>',
    variables: { 'participantName': 'اسم المشارك', 'hackathonTitle': 'عنوان الهاكاثون' },
    isSystem: true,
    isActive: true
  }
  ]

  console.log('Initializing default email templates...')

  const createdTemplates = []

  for (const template of DEFAULT_TEMPLATES) {
    try {
      const existing = await prisma.emailTemplate.findUnique({
        where: { templateKey: template.templateKey }
      })

      if (!existing) {
        const created = await prisma.emailTemplate.create({
          data: template
        })
        createdTemplates.push(created)
        console.log(`✅ Created template: ${template.templateKey}`)
      } else {
        createdTemplates.push(existing)
        console.log(`ℹ️ Template already exists: ${template.templateKey}`)
      }
    } catch (error) {
      console.error(`Error creating template ${template.templateKey}:`, error)
    }
  }

  return createdTemplates
}
