const { PrismaClient } = require("@prisma/client");
process.env.DATABASE_URL = "file:./dev.db";
const prisma = new PrismaClient();

async function createLandingPage() {
  try {
    const hackathonId = 'cmfrav55o0001fd8wu0hasq8s';
    
    // Check if hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    });
    
    if (!hackathon) {
      console.log('❌ Hackathon not found');
      return;
    }
    
    console.log('✅ Hackathon found:', hackathon.title);
    
    // Create landing page with default template
    const defaultHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${hackathon.title}</title>
</head>
<body>
    <div class="hero">
        <div class="container">
            <h1>${hackathon.title}</h1>
            <p>${hackathon.description || 'انضم إلينا في رحلة الإبداع والابتكار'}</p>
            <button onclick="register()" class="register-btn">سجل الآن</button>
        </div>
    </div>
    
    <div class="details">
        <div class="container">
            <h2>تفاصيل الهاكاثون</h2>
            <div class="details-grid">
                <div class="detail-card">
                    <div class="detail-icon">📅</div>
                    <h3>التاريخ</h3>
                    <p>${hackathon.startDate ? new Date(hackathon.startDate).toLocaleDateString('ar-SA') : 'قريباً'}</p>
                </div>
                <div class="detail-card">
                    <div class="detail-icon">🏆</div>
                    <h3>الجوائز</h3>
                    <p>جوائز قيمة للفائزين</p>
                </div>
                <div class="detail-card">
                    <div class="detail-icon">👥</div>
                    <h3>المشاركة</h3>
                    <p>فردي أو جماعي</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

    const defaultCss = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    direction: rtl;
    text-align: right;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.hero h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
}

.hero p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.register-btn {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 1.1rem;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
}

.register-btn:hover {
    background: #ff5252;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.details {
    padding: 80px 0;
    background: #f8f9fa;
}

.details h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: #333;
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.detail-card {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.detail-card:hover {
    transform: translateY(-5px);
}

.detail-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.detail-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #333;
}

.detail-card p {
    color: #666;
    font-size: 1.1rem;
}

@media (max-width: 768px) {
    .hero h1 {
        font-size: 2.5rem;
    }
    
    .details-grid {
        grid-template-columns: 1fr;
    }
}`;

    const defaultJs = `function register() {
    window.location.href = '/hackathons/${hackathonId}/register-form';
}

function goToHackathon() {
    window.location.href = '/hackathons/${hackathonId}';
}`;

    // Create or update landing page
    const landingPage = await prisma.hackathonLandingPage.upsert({
      where: { hackathonId: hackathonId },
      update: {
        htmlContent: defaultHtml,
        cssContent: defaultCss,
        jsContent: defaultJs,
        isEnabled: true,
        template: 'modern',
        seoTitle: hackathon.title + ' - صفحة الهبوط',
        seoDescription: hackathon.description || 'انضم إلينا في هاكاثون الإبداع والابتكار'
      },
      create: {
        id: `landing_${Date.now()}`,
        hackathonId: hackathonId,
        htmlContent: defaultHtml,
        cssContent: defaultCss,
        jsContent: defaultJs,
        isEnabled: true,
        template: 'modern',
        seoTitle: hackathon.title + ' - صفحة الهبوط',
        seoDescription: hackathon.description || 'انضم إلينا في هاكاثون الإبداع والابتكار'
      }
    });
    
    console.log('✅ Landing page created/updated successfully!');
    console.log('- ID:', landingPage.id);
    console.log('- Enabled:', landingPage.isEnabled);
    console.log('- Template:', landingPage.template);
    console.log('- HTML length:', landingPage.htmlContent.length);
    console.log('- CSS length:', landingPage.cssContent.length);
    console.log('- JS length:', landingPage.jsContent.length);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createLandingPage();
