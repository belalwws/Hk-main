// Check the actual structure of hackathon_forms table
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTableStructure() {
  try {
    console.log('🔍 Checking hackathon_forms table structure...');
    
    // Get table info
    const tableInfo = await prisma.$queryRaw`
      PRAGMA table_info(hackathon_forms)
    `;
    
    console.log('📋 Table columns:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    // Check if there are any existing records
    const count = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM hackathon_forms
    `;
    
    console.log(`📊 Total records: ${count[0].count}`);
    
    if (count[0].count > 0) {
      const sample = await prisma.$queryRaw`
        SELECT * FROM hackathon_forms LIMIT 1
      `;
      console.log('📄 Sample record:', sample[0]);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTableStructure();
