const { PrismaClient } = require("@prisma/client");
process.env.DATABASE_URL = "file:./dev.db";
const prisma = new PrismaClient();

// مولد Landing Pages ذكي
class LandingPageBuilder {
  constructor(hackathon, hackathonId) {
    this.hackathon = hackathon;
    this.hackathonId = hackathonId;
  }

  // إنشاء صفحة كاملة مع جميع الأقسام
  buildFullPage(options = {}) {
    const {
      theme = "modern",
      includeStats = true,
      includeFeatures = true,
      includeTimeline = false,
      customColors = null,
    } = options;

    const colors = customColors || this.getThemeColors(theme);

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.hackathon.title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        ${this.generateCSS(colors, theme)}
    </style>
</head>
<body>
    ${this.generateHeader()}
    ${this.generateHero()}
    ${includeFeatures ? this.generateFeatures() : ""}
    ${includeStats ? this.generateStats() : ""}
    ${includeTimeline ? this.generateTimeline() : ""}
    ${this.generateCTA()}
    ${this.generateFooter()}
    
    <script>
        ${this.generateJavaScript()}
    </script>
</body>
</html>`;
  }

  getThemeColors(theme) {
    const themes = {
      modern: {
        primary: "#667eea",
        secondary: "#764ba2",
        accent: "#ff6b6b",
        text: "#333",
        background: "#f8f9fa",
      },
      dark: {
        primary: "#1a1a1a",
        secondary: "#2d2d2d",
        accent: "#00ff88",
        text: "#ffffff",
        background: "#0a0a0a",
      },
      corporate: {
        primary: "#2c3e50",
        secondary: "#3498db",
        accent: "#e74c3c",
        text: "#2c3e50",
        background: "#ecf0f1",
      },
      creative: {
        primary: "#ff6b6b",
        secondary: "#4ecdc4",
        accent: "#45b7d1",
        text: "#2c3e50",
        background: "#f7f7f7",
      },
    };
    return themes[theme] || themes.modern;
  }

  generateCSS(colors, theme) {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Cairo', Arial, sans-serif;
            line-height: 1.6;
            color: ${colors.text};
            direction: rtl;
            background: ${colors.background};
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Header */
        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
        }
        
        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: 700;
            color: ${colors.primary};
        }
        
        .nav-btn {
            background: ${colors.accent};
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .nav-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        /* Hero */
        .hero {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .hero-content {
            max-width: 800px;
            padding: 2rem;
            position: relative;
            z-index: 2;
        }
        
        .hero h1 {
            font-size: 4rem;
            margin-bottom: 1.5rem;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            animation: fadeInUp 1s ease-out;
        }
        
        .hero p {
            font-size: 1.4rem;
            margin-bottom: 2.5rem;
            opacity: 0.95;
            animation: fadeInUp 1s ease-out 0.2s both;
        }
        
        .btn-primary {
            background: ${colors.accent};
            color: white;
            border: none;
            padding: 18px 40px;
            font-size: 1.2rem;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
            animation: fadeInUp 1s ease-out 0.4s both;
        }
        
        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.3);
        }
        
        /* Features */
        .features {
            padding: 100px 0;
            background: ${colors.background};
        }
        
        .section-title {
            text-align: center;
            font-size: 3rem;
            margin-bottom: 3rem;
            color: ${colors.text};
            font-weight: 700;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 3rem;
        }
        
        .feature-card {
            background: white;
            padding: 3rem 2rem;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-10px);
        }
        
        .feature-icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
            color: ${colors.primary};
        }
        
        /* Stats */
        .stats {
            padding: 80px 0;
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
            color: white;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            text-align: center;
        }
        
        .stat-item h3 {
            font-size: 3rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
        }
        
        /* CTA */
        .cta {
            padding: 100px 0;
            background: ${colors.accent};
            color: white;
            text-align: center;
        }
        
        /* Footer */
        .footer {
            background: ${colors.text};
            color: white;
            padding: 40px 0;
            text-align: center;
        }
        
        /* Animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .hero p { font-size: 1.2rem; }
            .section-title { font-size: 2rem; }
            .features-grid { grid-template-columns: 1fr; }
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
    `;
  }

  generateHeader() {
    return `
    <header class="header">
        <nav class="nav container">
            <div class="logo">${this.hackathon.title}</div>
            <button class="nav-btn" onclick="register()">سجل الآن</button>
        </nav>
    </header>`;
  }

  generateHero() {
    return `
    <section class="hero">
        <div class="hero-content">
            <h1>${this.hackathon.title}</h1>
            <p>${
              this.hackathon.description ||
              "انضم إلينا في رحلة الإبداع والابتكار التقني"
            }</p>
            <button class="btn-primary" onclick="register()">
                <i class="fas fa-rocket"></i> سجل الآن
            </button>
        </div>
    </section>`;
  }

  generateFeatures() {
    return `
    <section class="features">
        <div class="container">
            <h2 class="section-title">لماذا تشارك معنا؟</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-trophy"></i></div>
                    <h3>جوائز قيمة</h3>
                    <p>جوائز مالية ومعنوية للفائزين مع فرص للتوظيف والاستثمار</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-users"></i></div>
                    <h3>شبكة تواصل</h3>
                    <p>تواصل مع خبراء الصناعة ورواد الأعمال والمطورين المتميزين</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-lightbulb"></i></div>
                    <h3>تطوير المهارات</h3>
                    <p>ورش عمل ومحاضرات من خبراء لتطوير مهاراتك التقنية</p>
                </div>
            </div>
        </div>
    </section>`;
  }

  generateStats() {
    return `
    <section class="stats">
        <div class="container">
            <div class="stats-grid">
                <div class="stat-item">
                    <h3>500+</h3>
                    <p>مشارك</p>
                </div>
                <div class="stat-item">
                    <h3>50+</h3>
                    <p>فريق</p>
                </div>
                <div class="stat-item">
                    <h3>100K+</h3>
                    <p>جائزة</p>
                </div>
                <div class="stat-item">
                    <h3>48</h3>
                    <p>ساعة</p>
                </div>
            </div>
        </div>
    </section>`;
  }

  generateTimeline() {
    return `
    <section class="timeline">
        <div class="container">
            <h2 class="section-title">الجدول الزمني</h2>
            <!-- Timeline content here -->
        </div>
    </section>`;
  }

  generateCTA() {
    return `
    <section class="cta">
        <div class="container">
            <h2>جاهز للانضمام؟</h2>
            <p>لا تفوت الفرصة وسجل الآن</p>
            <button class="btn-primary" onclick="register()">سجل الآن</button>
        </div>
    </section>`;
  }

  generateFooter() {
    return `
    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 ${this.hackathon.title}. جميع الحقوق محفوظة.</p>
        </div>
    </footer>`;
  }

  generateJavaScript() {
    return `
        function register() {
            window.location.href = '/hackathons/${this.hackathonId}/register-form';
        }
        
        // Smooth scrolling
        document.addEventListener('DOMContentLoaded', function() {
            // Add loading animation
            document.body.style.opacity = '0';
            setTimeout(() => {
                document.body.style.transition = 'opacity 0.5s ease';
                document.body.style.opacity = '1';
            }, 100);
            
            // Animate stats on scroll
            const stats = document.querySelectorAll('.stat-item h3');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = parseInt(entry.target.textContent);
                        animateNumber(entry.target, target);
                    }
                });
            });
            
            stats.forEach(stat => observer.observe(stat));
        });
        
        function animateNumber(element, target) {
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target + '+';
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current) + '+';
                }
            }, 30);
        }`;
  }
}

// استخدام المولد
async function createCustomLandingPage(hackathonId, options = {}) {
  try {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      console.log("❌ Hackathon not found");
      return;
    }

    const builder = new LandingPageBuilder(hackathon, hackathonId);
    const html = builder.buildFullPage(options);

    // Save to database
    const landingPage = await prisma.hackathonLandingPage.upsert({
      where: { hackathonId: hackathonId },
      update: {
        htmlContent: html,
        cssContent: "",
        jsContent: "",
        isEnabled: true,
        template: "custom",
        seoTitle: hackathon.title + " - صفحة الهبوط",
        seoDescription:
          hackathon.description || "انضم إلينا في هاكاثون الإبداع والابتكار",
      },
      create: {
        id: `landing_${Date.now()}`,
        hackathonId: hackathonId,
        htmlContent: html,
        cssContent: "",
        jsContent: "",
        isEnabled: true,
        template: "custom",
        seoTitle: hackathon.title + " - صفحة الهبوط",
        seoDescription:
          hackathon.description || "انضم إلينا في هاكاثون الإبداع والابتكار",
      },
    });

    console.log("✅ Custom landing page created successfully!");
    console.log("- Theme:", options.theme || "modern");
    console.log("- Features:", options.includeFeatures !== false);
    console.log("- Stats:", options.includeStats !== false);
    console.log("- HTML length:", landingPage.htmlContent.length);
    console.log("- Preview URL: /api/landing/" + hackathonId);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Examples
const hackathonId = "cmfrav55o0001fd8wu0hasq8s";

// Create modern theme
createCustomLandingPage(hackathonId, {
  theme: "modern",
  includeStats: true,
  includeFeatures: true,
  includeTimeline: false,
});
