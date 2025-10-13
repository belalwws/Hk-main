import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_TEMPLATES = [
  {
    templateKey: 'registration_confirmation',
    nameAr: 'تأكيد التسجيل',
    nameEn: 'Registration Confirmation',
    category: 'participant',
    subject: 'تأكيد التسجيل في الهاكاثون - {{hackathonTitle}}',
    description: 'يُرسل عند تسجيل مشارك جديد في هاكاثون',
    bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2 style="color: #2563eb;">مرحباً {{participantName}}</h2><p>تم تأكيد تسجيلك بنجاح في هاكاثون <strong>{{hackathonTitle}}</strong>.</p></div>',
    variables: {
      'participantName': 'اسم المشارك',
      'participantEmail': 'البريد الإلكتروني',
      'hackathonTitle': 'عنوان الهاكاثون'
    },
    isSystem: true,
    isActive: true
  }
]

export async function POST(request: NextRequest) {
  try {
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
    
    return NextResponse.json({
      success: true,
      message: `Initialized ${createdTemplates.length} templates`,
      templates: createdTemplates
    })
  } catch (error) {
    console.error('Error initializing templates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to initialize templates' },
      { status: 500 }
    )
  }
}
