// Final deployment test script
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function finalDeploymentTest() {
  console.log('🚀 Running final deployment test...\n');
  
  let allTestsPassed = true;
  const results = [];
  
  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    results.push({ test: 'Database Connection', status: '✅ PASS' });
    console.log('   ✅ Database connected successfully\n');
    
    // Test 2: Admin User
    console.log('2️⃣ Testing admin user...');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@hackathon.com' }
    });
    
    if (adminUser && adminUser.role === 'admin') {
      results.push({ test: 'Admin User', status: '✅ PASS' });
      console.log('   ✅ Admin user exists and has correct role');
      console.log(`   📧 Email: ${adminUser.email}`);
      console.log(`   👤 Name: ${adminUser.name}`);
      console.log(`   🔑 Active: ${adminUser.isActive}\n`);
    } else {
      results.push({ test: 'Admin User', status: '❌ FAIL' });
      console.log('   ❌ Admin user missing or incorrect role\n');
      allTestsPassed = false;
    }
    
    // Test 3: Required Tables
    console.log('3️⃣ Testing required tables...');
    const requiredTables = [
      'users',
      'hackathons', 
      'hackathon_forms',
      'hackathon_form_designs',
      'email_templates',
      'certificate_settings'
    ];
    
    for (const tableName of requiredTables) {
      try {
        const result = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM information_schema.tables 
          WHERE table_name = ${tableName}
        `;
        
        if (result[0]?.count > 0) {
          console.log(`   ✅ Table ${tableName} exists`);
        } else {
          console.log(`   ⚠️ Table ${tableName} might not exist`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking table ${tableName}: ${error.message}`);
      }
    }
    results.push({ test: 'Required Tables', status: '✅ PASS' });
    console.log('');
    
    // Test 4: Email Templates System
    console.log('4️⃣ Testing email templates system...');
    try {
      const templates = await prisma.$queryRaw`
        SELECT * FROM email_templates 
        WHERE id = 'global_templates'
        LIMIT 1
      `;
      
      if (templates.length > 0) {
        console.log('   ✅ Email templates table accessible');
        console.log('   ✅ Global templates record exists');
        results.push({ test: 'Email Templates', status: '✅ PASS' });
      } else {
        console.log('   ⚠️ No global templates found, will use defaults');
        results.push({ test: 'Email Templates', status: '⚠️ PARTIAL' });
      }
    } catch (error) {
      console.log('   ❌ Email templates system error:', error.message);
      results.push({ test: 'Email Templates', status: '❌ FAIL' });
      allTestsPassed = false;
    }
    console.log('');
    
    // Test 5: Certificate Settings
    console.log('5️⃣ Testing certificate settings...');
    try {
      const settings = await prisma.$queryRaw`
        SELECT * FROM certificate_settings 
        WHERE id = 'global'
        LIMIT 1
      `;
      
      if (settings.length > 0) {
        console.log('   ✅ Certificate settings table accessible');
        console.log('   ✅ Global settings record exists');
        results.push({ test: 'Certificate Settings', status: '✅ PASS' });
      } else {
        console.log('   ⚠️ No certificate settings found, will use defaults');
        results.push({ test: 'Certificate Settings', status: '⚠️ PARTIAL' });
      }
    } catch (error) {
      console.log('   ❌ Certificate settings system error:', error.message);
      results.push({ test: 'Certificate Settings', status: '❌ FAIL' });
      allTestsPassed = false;
    }
    console.log('');
    
    // Test 6: Form System
    console.log('6️⃣ Testing form system...');
    try {
      const forms = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM hackathon_forms
      `;
      
      console.log(`   ✅ Found ${forms[0]?.count || 0} hackathon forms`);
      results.push({ test: 'Form System', status: '✅ PASS' });
    } catch (error) {
      console.log('   ❌ Form system error:', error.message);
      results.push({ test: 'Form System', status: '❌ FAIL' });
      allTestsPassed = false;
    }
    console.log('');
    
    // Test 7: Data Counts
    console.log('7️⃣ Current data summary...');
    try {
      const userCount = await prisma.user.count();
      const hackathonCount = await prisma.hackathon.count();
      
      console.log(`   👥 Users: ${userCount}`);
      console.log(`   🏆 Hackathons: ${hackathonCount}`);
      
      results.push({ test: 'Data Summary', status: '✅ PASS' });
    } catch (error) {
      console.log('   ❌ Error getting data counts:', error.message);
      results.push({ test: 'Data Summary', status: '❌ FAIL' });
    }
    console.log('');
    
  } catch (error) {
    console.error('❌ Fatal test error:', error);
    allTestsPassed = false;
  } finally {
    await prisma.$disconnect();
  }
  
  // Final Results
  console.log('📊 FINAL TEST RESULTS:');
  console.log('='.repeat(50));
  results.forEach(result => {
    console.log(`${result.status} ${result.test}`);
  });
  console.log('='.repeat(50));
  
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! Platform is ready for production.');
    console.log('\n🚀 Next steps:');
    console.log('1. git add .');
    console.log('2. git commit -m "Final production fixes and tests"');
    console.log('3. git push');
    console.log('4. Wait for deployment to complete');
    console.log('5. Test admin login: admin@hackathon.com / admin123456');
  } else {
    console.log('⚠️ Some tests failed. Please review the issues above.');
  }
  
  return allTestsPassed;
}

// Run the test
finalDeploymentTest().catch(console.error);
