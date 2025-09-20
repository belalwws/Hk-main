const { PrismaClient } = require("@prisma/client");
process.env.DATABASE_URL = "file:./dev.db";
const prisma = new PrismaClient();

// قوالب متقدمة
const ADVANCED_TEMPLATES = {
  creative: {
    name: 'إبداعي وفني',
    html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Cairo', Arial, sans-serif;
            direction: rtl;
            overflow-x: hidden;
            background: #000;
            color: white;
        }
        
        .hero {
            min-height: 100vh;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        .hero-content {
            text-align: center;
            max-width: 800px;
            padding: 2rem;
            position: relative;
            z-index: 2;
        }
        
        .glitch {
            font-size: 4rem;
            font-weight: 700;
            margin-bottom: 1rem;
            position: relative;
            animation: glitch 2s infinite;
        }
        
        @keyframes glitch {
            0%, 100% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
        }
        
        .subtitle {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            opacity: 0.9;
            animation: fadeInUp 1s ease-out 0.5s both;
        }
        
        .cta-btn {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 2px solid white;
            padding: 20px 40px;
            font-size: 1.3rem;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            backdrop-filter: blur(10px);
            animation: pulse 2s infinite;
        }
        
        .cta-btn:hover {
            background: white;
            color: #333;
            transform: scale(1.05);
        }
        
        @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
            50% { box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
        }
        
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .particles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        
        .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: white;
            border-radius: 50%;
            animation: float 6s linear infinite;
        }
        
        @keyframes float {
            0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        
        @media (max-width: 768px) {
            .glitch { font-size: 2.5rem; }
            .subtitle { font-size: 1.2rem; }
        }
    </style>
</head>
<body>
    <section class="hero">
        <div class="particles" id="particles"></div>
        <div class="hero-content">
            <h1 class="glitch">{{TITLE}}</h1>
            <p class="subtitle">{{DESCRIPTION}}</p>
            <button class="cta-btn" onclick="register()">🚀 انطلق معنا</button>
        </div>
    </section>
    
    <script>
        function register() {
            window.location.href = '/hackathons/{{ID}}/register-form';
        }
        
        // Create floating particles
        function createParticles() {
            const particles = document.getElementById('particles');
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 6 + 's';
                particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
                particles.appendChild(particle);
            }
        }
        
        document.addEventListener('DOMContentLoaded', createParticles);
    </script>
</body>
</html>`
  },

  gaming: {
    name: 'ألعاب وتقنية',
    html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Cairo:wght@400;600&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Cairo', Arial, sans-serif;
            direction: rtl;
            background: #0a0a0a;
            color: #00ff00;
            overflow-x: hidden;
        }
        
        .hero {
            min-height: 100vh;
            background: 
                radial-gradient(circle at 20% 80%, rgba(0, 255, 0, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
                linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        .matrix-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                linear-gradient(90deg, rgba(0, 255, 0, 0.03) 1px, transparent 1px),
                linear-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px);
            background-size: 20px 20px;
            animation: matrix 20s linear infinite;
        }
        
        @keyframes matrix {
            0% { transform: translate(0, 0); }
            100% { transform: translate(20px, 20px); }
        }
        
        .hero-content {
            text-align: center;
            max-width: 800px;
            padding: 2rem;
            position: relative;
            z-index: 2;
        }
        
        .title {
            font-family: 'Orbitron', monospace;
            font-size: 4rem;
            font-weight: 900;
            margin-bottom: 1rem;
            text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00;
            animation: glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
            from { text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00; }
            to { text-shadow: 0 0 20px #00ff00, 0 0 30px #00ff00, 0 0 40px #00ff00; }
        }
        
        .subtitle {
            font-size: 1.3rem;
            margin-bottom: 2rem;
            color: #00ffff;
            opacity: 0.8;
        }
        
        .terminal {
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #00ff00;
            border-radius: 10px;
            padding: 1rem;
            margin: 2rem 0;
            font-family: 'Courier New', monospace;
            text-align: right;
        }
        
        .terminal-line {
            margin: 0.5rem 0;
            animation: typewriter 3s steps(40) infinite;
        }
        
        @keyframes typewriter {
            0%, 50% { width: 0; }
            100% { width: 100%; }
        }
        
        .btn-hack {
            background: linear-gradient(45deg, #00ff00, #00ffff);
            color: #000;
            border: none;
            padding: 15px 30px;
            font-size: 1.2rem;
            font-weight: 700;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 2px;
            position: relative;
            overflow: hidden;
        }
        
        .btn-hack::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        
        .btn-hack:hover::before {
            left: 100%;
        }
        
        .btn-hack:hover {
            transform: scale(1.05);
            box-shadow: 0 0 20px #00ff00;
        }
        
        @media (max-width: 768px) {
            .title { font-size: 2.5rem; }
            .subtitle { font-size: 1.1rem; }
        }
    </style>
</head>
<body>
    <section class="hero">
        <div class="matrix-bg"></div>
        <div class="hero-content">
            <h1 class="title">{{TITLE}}</h1>
            <p class="subtitle">{{DESCRIPTION}}</p>
            
            <div class="terminal">
                <div class="terminal-line">> نظام التسجيل جاهز...</div>
                <div class="terminal-line">> انتظار الأوامر...</div>
                <div class="terminal-line">> اضغط للانضمام_</div>
            </div>
            
            <button class="btn-hack" onclick="register()">
                HACK THE FUTURE
            </button>
        </div>
    </section>
    
    <script>
        function register() {
            window.location.href = '/hackathons/{{ID}}/register-form';
        }
        
        // Add glitch effect on click
        document.querySelector('.btn-hack').addEventListener('click', function() {
            this.style.animation = 'glitch 0.3s ease-in-out';
            setTimeout(() => {
                this.style.animation = '';
            }, 300);
        });
    </script>
</body>
</html>`
  }
};

async function createAdvancedLandingPage(hackathonId, templateName = 'creative') {
  try {
    // Get hackathon details
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    });
    
    if (!hackathon) {
      console.log('❌ Hackathon not found');
      return;
    }
    
    console.log('✅ Hackathon found:', hackathon.title);
    
    // Get template
    const template = ADVANCED_TEMPLATES[templateName];
    if (!template) {
      console.log('❌ Template not found');
      return;
    }
    
    // Process template
    const processedHtml = template.html
      .replace(/{{TITLE}}/g, hackathon.title)
      .replace(/{{DESCRIPTION}}/g, hackathon.description || 'انضم إلينا في رحلة الإبداع والابتكار')
      .replace(/{{ID}}/g, hackathonId);
    
    // Create or update landing page
    const landingPage = await prisma.hackathonLandingPage.upsert({
      where: { hackathonId: hackathonId },
      update: {
        htmlContent: processedHtml,
        cssContent: '',
        jsContent: '',
        isEnabled: true,
        template: templateName,
        seoTitle: hackathon.title + ' - صفحة الهبوط',
        seoDescription: hackathon.description || 'انضم إلينا في هاكاثون الإبداع والابتكار'
      },
      create: {
        id: \`landing_\${Date.now()}\`,
        hackathonId: hackathonId,
        htmlContent: processedHtml,
        cssContent: '',
        jsContent: '',
        isEnabled: true,
        template: templateName,
        seoTitle: hackathon.title + ' - صفحة الهبوط',
        seoDescription: hackathon.description || 'انضم إلينا في هاكاثون الإبداع والابتكار'
      }
    });
    
    console.log('✅ Advanced landing page created successfully!');
    console.log('- Template:', template.name);
    console.log('- ID:', landingPage.id);
    console.log('- Enabled:', landingPage.isEnabled);
    console.log('- HTML length:', landingPage.htmlContent.length);
    console.log('- Preview URL: /api/landing/' + hackathonId);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Usage examples
const hackathonId = 'cmfrav55o0001fd8wu0hasq8s';

console.log('🚀 Creating advanced landing pages...\n');

// Create creative template
createAdvancedLandingPage(hackathonId, 'creative').then(() => {
  console.log('\n🎨 Creative template created!');
  console.log('Preview: http://localhost:3000/api/landing/' + hackathonId);
});
