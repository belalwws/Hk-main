// Fix form issues - Create registration form and fix form design

// Set the database URL
process.env.DATABASE_URL = "file:./dev.db"

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixFormIssues() {
  try {
    console.log('🔧 Starting form issues fix...')
    
    const hackathonId = 'cmfrav55o0001fd8wu0hasq8s'
    
    // 1. Check if hackathon exists
    console.log('🔍 Checking hackathon...')
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })
    
    if (!hackathon) {
      console.log('❌ Hackathon not found')
      return
    }
    
    console.log('✅ Hackathon found:', hackathon.title)
    
    // 2. Create/Update registration form
    console.log('📝 Creating registration form...')
    
    const formFields = [
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
        id: 'university',
        type: 'text',
        label: 'الجامعة',
        placeholder: 'اسم الجامعة',
        required: false
      },
      {
        id: 'major',
        type: 'text',
        label: 'التخصص',
        placeholder: 'تخصصك الأكاديمي',
        required: false
      },
      {
        id: 'experience',
        type: 'select',
        label: 'مستوى الخبرة',
        required: true,
        options: ['مبتدئ', 'متوسط', 'متقدم', 'خبير']
      },
      {
        id: 'skills',
        type: 'textarea',
        label: 'المهارات والخبرات',
        placeholder: 'اذكر مهاراتك وخبراتك التقنية',
        required: false
      },
      {
        id: 'teamPreference',
        type: 'radio',
        label: 'تفضيل الفريق',
        required: true,
        options: ['أفضل العمل بمفردي', 'أفضل الانضمام لفريق', 'لدي فريق جاهز']
      },
      {
        id: 'motivation',
        type: 'textarea',
        label: 'لماذا تريد المشاركة؟',
        placeholder: 'اكتب دوافعك للمشاركة في الهاكاثون',
        required: false
      }
    ]
    
    const formSettings = {
      allowMultipleSubmissions: false,
      requireApproval: true,
      sendConfirmationEmail: true,
      maxParticipants: 100,
      registrationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
    
    // Check if form exists
    let existingForm
    try {
      existingForm = await prisma.hackathonForm.findFirst({
        where: { hackathonId: hackathonId }
      })
    } catch (error) {
      console.log('ℹ️ HackathonForm table might not exist, will create via raw SQL')
    }
    
    if (existingForm) {
      // Update existing form
      try {
        await prisma.hackathonForm.update({
          where: { id: existingForm.id },
          data: {
            title: 'نموذج التسجيل في ' + hackathon.title,
            description: 'يرجى ملء البيانات المطلوبة للتسجيل في الهاكاثون',
            isActive: true,
            fields: JSON.stringify(formFields),
            settings: JSON.stringify(formSettings)
          }
        })
        console.log('✅ Registration form updated')
      } catch (error) {
        console.log('⚠️ Prisma update failed, trying raw SQL...')
        await updateFormViaRawSQL(hackathonId, hackathon.title, formFields, formSettings)
      }
    } else {
      // Create new form
      try {
        const newForm = await prisma.hackathonForm.create({
          data: {
            hackathonId: hackathonId,
            title: 'نموذج التسجيل في ' + hackathon.title,
            description: 'يرجى ملء البيانات المطلوبة للتسجيل في الهاكاثون',
            isActive: true,
            fields: JSON.stringify(formFields),
            settings: JSON.stringify(formSettings)
          }
        })
        console.log('✅ Registration form created:', newForm.id)
      } catch (error) {
        console.log('⚠️ Prisma create failed, trying raw SQL...')
        await createFormViaRawSQL(hackathonId, hackathon.title, formFields, formSettings)
      }
    }
    
    // 3. Create/Update form design
    console.log('🎨 Creating form design...')
    
    // Ensure form design table exists
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS hackathon_form_designs (
        id TEXT PRIMARY KEY,
        hackathonId TEXT NOT NULL,
        isEnabled BOOLEAN DEFAULT false,
        template TEXT DEFAULT 'modern',
        htmlContent TEXT,
        cssContent TEXT,
        jsContent TEXT,
        settings TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hackathonId) REFERENCES hackathons (id) ON DELETE CASCADE
      )
    `
    
    const modernTemplate = generateModernTemplate(hackathon)
    
    const designSettings = {
      theme: 'modern',
      backgroundColor: '#f8f9fa',
      primaryColor: '#01645e',
      secondaryColor: '#667eea',
      fontFamily: 'Cairo',
      borderRadius: '12px',
      showHackathonInfo: true,
      showProgressBar: true,
      enableAnimations: true
    }
    
    // Check if design exists
    const existingDesign = await prisma.$queryRaw`
      SELECT id FROM hackathon_form_designs
      WHERE hackathonId = ${hackathonId}
    `
    
    if (existingDesign.length > 0) {
      // Update existing design
      await prisma.$executeRaw`
        UPDATE hackathon_form_designs 
        SET 
          isEnabled = true,
          template = 'modern',
          htmlContent = ${modernTemplate},
          cssContent = '',
          jsContent = '',
          settings = ${JSON.stringify(designSettings)},
          updatedAt = CURRENT_TIMESTAMP
        WHERE hackathonId = ${hackathonId}
      `
      console.log('✅ Form design updated')
    } else {
      // Create new design
      const designId = `form_design_${Date.now()}`
      await prisma.$executeRaw`
        INSERT INTO hackathon_form_designs 
        (id, hackathonId, isEnabled, template, htmlContent, cssContent, jsContent, settings)
        VALUES (${designId}, ${hackathonId}, true, 'modern', ${modernTemplate}, '', '', ${JSON.stringify(designSettings)})
      `
      console.log('✅ Form design created')
    }
    
    // 4. Test the APIs
    console.log('🧪 Testing APIs...')
    
    // Test form API
    try {
      const response = await fetch(`http://localhost:3001/api/form/${hackathonId}`)
      if (response.ok) {
        console.log('✅ Form API working')
      } else {
        console.log('⚠️ Form API returned:', response.status)
      }
    } catch (error) {
      console.log('⚠️ Form API test failed (server might not be running)')
    }
    
    console.log('\n🎉 Form issues fixed successfully!')
    console.log('\n📋 What was fixed:')
    console.log('✅ Registration form created/updated with proper fields')
    console.log('✅ Form design created with modern template')
    console.log('✅ Database tables ensured')
    console.log('✅ All settings configured properly')
    
    console.log('\n🔗 URLs to test:')
    console.log(`📝 Form Design Page: http://localhost:3001/admin/hackathons/${hackathonId}/register-form-design`)
    console.log(`👁️ Form Preview: http://localhost:3001/api/form/${hackathonId}`)
    console.log(`📋 Registration Form: http://localhost:3001/hackathons/${hackathonId}/register-form`)
    
  } catch (error) {
    console.error('❌ Error fixing form issues:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function createFormViaRawSQL(hackathonId, hackathonTitle, fields, settings) {
  // Create table if not exists
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS hackathon_forms (
      id TEXT PRIMARY KEY,
      hackathonId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      isActive BOOLEAN DEFAULT true,
      fields TEXT NOT NULL,
      settings TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hackathonId) REFERENCES hackathons (id) ON DELETE CASCADE
    )
  `
  
  const formId = `form_${Date.now()}`
  await prisma.$executeRaw`
    INSERT INTO hackathon_forms 
    (id, hackathonId, title, description, isActive, fields, settings)
    VALUES (
      ${formId}, 
      ${hackathonId}, 
      ${'نموذج التسجيل في ' + hackathonTitle},
      ${'يرجى ملء البيانات المطلوبة للتسجيل في الهاكاثون'},
      true,
      ${JSON.stringify(fields)},
      ${JSON.stringify(settings)}
    )
  `
  console.log('✅ Registration form created via raw SQL:', formId)
}

async function updateFormViaRawSQL(hackathonId, hackathonTitle, fields, settings) {
  await prisma.$executeRaw`
    UPDATE hackathon_forms 
    SET 
      title = ${'نموذج التسجيل في ' + hackathonTitle},
      description = ${'يرجى ملء البيانات المطلوبة للتسجيل في الهاكاثون'},
      isActive = true,
      fields = ${JSON.stringify(fields)},
      settings = ${JSON.stringify(settings)},
      updatedAt = CURRENT_TIMESTAMP
    WHERE hackathonId = ${hackathonId}
  `
  console.log('✅ Registration form updated via raw SQL')
}

function generateModernTemplate(hackathon) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل - ${hackathon.title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Cairo', Arial, sans-serif;
            background: linear-gradient(135deg, #01645e 0%, #667eea 100%);
            min-height: 100vh;
            direction: rtl;
            padding: 2rem 1rem;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            animation: slideUp 0.6s ease-out;
        }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .header {
            background: linear-gradient(135deg, #01645e 0%, #667eea 100%);
            color: white;
            padding: 3rem 2rem;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .header-content {
            position: relative;
            z-index: 2;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.95;
        }
        
        .progress-bar {
            height: 4px;
            background: #e1e5e9;
            position: relative;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #01645e, #667eea);
            width: 0%;
            transition: width 0.3s ease;
        }
        
        .form-container {
            padding: 3rem 2rem;
        }
        
        .form-group {
            margin-bottom: 2rem;
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.6s ease forwards;
        }
        
        .form-group:nth-child(1) { animation-delay: 0.1s; }
        .form-group:nth-child(2) { animation-delay: 0.2s; }
        .form-group:nth-child(3) { animation-delay: 0.3s; }
        .form-group:nth-child(4) { animation-delay: 0.4s; }
        .form-group:nth-child(5) { animation-delay: 0.5s; }
        .form-group:nth-child(6) { animation-delay: 0.6s; }
        .form-group:nth-child(7) { animation-delay: 0.7s; }
        .form-group:nth-child(8) { animation-delay: 0.8s; }
        .form-group:nth-child(9) { animation-delay: 0.9s; }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
            font-size: 1.1rem;
        }
        
        .form-input {
            width: 100%;
            padding: 1rem;
            border: 2px solid #e1e5e9;
            border-radius: 12px;
            font-size: 1rem;
            font-family: inherit;
            transition: all 0.3s ease;
            background: #f8f9fa;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #01645e;
            background: white;
            box-shadow: 0 0 0 3px rgba(1, 100, 94, 0.1);
            transform: translateY(-2px);
        }
        
        .form-textarea {
            min-height: 120px;
            resize: vertical;
        }
        
        .form-select {
            appearance: none;
            background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6,9 12,15 18,9"></polyline></svg>');
            background-repeat: no-repeat;
            background-position: left 1rem center;
            background-size: 1rem;
            padding-left: 3rem;
        }
        
        .checkbox-group, .radio-group {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .checkbox-item, .radio-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }
        
        .checkbox-item:hover, .radio-item:hover {
            background: #e9ecef;
            transform: translateY(-2px);
            border-color: #01645e;
        }
        
        .checkbox-item input:checked + label,
        .radio-item input:checked + label {
            color: #01645e;
            font-weight: 600;
        }
        
        .submit-btn {
            background: linear-gradient(135deg, #01645e 0%, #667eea 100%);
            color: white;
            border: none;
            padding: 1.25rem 3rem;
            font-size: 1.2rem;
            font-weight: 600;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
            width: 100%;
            position: relative;
            overflow: hidden;
        }
        
        .submit-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        
        .submit-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.3);
        }
        
        .submit-btn:hover::before {
            left: 100%;
        }
        
        .success-message {
            background: #d4edda;
            color: #155724;
            padding: 1rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            border: 1px solid #c3e6cb;
            text-align: center;
        }
        
        .error-message {
            color: #dc3545;
            font-size: 0.9rem;
            margin-top: 0.5rem;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            body { padding: 1rem 0.5rem; }
            .header { padding: 2rem 1rem; }
            .header h1 { font-size: 2rem; }
            .form-container { padding: 2rem 1rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <h1><i class="fas fa-rocket"></i> ${hackathon.title}</h1>
                <p>انضم إلينا في رحلة الإبداع والابتكار</p>
            </div>
        </div>
        
        <div class="progress-bar">
            <div class="progress-fill" id="progressFill"></div>
        </div>
        
        <div class="form-container">
            <div id="formContent">
                <!-- سيتم إدراج محتوى الفورم هنا -->
            </div>
        </div>
    </div>
    
    <script>
        // تحديث شريط التقدم
        function updateProgress() {
            const inputs = document.querySelectorAll('input, select, textarea');
            let filled = 0;
            
            inputs.forEach(input => {
                if (input.value && input.value.trim() !== '') {
                    filled++;
                }
            });
            
            const progress = (filled / inputs.length) * 100;
            document.getElementById('progressFill').style.width = progress + '%';
        }
        
        // إضافة مستمعي الأحداث
        document.addEventListener('DOMContentLoaded', function() {
            const inputs = document.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('input', updateProgress);
                input.addEventListener('change', updateProgress);
            });
            
            updateProgress();
        });
    </script>
</body>
</html>`
}

// Run the fix
fixFormIssues()
