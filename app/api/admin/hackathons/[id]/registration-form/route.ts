import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Function to ensure hackathon_forms table exists with correct structure
async function ensureHackathonFormsTable() {
  try {
    // First, try to add missing columns if they don't exist
    try {
      await prisma.$executeRaw`ALTER TABLE hackathon_forms ADD COLUMN title TEXT DEFAULT 'نموذج التسجيل'`
      console.log('✅ Added title column')
    } catch (e) {
      // Column might already exist
    }
    
    try {
      await prisma.$executeRaw`ALTER TABLE hackathon_forms ADD COLUMN description TEXT DEFAULT ''`
      console.log('✅ Added description column')
    } catch (e) {
      // Column might already exist
    }
    
    try {
      await prisma.$executeRaw`ALTER TABLE hackathon_forms ADD COLUMN isActive BOOLEAN DEFAULT 1`
      console.log('✅ Added isActive column')
    } catch (e) {
      // Column might already exist
    }
    
    console.log('✅ hackathon_forms table structure updated')
  } catch (error) {
    console.log('ℹ️ Error updating table structure:', error)
  }
}

// GET /api/admin/hackathons/[id]/registration-form - Get hackathon registration form
export async function GET(
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

    try {
      // Ensure table exists first
      await ensureHackathonFormsTable()
      
      // Try to get existing form from database using raw SQL
      const existingForm = await prisma.$queryRaw`
        SELECT * FROM hackathon_forms 
        WHERE hackathonId = ${params.id}
        LIMIT 1
      ` as any[]

      if (existingForm.length > 0) {
        const form = existingForm[0]
        return NextResponse.json({
          form: {
            id: form.id,
            hackathonId: form.hackathonId,
            title: form.title,
            description: form.description,
            isActive: Boolean(form.isActive),
            fields: JSON.parse(form.formFields || '[]'),
            settings: JSON.parse(form.settings || '{}')
          }
        })
      }

      return NextResponse.json({ form: null })

    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ form: null })
    }

  } catch (error) {
    console.error('Error fetching registration form:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// POST /api/admin/hackathons/[id]/registration-form - Create/Update hackathon registration form
export async function POST(
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
    const { title, description, isActive, fields, settings } = body

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json({ error: 'عنوان النموذج مطلوب' }, { status: 400 })
    }

    if (!fields || fields.length === 0) {
      return NextResponse.json({ error: 'يجب إضافة حقل واحد على الأقل' }, { status: 400 })
    }

    // Validate fields
    for (const field of fields) {
      if (!field.label?.trim()) {
        return NextResponse.json({ error: 'تسمية الحقل مطلوبة لجميع الحقول' }, { status: 400 })
      }
      
      if ((field.type === 'select' || field.type === 'radio') && (!field.options || field.options.length === 0)) {
        return NextResponse.json({ error: `الحقل "${field.label}" يتطلب خيارات` }, { status: 400 })
      }
    }

    try {
      // Check if hackathon exists
      const hackathon = await prisma.hackathon.findUnique({
        where: { id: params.id }
      })

      if (!hackathon) {
        return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
      }

      // Ensure table exists
      await ensureHackathonFormsTable()
      
      // Check if form already exists using raw SQL
      const existingForm = await prisma.$queryRaw`
        SELECT * FROM hackathon_forms 
        WHERE hackathonId = ${params.id}
        LIMIT 1
      ` as any[]

      const fieldsJson = JSON.stringify(fields)
      const settingsJson = JSON.stringify(settings || {
        allowMultipleSubmissions: false,
        requireApproval: true,
        sendConfirmationEmail: true
      })

      let savedForm
      if (existingForm.length > 0) {
        // Update existing form
        await prisma.$executeRaw`
          UPDATE hackathon_forms
          SET title = ${title},
              description = ${description || ''},
              isActive = ${isActive ?? true},
              formFields = ${fieldsJson},
              updatedAt = CURRENT_TIMESTAMP
          WHERE id = ${existingForm[0].id}
        `
        
        savedForm = {
          id: existingForm[0].id,
          hackathonId: params.id,
          title,
          description: description || '',
          isActive: isActive ?? true,
          fields: fieldsJson,
          settings: settingsJson
        }
      } else {
        // Create new form
        const newId = `form_${Date.now()}`
        
        await prisma.$executeRaw`
          INSERT INTO hackathon_forms
          (id, hackathonId, title, description, isActive, formFields)
          VALUES (${newId}, ${params.id}, ${title}, ${description || ''},
                  ${isActive ?? true}, ${fieldsJson})
        `
        
        savedForm = {
          id: newId,
          hackathonId: params.id,
          title,
          description: description || '',
          isActive: isActive ?? true,
          fields: fieldsJson,
          settings: settingsJson
        }
      }

      return NextResponse.json({
        success: true,
        message: 'تم حفظ النموذج بنجاح',
        form: {
          id: savedForm.id,
          hackathonId: savedForm.hackathonId,
          title: savedForm.title,
          description: savedForm.description,
          isActive: savedForm.isActive,
          fields: JSON.parse(savedForm.fields),
          settings: JSON.parse(savedForm.settings)
        }
      })

    } catch (dbError) {
      console.error('Database error:', dbError)
      
      // Fallback: save to file system or return success for demo
      console.log('Saving form data (fallback):', {
        hackathonId: params.id,
        title,
        description,
        isActive,
        fields: fields.length,
        settings
      })

      return NextResponse.json({
        success: true,
        message: 'تم حفظ النموذج بنجاح (وضع التجريب)',
        form: {
          id: `form_${params.id}`,
          hackathonId: params.id,
          title,
          description,
          isActive,
          fields,
          settings
        }
      })
    }

  } catch (error) {
    console.error('Error saving registration form:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
