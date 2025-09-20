// Test script to check if form data is syncing correctly
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFormSync() {
  try {
    console.log('🔍 Testing form data sync...');
    
    const hackathonId = 'cmfry6kbq0000aw1wam6f8prg';
    
    // Check if form exists in database
    const form = await prisma.$queryRaw`
      SELECT * FROM hackathon_forms 
      WHERE hackathonId = ${hackathonId}
      ORDER BY updatedAt DESC
      LIMIT 1
    `;
    
    if (form.length > 0) {
      console.log('✅ Form found in database:');
      console.log('- ID:', form[0].id);
      console.log('- Title:', form[0].title);
      console.log('- Last Updated:', form[0].updatedAt);
      console.log('- Fields Length:', form[0].formFields?.length || 0);
      console.log('- Settings Length:', form[0].settings?.length || 0);
      
      // Try to parse fields
      try {
        const fields = JSON.parse(form[0].formFields || '[]');
        console.log('- Parsed Fields Count:', fields.length);
        if (fields.length > 0) {
          console.log('- First Field:', fields[0]);
        }
      } catch (e) {
        console.log('⚠️ Error parsing fields:', e.message);
      }
    } else {
      console.log('❌ No form found for hackathon:', hackathonId);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testFormSync();
