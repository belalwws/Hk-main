const { PrismaClient } = require('@prisma/client');
process.env.DATABASE_URL = 'file:./dev.db';
const prisma = new PrismaClient();

async function createTable() {
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
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Form design table created successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTable();
