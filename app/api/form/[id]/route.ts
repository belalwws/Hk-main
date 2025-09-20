import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getFormDesign(hackathonId: string) {
  try {
    // Use Prisma model instead of raw SQL to avoid column name issues
    const design = await prisma.hackathonFormDesign.findFirst({
      where: {
        hackathonId: hackathonId,
        isEnabled: true
      }
    })

    if (!design) {
      return null
    }

    return {
      ...design,
      settings: design.settings || {}
    }
  } catch (error) {
    console.error('Error fetching form design:', error)
    return null
  }
}

async function getRegistrationForm(hackathonId: string) {
  try {
    // Use Prisma model instead of raw SQL
    const form = await prisma.hackathonForm.findFirst({
      where: { hackathonId: hackathonId }
    })

    if (!form) {
      return null
    }

    // Parse fields
    let fields = []
    try {
      fields = JSON.parse(form.fields || '[]')
    } catch (e) {
      fields = []
    }

    // Parse settings
    let settings = {}
    try {
      settings = JSON.parse(form.settings || '{}')
    } catch (e) {
      settings = {}
    }

    return {
      ...form,
      fields,
      settings
    }
  } catch (error) {
    console.error('Error fetching registration form:', error)
    return null
  }
}

// Helper function to get hackathon data
async function getHackathon(hackathonId: string) {
  try {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })
    return hackathon
  } catch (error) {
    console.error('Error fetching hackathon:', error)
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log('🔄 Loading custom form for:', resolvedParams.id)
    
    const [formDesign, initialRegistrationForm, hackathon] = await Promise.all([
      getFormDesign(resolvedParams.id),
      getRegistrationForm(resolvedParams.id),
      getHackathon(resolvedParams.id)
    ])

    let registrationForm = initialRegistrationForm

    console.log('🔍 Form design check:', {
      exists: !!formDesign,
      enabled: formDesign?.isEnabled,
      hasHtml: !!formDesign?.htmlContent,
      htmlLength: formDesign?.htmlContent?.length || 0
    })

    if (!formDesign || !formDesign.isEnabled) {
      console.log('⚠️ No custom form design found or not enabled, redirecting to default')
      return NextResponse.redirect(new URL(`/hackathons/${resolvedParams.id}/register-form`, request.url))
    }

    if (!formDesign.htmlContent || formDesign.htmlContent.length < 100) {
      console.log('⚠️ Form design has no HTML content, redirecting to default')
      return NextResponse.redirect(new URL(`/hackathons/${resolvedParams.id}/register-form`, request.url))
    }

    if (!registrationForm) {
      console.log('⚠️ No registration form found, creating default form...')
      
      // Create a default registration form
      const defaultFormData = {
        hackathonId: resolvedParams.id,
        title: 'نموذج التسجيل',
        description: 'نموذج التسجيل في الهاكاثون',
        isActive: true,
        fields: JSON.stringify([
          {
            id: 'name',
            type: 'text',
            label: 'الاسم الكامل',
            placeholder: 'اكتب اسمك الكامل',
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: 'البريد الإلكتروني',
            placeholder: 'example@email.com',
            required: true
          },
          {
            id: 'phone',
            type: 'phone',
            label: 'رقم الهاتف',
            placeholder: '+966xxxxxxxxx',
            required: true
          },
          {
            id: 'experience',
            type: 'select',
            label: 'مستوى الخبرة',
            required: true,
            options: ['مبتدئ', 'متوسط', 'متقدم', 'خبير']
          }
        ]),
        settings: JSON.stringify({
          allowMultipleSubmissions: false,
          requireApproval: true,
          sendConfirmationEmail: true
        })
      }
      
      try {
        const newId = `form_${Date.now()}`
        
        // Try to insert with all columns, fallback to basic columns if needed
        try {
          await prisma.$executeRaw`
            INSERT INTO hackathon_forms
            (id, hackathonId, title, description, isActive, formFields)
            VALUES (${newId}, ${resolvedParams.id}, ${defaultFormData.title},
                    ${defaultFormData.description}, ${defaultFormData.isActive},
                    ${defaultFormData.fields})
          `
        } catch (insertError) {
          // Fallback to basic columns only
          console.log('⚠️ Trying basic insert...')
          await prisma.$executeRaw`
            INSERT INTO hackathon_forms
            (id, hackathonId, formFields)
            VALUES (${newId}, ${resolvedParams.id}, ${defaultFormData.fields})
          `
        }
        
        console.log('✅ Default registration form created:', newId)
        
        // Parse the created form
        registrationForm = {
          id: newId,
          hackathonId: resolvedParams.id,
          title: defaultFormData.title,
          description: defaultFormData.description,
          isActive: defaultFormData.isActive,
          fields: JSON.parse(defaultFormData.fields),
          settings: JSON.parse(defaultFormData.settings)
        }
      } catch (error) {
        console.error('❌ Error creating default form:', error)
        return new NextResponse('Error creating registration form', { status: 500 })
      }
    }

    console.log('✅ Custom form design found:', {
      id: formDesign.id,
      template: formDesign.template,
      htmlLength: formDesign.htmlContent?.length || 0
    })

    // إنشاء HTML كامل مع دمج بيانات الفورم
    let fullHtml = formDesign.htmlContent || ''
    
    // إذا كان HTML يحتوي على placeholder للفورم، استبدله
    if (fullHtml.includes('<!-- سيتم إدراج محتوى الفورم هنا -->')) {
      const formFieldsHtml = generateFormFieldsHtml(registrationForm.fields)
      fullHtml = fullHtml.replace('<!-- سيتم إدراج محتوى الفورم هنا -->', formFieldsHtml)
    }
    
    // استبدال المتغيرات
    fullHtml = fullHtml.replace(/\{\{HACKATHON_TITLE\}\}/g, hackathon?.title || 'الهاكاثون')
    fullHtml = fullHtml.replace(/\{\{HACKATHON_DESCRIPTION\}\}/g, hackathon?.description || '')
    fullHtml = fullHtml.replace(/\{\{HACKATHON_ID\}\}/g, resolvedParams.id)
    
    // إضافة JavaScript للتعامل مع إرسال الفورم
    const formScript = `
    <script>
      // معالج إرسال الفورم
      document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('registrationForm');
        if (form) {
          form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {};
            
            // جمع بيانات الفورم
            for (let [key, value] of formData.entries()) {
              if (data[key]) {
                if (Array.isArray(data[key])) {
                  data[key].push(value);
                } else {
                  data[key] = [data[key], value];
                }
              } else {
                data[key] = value;
              }
            }
            
            // إرسال البيانات
            try {
              const response = await fetch('/api/hackathons/${resolvedParams.id}/register-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  formId: '${registrationForm.id}',
                  data: data
                })
              });
              
              if (response.ok) {
                // عرض رسالة نجاح
                document.body.innerHTML = \`
                  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #01645e 0%, #667eea 100%); font-family: Cairo, Arial, sans-serif; direction: rtl;">
                    <div style="background: white; padding: 3rem; border-radius: 20px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 500px;">
                      <div style="font-size: 4rem; color: #28a745; margin-bottom: 1rem;">✅</div>
                      <h2 style="font-size: 2rem; margin-bottom: 1rem; color: #333;">تم التسجيل بنجاح!</h2>
                      <p style="color: #666; margin-bottom: 2rem;">تم استلام طلبك وسيتم مراجعته قريباً</p>
                      <a href="/hackathons/${resolvedParams.id}" style="background: linear-gradient(135deg, #01645e 0%, #667eea 100%); color: white; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 600;">العودة للهاكاثون</a>
                    </div>
                  </div>
                \`;
              } else {
                const error = await response.json();
                alert('خطأ في التسجيل: ' + (error.error || 'حدث خطأ غير متوقع'));
              }
            } catch (error) {
              console.error('Error:', error);
              alert('حدث خطأ في التسجيل');
            }
          });
        }
      });
    </script>
    `;
    
    // إضافة الـ script قبل إغلاق body
    fullHtml = fullHtml.replace('</body>', formScript + '</body>')

    // إرجاع HTML مع Content-Type صحيح
    return new NextResponse(fullHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })

  } catch (error) {
    console.error('❌ Error loading custom form:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

function generateFormFieldsHtml(fields: any[]): string {
  let html = '<form id="registrationForm" class="space-y-6">'
  
  fields.forEach(field => {
    html += '<div class="form-group">'
    html += `<label class="form-label">${field.label}${field.required ? ' <span style="color: #dc3545;">*</span>' : ''}</label>`
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        html += `<input type="${field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}" name="${field.id}" class="form-input" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`
        break
        
      case 'textarea':
        html += `<textarea name="${field.id}" class="form-input form-textarea" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}></textarea>`
        break
        
      case 'select':
        html += `<select name="${field.id}" class="form-input form-select" ${field.required ? 'required' : ''}>`
        html += `<option value="">${field.placeholder || 'اختر ' + field.label}</option>`
        if (field.options) {
          field.options.forEach((option: string) => {
            html += `<option value="${option}">${option}</option>`
          })
        }
        html += '</select>'
        break
        
      case 'radio':
        html += '<div class="radio-group">'
        if (field.options) {
          field.options.forEach((option: string, index: number) => {
            html += `
              <div class="radio-item">
                <input type="radio" id="${field.id}_${index}" name="${field.id}" value="${option}" ${field.required ? 'required' : ''}>
                <label for="${field.id}_${index}">${option}</label>
              </div>
            `
          })
        }
        html += '</div>'
        break
        
      case 'checkbox':
        html += '<div class="checkbox-group">'
        if (field.options) {
          field.options.forEach((option: string, index: number) => {
            html += `
              <div class="checkbox-item">
                <input type="checkbox" id="${field.id}_${index}" name="${field.id}" value="${option}">
                <label for="${field.id}_${index}">${option}</label>
              </div>
            `
          })
        }
        html += '</div>'
        break
        
      case 'date':
        html += `<input type="date" name="${field.id}" class="form-input" ${field.required ? 'required' : ''}>`
        break
        
      case 'file':
        html += `<input type="file" name="${field.id}" class="form-input" ${field.required ? 'required' : ''}>`
        break
    }
    
    html += '</div>'
  })
  
  html += '<div style="text-align: center; margin-top: 3rem;">'
  html += '<button type="submit" class="submit-btn"><i class="fas fa-paper-plane"></i> تسجيل</button>'
  html += '</div>'
  html += '</form>'
  
  return html
}
