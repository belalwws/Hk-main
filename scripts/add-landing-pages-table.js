// This script will be run automatically when the API is first called
// No need to run manually - it's integrated into the API endpoints

async function addLandingPagesTable() {
  try {
    // Import prisma dynamically to avoid env issues
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    console.log("🚀 Adding hackathon_landing_pages table...");

    // Create the table using raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS hackathon_landing_pages (
        id TEXT PRIMARY KEY,
        hackathon_id TEXT UNIQUE NOT NULL,
        is_enabled BOOLEAN DEFAULT FALSE,
        custom_domain TEXT,
        html_content TEXT NOT NULL DEFAULT '',
        css_content TEXT NOT NULL DEFAULT '',
        js_content TEXT NOT NULL DEFAULT '',
        seo_title TEXT,
        seo_description TEXT,
        template TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE
      )
    `;

    console.log("✅ hackathon_landing_pages table created successfully!");

    // Add some sample data for testing
    const hackathons = await prisma.hackathon.findMany({
      take: 2,
    });

    if (hackathons.length > 0) {
      console.log("📝 Adding sample landing page...");

      const sampleHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${hackathons[0].title}</title>
</head>
<body>
    <div class="hero">
        <h1>${hackathons[0].title}</h1>
        <p>${
          hackathons[0].description || "انضم إلينا في رحلة الإبداع والابتكار"
        }</p>
        <button onclick="register()" class="register-btn">سجل الآن</button>
    </div>
</body>
</html>`;

      const sampleCss = `body {
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

.hero {
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

.register-btn {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.register-btn:hover {
    background: #ff5252;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}`;

      const sampleJs = `function register() {
    window.location.href = '/hackathons/${hackathons[0].id}/register-form';
}`;

      await prisma.$executeRaw`
        INSERT INTO hackathon_landing_pages (
          id, hackathon_id, is_enabled, html_content, css_content, js_content, 
          seo_title, seo_description, template, created_at, updated_at
        ) VALUES (
          ${`landing_${Date.now()}`},
          ${hackathons[0].id},
          false,
          ${sampleHtml},
          ${sampleCss},
          ${sampleJs},
          ${hackathons[0].title + " - صفحة الهبوط"},
          ${
            hackathons[0].description ||
            "انضم إلينا في هاكاثون الإبداع والابتكار"
          },
          'blank',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        ON CONFLICT (hackathon_id) DO NOTHING
      `;

      console.log("✅ Sample landing page added!");
    }

    console.log("🎉 Landing pages system setup completed!");
    console.log("");
    console.log("📋 Next steps:");
    console.log(
      "1. Go to /admin/hackathons/[id]/landing-page to create custom landing pages"
    );
    console.log("2. Enable landing pages for hackathons");
    console.log(
      "3. Visit /landing/[hackathon-id] to see the custom landing page"
    );
    console.log("");
  } catch (error) {
    console.error("❌ Error setting up landing pages:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addLandingPagesTable();
