const { PrismaClient } = require("@prisma/client");
process.env.DATABASE_URL = "file:./dev.db";
const prisma = new PrismaClient();

// مولد قوالب فورم التسجيل المتقدمة
class FormTemplateGenerator {
  constructor(hackathon, hackathonId) {
    this.hackathon = hackathon;
    this.hackathonId = hackathonId;
  }

  // قالب عصري متقدم
  generateModernTemplate() {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل - ${this.hackathon.title}</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            direction: rtl;
            padding: 2rem 1rem;
            position: relative;
            overflow-x: hidden;
        }
        
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
            z-index: -1;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 25px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.2);
            overflow: hidden;
            animation: slideUp 0.8s ease-out;
            position: relative;
        }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .header {
            background: linear-gradient(135deg, #01645e 0%, #667eea 100%);
            color: white;
            padding: 4rem 2rem;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
        }
        
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .header-content {
            position: relative;
            z-index: 2;
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            animation: glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
            from { text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
            to { text-shadow: 2px 2px 20px rgba(255,255,255,0.5); }
        }
        
        .header p {
            font-size: 1.3rem;
            opacity: 0.95;
            margin-bottom: 2rem;
        }
        
        .progress-container {
            background: rgba(255,255,255,0.2);
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 2rem;
        }
        
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #ffeb3b, #ff9800);
            width: 0%;
            transition: width 0.5s ease;
            border-radius: 3px;
        }
        
        .form-container {
            padding: 4rem 3rem;
        }
        
        .form-group {
            margin-bottom: 2.5rem;
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .form-group:nth-child(1) { animation-delay: 0.1s; }
        .form-group:nth-child(2) { animation-delay: 0.2s; }
        .form-group:nth-child(3) { animation-delay: 0.3s; }
        .form-group:nth-child(4) { animation-delay: 0.4s; }
        .form-group:nth-child(5) { animation-delay: 0.5s; }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .form-label {
            display: block;
            margin-bottom: 0.75rem;
            font-weight: 600;
            color: #2c3e50;
            font-size: 1.1rem;
            position: relative;
        }
        
        .form-label::after {
            content: '';
            position: absolute;
            bottom: -5px;
            right: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, #01645e, #667eea);
            transition: width 0.3s ease;
        }
        
        .form-group:focus-within .form-label::after {
            width: 100%;
        }
        
        .form-input {
            width: 100%;
            padding: 1.25rem;
            border: 2px solid #e1e5e9;
            border-radius: 15px;
            font-size: 1.1rem;
            font-family: inherit;
            transition: all 0.3s ease;
            background: #f8f9fa;
            position: relative;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #01645e;
            background: white;
            box-shadow: 0 0 0 4px rgba(1, 100, 94, 0.1);
            transform: translateY(-2px);
        }
        
        .form-textarea {
            min-height: 140px;
            resize: vertical;
        }
        
        .form-select {
            appearance: none;
            background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2301645e" stroke-width="2"><polyline points="6,9 12,15 18,9"></polyline></svg>');
            background-repeat: no-repeat;
            background-position: left 1rem center;
            background-size: 1.2rem;
            padding-left: 3.5rem;
        }
        
        .checkbox-group, .radio-group {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }
        
        .checkbox-item, .radio-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.25rem;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid transparent;
            position: relative;
            overflow: hidden;
        }
        
        .checkbox-item::before, .radio-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #01645e 0%, #667eea 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: -1;
        }
        
        .checkbox-item:hover, .radio-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border-color: #01645e;
        }
        
        .checkbox-item:hover::before, .radio-item:hover::before {
            opacity: 0.05;
        }
        
        .checkbox-item input:checked + label,
        .radio-item input:checked + label {
            color: #01645e;
            font-weight: 600;
        }
        
        .submit-container {
            text-align: center;
            margin-top: 4rem;
            padding-top: 2rem;
            border-top: 2px solid #e9ecef;
        }
        
        .submit-btn {
            background: linear-gradient(135deg, #01645e 0%, #667eea 100%);
            color: white;
            border: none;
            padding: 1.5rem 4rem;
            font-size: 1.3rem;
            font-weight: 700;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 15px 30px rgba(1, 100, 94, 0.3);
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
            transition: left 0.5s ease;
        }
        
        .submit-btn:hover {
            transform: translateY(-5px);
            box-shadow: 0 25px 50px rgba(1, 100, 94, 0.4);
        }
        
        .submit-btn:hover::before {
            left: 100%;
        }
        
        .floating-elements {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        }
        
        .floating-element {
            position: absolute;
            width: 10px;
            height: 10px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            body { padding: 1rem 0.5rem; }
            .header { padding: 3rem 1.5rem; }
            .header h1 { font-size: 2.2rem; }
            .form-container { padding: 3rem 2rem; }
            .checkbox-group, .radio-group { grid-template-columns: 1fr; }
            .submit-btn { padding: 1.25rem 3rem; font-size: 1.1rem; }
        }
    </style>
</head>
<body>
    <div class="floating-elements">
        <div class="floating-element" style="top: 10%; left: 10%; animation-delay: 0s;"></div>
        <div class="floating-element" style="top: 20%; left: 80%; animation-delay: 1s;"></div>
        <div class="floating-element" style="top: 60%; left: 20%; animation-delay: 2s;"></div>
        <div class="floating-element" style="top: 80%; left: 70%; animation-delay: 3s;"></div>
    </div>
    
    <div class="container">
        <div class="header">
            <div class="header-content">
                <h1><i class="fas fa-rocket"></i> ${this.hackathon.title}</h1>
                <p>${this.hackathon.description || 'انضم إلينا في رحلة الإبداع والابتكار التقني'}</p>
                <div class="progress-container">
                    <div class="progress-bar" id="progressBar"></div>
                </div>
            </div>
        </div>
        
        <div class="form-container">
            <!-- سيتم إدراج محتوى الفورم هنا -->
        </div>
    </div>
    
    <script>
        // تحديث شريط التقدم
        function updateProgress() {
            const inputs = document.querySelectorAll('input, select, textarea');
            let filled = 0;
            
            inputs.forEach(input => {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    if (input.checked) filled++;
                } else if (input.value && input.value.trim() !== '') {
                    filled++;
                }
            });
            
            const progress = Math.min((filled / inputs.length) * 100, 100);
            document.getElementById('progressBar').style.width = progress + '%';
        }
        
        // إضافة مستمعي الأحداث
        document.addEventListener('DOMContentLoaded', function() {
            const inputs = document.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('input', updateProgress);
                input.addEventListener('change', updateProgress);
            });
            
            updateProgress();
            
            // تأثير التركيز على الحقول
            inputs.forEach(input => {
                input.addEventListener('focus', function() {
                    this.parentElement.style.transform = 'scale(1.02)';
                });
                
                input.addEventListener('blur', function() {
                    this.parentElement.style.transform = 'scale(1)';
                });
            });
        });
        
        // تأثيرات إضافية
        document.addEventListener('mousemove', function(e) {
            const floatingElements = document.querySelectorAll('.floating-element');
            floatingElements.forEach((element, index) => {
                const speed = (index + 1) * 0.01;
                const x = e.clientX * speed;
                const y = e.clientY * speed;
                element.style.transform = \`translate(\${x}px, \${y}px)\`;
            });
        });
    </script>
</body>
</html>`;
  }

  // قالب داكن أنيق
  generateDarkTemplate() {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل - ${this.hackathon.title}</title>
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
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            min-height: 100vh;
            direction: rtl;
            padding: 2rem 1rem;
            color: #ffffff;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
            animation: slideUp 0.6s ease-out;
        }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .header {
            background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
            color: #000;
            padding: 3rem 2rem;
            text-align: center;
            position: relative;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .form-container {
            padding: 3rem 2rem;
        }
        
        .form-group {
            margin-bottom: 2rem;
        }
        
        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #00ff88;
            font-size: 1.1rem;
        }
        
        .form-input {
            width: 100%;
            padding: 1rem;
            border: 2px solid rgba(0, 255, 136, 0.3);
            border-radius: 10px;
            font-size: 1rem;
            font-family: inherit;
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.05);
            color: #ffffff;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #00ff88;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
        }
        
        .submit-btn {
            background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
            color: #000;
            border: none;
            padding: 1.25rem 3rem;
            font-size: 1.2rem;
            font-weight: 600;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
        }
        
        .submit-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px rgba(0, 255, 136, 0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><i class="fas fa-code"></i> ${this.hackathon.title}</h1>
            <p>انضم إلى المستقبل الرقمي</p>
        </div>
        
        <div class="form-container">
            <!-- سيتم إدراج محتوى الفورم هنا -->
        </div>
    </div>
</body>
</html>`;
  }
}

// إنشاء قوالب للهاكاثون
async function createFormTemplates(hackathonId) {
  try {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    });
    
    if (!hackathon) {
      console.log('❌ Hackathon not found');
      return;
    }
    
    const generator = new FormTemplateGenerator(hackathon, hackathonId);
    
    // إنشاء القالب العصري
    const modernTemplate = generator.generateModernTemplate();
    
    console.log('🎨 Creating modern form template...');
    
    // حفظ في قاعدة البيانات
    await prisma.$executeRaw`
      INSERT OR REPLACE INTO hackathon_form_designs 
      (id, hackathonId, isEnabled, template, htmlContent, cssContent, jsContent, settings)
      VALUES (
        ${'form_design_' + Date.now()}, 
        ${hackathonId}, 
        ${true}, 
        ${'modern'}, 
        ${modernTemplate}, 
        ${''},
        ${''},
        ${JSON.stringify({
          theme: 'modern',
          backgroundColor: '#f8f9fa',
          primaryColor: '#01645e',
          secondaryColor: '#667eea',
          fontFamily: 'Cairo',
          borderRadius: '15px',
          showHackathonInfo: true,
          showProgressBar: true,
          enableAnimations: true
        })}
      )
    `;
    
    console.log('✅ Modern form template created successfully!');
    console.log('🌐 Preview URL: http://localhost:3000/api/form/' + hackathonId);
    console.log('⚙️ Admin URL: http://localhost:3000/admin/hackathons/' + hackathonId + '/register-form-design');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل المولد
const hackathonId = 'cmfrd5gme0002fdmgt2urqx6g';
createFormTemplates(hackathonId);
