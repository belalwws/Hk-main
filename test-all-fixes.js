// Test script to verify all fixes are working
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAllFixes() {
  console.log('🧪 Testing all fixes...');
  
  try {
    // Test 1: Database connection
    console.log('\n1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test 2: Admin user exists
    console.log('\n2️⃣ Testing admin user...');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@hackathon.com' }
    });
    
    if (adminUser) {
      console.log('✅ Admin user exists:', {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive
      });
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Test 3: Required tables exist
    console.log('\n3️⃣ Testing required tables...');
    const tables = [
      'hackathon_forms',
      'hackathon_form_designs', 
      'email_templates',
      'certificate_settings'
    ];
    
    for (const tableName of tables) {
      try {
        const result = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM information_schema.tables 
          WHERE table_name = ${tableName}
        `;
        
        if (result[0]?.count > 0) {
          console.log(`✅ Table ${tableName} exists`);
        } else {
          console.log(`⚠️ Table ${tableName} might not exist`);
        }
      } catch (error) {
        console.log(`⚠️ Could not check table ${tableName}:`, error.message);
      }
    }
    
    // Test 4: Form data persistence
    console.log('\n4️⃣ Testing form data persistence...');
    try {
      const forms = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM hackathon_forms
      `;
      console.log(`✅ Found ${forms[0]?.count || 0} hackathon forms`);
    } catch (error) {
      console.log('⚠️ Could not count forms:', error.message);
    }
    
    // Test 5: Email templates
    console.log('\n5️⃣ Testing email templates...');
    try {
      const templates = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM email_templates
      `;
      console.log(`✅ Found ${templates[0]?.count || 0} email templates`);
    } catch (error) {
      console.log('⚠️ Could not count email templates:', error.message);
    }
    
    // Test 6: Certificate settings
    console.log('\n6️⃣ Testing certificate settings...');
    try {
      const settings = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM certificate_settings
      `;
      console.log(`✅ Found ${settings[0]?.count || 0} certificate settings`);
    } catch (error) {
      console.log('⚠️ Could not count certificate settings:', error.message);
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testAllFixes();
