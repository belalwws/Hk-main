'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Eye, Code, Palette, Save, ExternalLink } from 'lucide-react'

interface LandingPageData {
  id?: string
  hackathonId: string
  isEnabled: boolean
  customDomain?: string
  htmlContent: string
  cssContent: string
  jsContent: string
  seoTitle?: string
  seoDescription?: string
  template?: string
}

export default function LandingPageEditor({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  const [landingPage, setLandingPage] = useState<LandingPageData>({
    hackathonId: resolvedParams.id,
    isEnabled: false,
    htmlContent: '',
    cssContent: '',
    jsContent: '',
    template: 'blank'
  })
  const [hackathon, setHackathon] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    fetchHackathon()
    fetchLandingPage()
  }, [resolvedParams.id])

  const fetchHackathon = async () => {
    try {
      const response = await fetch(`/api/hackathons/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setHackathon(data)
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error)
    }
  }

  const fetchLandingPage = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${resolvedParams.id}/landing-page`)
      if (response.ok) {
        const data = await response.json()
        setLandingPage(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Error fetching landing page:', error)
    }
  }

  const saveLandingPage = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${resolvedParams.id}/landing-page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(landingPage)
      })

      if (response.ok) {
        alert('تم حفظ الصفحة بنجاح!')
      } else {
        alert('حدث خطأ في الحفظ')
      }
    } catch (error) {
      console.error('Error saving landing page:', error)
      alert('حدث خطأ في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const loadTemplate = (templateName: string) => {
    const templates = {
      blank: {
        html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${hackathon?.title || 'هاكاثون'}</title>
</head>
<body>
    <div class="container">
        <h1>${hackathon?.title || 'هاكاثون'}</h1>
        <p>${hackathon?.description || 'وصف الهاكاثون'}</p>
        <button onclick="register()">سجل الآن</button>
    </div>
</body>
</html>`,
        css: `body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    text-align: center;
    max-width: 800px;
    padding: 2rem;
}

h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

button {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:hover {
    background: #ff5252;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}`,
        js: `function register() {
    window.location.href = '/hackathons/${resolvedParams.id}/register-form';
}`
      },
      modern: {
        html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${hackathon?.title || 'هاكاثون'}</title>
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="logo">🚀 ${hackathon?.title || 'هاكاثون'}</div>
            <button class="register-btn" onclick="register()">سجل الآن</button>
        </div>
    </nav>
    
    <section class="hero">
        <div class="hero-content">
            <h1 class="hero-title">${hackathon?.title || 'هاكاثون الابتكار'}</h1>
            <p class="hero-subtitle">${hackathon?.description || 'انضم إلينا في رحلة الإبداع والابتكار'}</p>
            <div class="hero-buttons">
                <button class="btn-primary" onclick="register()">سجل الآن</button>
                <button class="btn-secondary" onclick="scrollToDetails()">اعرف المزيد</button>
            </div>
        </div>
        <div class="hero-image">
            <div class="floating-card">💡</div>
            <div class="floating-card">🎯</div>
            <div class="floating-card">⚡</div>
        </div>
    </section>
    
    <section id="details" class="details">
        <div class="container">
            <h2>تفاصيل الهاكاثون</h2>
            <div class="details-grid">
                <div class="detail-card">
                    <div class="detail-icon">📅</div>
                    <h3>التاريخ</h3>
                    <p>${hackathon?.startDate ? new Date(hackathon.startDate).toLocaleDateString('ar-SA') : 'قريباً'}</p>
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
    </section>
</body>
</html>`,
        css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
}

.navbar {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    z-index: 1000;
    padding: 1rem 0;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #01645e;
}

.register-btn {
    background: #01645e;
    color: white;
    border: none;
    padding: 0.5rem 1.5rem;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.register-btn:hover {
    background: #014a45;
    transform: translateY(-2px);
}

.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0 2rem;
}

.hero-content {
    flex: 1;
    max-width: 600px;
}

.hero-title {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    animation: fadeInUp 1s ease;
}

.hero-subtitle {
    font-size: 1.3rem;
    margin-bottom: 2rem;
    opacity: 0.9;
    animation: fadeInUp 1s ease 0.2s both;
}

.hero-buttons {
    display: flex;
    gap: 1rem;
    animation: fadeInUp 1s ease 0.4s both;
}

.btn-primary, .btn-secondary {
    padding: 1rem 2rem;
    border: none;
    border-radius: 50px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary {
    background: #ff6b6b;
    color: white;
}

.btn-secondary {
    background: transparent;
    color: white;
    border: 2px solid white;
}

.btn-primary:hover {
    background: #ff5252;
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(255, 107, 107, 0.3);
}

.btn-secondary:hover {
    background: white;
    color: #667eea;
}

.hero-image {
    flex: 1;
    position: relative;
    height: 400px;
}

.floating-card {
    position: absolute;
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    animation: float 3s ease-in-out infinite;
}

.floating-card:nth-child(1) {
    top: 20%;
    right: 20%;
    animation-delay: 0s;
}

.floating-card:nth-child(2) {
    top: 50%;
    right: 60%;
    animation-delay: 1s;
}

.floating-card:nth-child(3) {
    top: 70%;
    right: 30%;
    animation-delay: 2s;
}

.details {
    padding: 5rem 0;
    background: #f8f9fa;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
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
    color: #01645e;
}

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

@keyframes float {
    0%, 100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-20px);
    }
}

@media (max-width: 768px) {
    .hero {
        flex-direction: column;
        text-align: center;
    }
    
    .hero-title {
        font-size: 2.5rem;
    }
    
    .hero-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .details-grid {
        grid-template-columns: 1fr;
    }
}`,
        js: `function register() {
    window.location.href = '/hackathons/${resolvedParams.id}/register-form';
}

function scrollToDetails() {
    document.getElementById('details').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Add smooth scrolling and animations
document.addEventListener('DOMContentLoaded', function() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all detail cards
    document.querySelectorAll('.detail-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});`
      }
    }

    const template = templates[templateName as keyof typeof templates]
    if (template) {
      setLandingPage(prev => ({
        ...prev,
        htmlContent: template.html,
        cssContent: template.css,
        jsContent: template.js,
        template: templateName
      }))
    }
  }

  const generatePreview = () => {
    const fullHtml = `
      ${landingPage.htmlContent}
      <style>${landingPage.cssContent}</style>
      <script>${landingPage.jsContent}</script>
    `
    return fullHtml
  }

  if (!hackathon) {
    return <div className="p-6">جاري التحميل...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Landing Page - {hackathon.title}
              </h1>
              <p className="text-gray-600">
                صمم صفحة هبوط مخصصة لهاكاثونك
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={landingPage.isEnabled}
                  onCheckedChange={(checked) => 
                    setLandingPage(prev => ({ ...prev, isEnabled: checked }))
                  }
                />
                <span className="text-sm">تفعيل الصفحة</span>
              </div>
              {landingPage.isEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/api/landing/${resolvedParams.id}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  معاينة مباشرة
                </Button>
              )}
              <Button onClick={saveLandingPage} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  إعدادات الصفحة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    اختر قالب جاهز
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={landingPage.template === 'blank' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => loadTemplate('blank')}
                    >
                      بسيط
                    </Button>
                    <Button
                      variant={landingPage.template === 'modern' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => loadTemplate('modern')}
                    >
                      عصري
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    عنوان SEO
                  </label>
                  <Input
                    value={landingPage.seoTitle || ''}
                    onChange={(e) => setLandingPage(prev => ({ 
                      ...prev, 
                      seoTitle: e.target.value 
                    }))}
                    placeholder="عنوان الصفحة في محركات البحث"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    وصف SEO
                  </label>
                  <Textarea
                    value={landingPage.seoDescription || ''}
                    onChange={(e) => setLandingPage(prev => ({ 
                      ...prev, 
                      seoDescription: e.target.value 
                    }))}
                    placeholder="وصف الصفحة في محركات البحث"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    نطاق مخصص (اختياري)
                  </label>
                  <Input
                    value={landingPage.customDomain || ''}
                    onChange={(e) => setLandingPage(prev => ({ 
                      ...prev, 
                      customDomain: e.target.value 
                    }))}
                    placeholder="hackathon.example.com"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Code Editor */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="html" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
                <TabsTrigger value="js">JavaScript</TabsTrigger>
                <TabsTrigger value="preview">
                  <Eye className="w-4 h-4 mr-2" />
                  معاينة
                </TabsTrigger>
              </TabsList>

              <TabsContent value="html" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      HTML
                    </CardTitle>
                    <CardDescription>
                      اكتب كود HTML للصفحة. يمكنك استخدام أي مكتبات خارجية.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={landingPage.htmlContent}
                      onChange={(e) => setLandingPage(prev => ({ 
                        ...prev, 
                        htmlContent: e.target.value 
                      }))}
                      className="font-mono text-sm min-h-[400px]"
                      placeholder="اكتب كود HTML هنا..."
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="css" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>CSS</CardTitle>
                    <CardDescription>
                      أضف التنسيقات والستايل للصفحة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={landingPage.cssContent}
                      onChange={(e) => setLandingPage(prev => ({ 
                        ...prev, 
                        cssContent: e.target.value 
                      }))}
                      className="font-mono text-sm min-h-[400px]"
                      placeholder="اكتب كود CSS هنا..."
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="js" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>JavaScript</CardTitle>
                    <CardDescription>
                      أضف التفاعل والوظائف للصفحة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={landingPage.jsContent}
                      onChange={(e) => setLandingPage(prev => ({ 
                        ...prev, 
                        jsContent: e.target.value 
                      }))}
                      className="font-mono text-sm min-h-[400px]"
                      placeholder="اكتب كود JavaScript هنا..."
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>معاينة الصفحة</CardTitle>
                    <CardDescription>
                      شاهد كيف ستبدو الصفحة للزوار
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        srcDoc={generatePreview()}
                        className="w-full h-[600px]"
                        title="Landing Page Preview"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
