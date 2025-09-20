const { PrismaClient } = require('@prisma/client');
process.env.DATABASE_URL = 'file:./dev.db';
const prisma = new PrismaClient();

async function testFormDesignAPI() {
  try {
    const hackathonId = 'cmfrav55o0001fd8wu0hasq8s';
    console.log('🔍 Testing form design API for:', hackathonId);
    
    // Test table creation
    console.log('📊 Step 1: Ensuring form design table...');
    try {
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
      `;
      console.log('✅ Form design table ensured');
    } catch (error) {
      console.log('ℹ️ Form design table already exists or error:', error.message);
    }
    
    // Test fetching form design
    console.log('📊 Step 2: Fetching form design...');
    const design = await prisma.$queryRaw`
      SELECT * FROM hackathon_form_designs 
      WHERE hackathonId = ${hackathonId}
    `;
    
    console.log('📊 Found designs:', design.length);
    
    if (design.length === 0) {
      console.log('⚠️ No form design found, this is normal for first time');
      
      // Test creating a default design
      console.log('📊 Step 3: Creating default design...');
      const newId = `form_design_${Date.now()}`;
      const defaultSettings = JSON.stringify({
        theme: 'modern',
        backgroundColor: '#f8f9fa',
        primaryColor: '#01645e',
        secondaryColor: '#667eea',
        fontFamily: 'Cairo',
        borderRadius: '12px',
        showHackathonInfo: true,
        showProgressBar: true,
        enableAnimations: true
      });
      
      await prisma.$executeRaw`
        INSERT INTO hackathon_form_designs 
        (id, hackathonId, isEnabled, template, htmlContent, cssContent, jsContent, settings)
        VALUES (${newId}, ${hackathonId}, ${false}, ${'modern'}, 
                ${'<h1>Test Form</h1>'}, ${'body { font-family: Arial; }'}, ${'console.log("test");'}, ${defaultSettings})
      `;
      
      console.log('✅ Default design created with ID:', newId);
    } else {
      console.log('✅ Found existing design:', {
        id: design[0].id,
        enabled: design[0].isEnabled,
        template: design[0].template
      });
    }
    
    // Test hackathon exists
    console.log('📊 Step 4: Checking hackathon exists...');
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    });
    
    if (hackathon) {
      console.log('✅ Hackathon found:', hackathon.title);
    } else {
      console.log('❌ Hackathon not found!');
    }
    
    console.log('🎉 Form design API should work now!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testFormDesignAPI();
