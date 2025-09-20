const { PrismaClient } = require("@prisma/client");
process.env.DATABASE_URL = "file:./dev.db";
const prisma = new PrismaClient();

async function testLandingPageUpdate() {
  try {
    const hackathonId = 'cmfrav55o0001fd8wu0hasq8s';
    
    console.log('🔍 Testing landing page update...\n');
    
    // 1. Check current landing page
    console.log('1️⃣ Current landing page:');
    const currentPage = await prisma.hackathonLandingPage.findUnique({
      where: { hackathonId: hackathonId }
    });
    
    if (currentPage) {
      console.log('- ID:', currentPage.id);
      console.log('- HTML length:', currentPage.htmlContent?.length || 0);
      console.log('- CSS length:', currentPage.cssContent?.length || 0);
      console.log('- JS length:', currentPage.jsContent?.length || 0);
      console.log('- Enabled:', currentPage.isEnabled);
      console.log('- Updated at:', currentPage.updatedAt);
      console.log('- HTML preview:', currentPage.htmlContent?.substring(0, 100) + '...');
    } else {
      console.log('❌ No landing page found');
      return;
    }
    
    console.log('\n2️⃣ Creating test HTML with timestamp...');
    
    // 2. Create test HTML with current timestamp
    const timestamp = new Date().toLocaleString('ar-SA');
    const testHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>اختبار التحديث - ${timestamp}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Cairo', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            direction: rtl;
            text-align: center;
        }
        
        .container {
            max-width: 800px;
            padding: 3rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(15px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }
        
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            animation: glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
            from { text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
            to { text-shadow: 2px 2px 20px rgba(255,255,255,0.5); }
        }
        
        .timestamp {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            color: #ffeb3b;
            font-weight: 600;
        }
        
        .btn {
            background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
            color: white;
            border: none;
            padding: 18px 40px;
            font-size: 1.2rem;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
        }
        
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px rgba(255, 107, 107, 0.4);
        }
        
        .info {
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            font-size: 1.1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 اختبار تحديث Landing Page</h1>
        <div class="timestamp">آخر تحديث: ${timestamp}</div>
        <p>إذا كنت ترى هذا النص مع الوقت الحالي، فإن التحديث يعمل بشكل صحيح!</p>
        <button class="btn" onclick="register()">سجل الآن</button>
        
        <div class="info">
            <strong>معلومات التحديث:</strong><br>
            - تم إنشاء هذه الصفحة في: ${timestamp}<br>
            - الهاكاثون ID: ${hackathonId}<br>
            - حالة الاختبار: ✅ نجح التحديث
        </div>
    </div>
    
    <script>
        function register() {
            alert('🎉 زر التسجيل يعمل! التحديث نجح بالكامل.');
            window.location.href = '/hackathons/${hackathonId}/register-form';
        }
        
        // Show update confirmation
        console.log('✅ Landing page updated successfully at:', '${timestamp}');
        
        // Add some interactivity
        document.addEventListener('DOMContentLoaded', function() {
            const container = document.querySelector('.container');
            container.addEventListener('click', function() {
                this.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
            });
        });
    </script>
</body>
</html>`;

    // 3. Update the landing page
    console.log('3️⃣ Updating landing page...');
    const updatedPage = await prisma.hackathonLandingPage.update({
      where: { hackathonId: hackathonId },
      data: {
        htmlContent: testHtml,
        cssContent: '',
        jsContent: '',
        isEnabled: true,
        template: 'test',
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Landing page updated successfully!');
    console.log('- New HTML length:', updatedPage.htmlContent.length);
    console.log('- Updated at:', updatedPage.updatedAt);
    
    console.log('\n4️⃣ Testing URLs:');
    console.log('🌐 Preview URL: http://localhost:3000/api/landing/' + hackathonId);
    console.log('⚙️ Admin URL: http://localhost:3000/admin/hackathons/' + hackathonId + '/landing-page');
    console.log('🚀 Advanced Editor: http://localhost:3000/admin/hackathons/' + hackathonId + '/landing-page-advanced');
    
    console.log('\n✅ Test completed! Check the preview URL to see the changes.');
    console.log('🕐 Timestamp in page:', timestamp);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLandingPageUpdate();
