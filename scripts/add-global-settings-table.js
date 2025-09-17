#!/usr/bin/env node

/**
 * Add GlobalSettings table to database
 */

const { PrismaClient } = require('@prisma/client')

async function addGlobalSettingsTable() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔧 Adding GlobalSettings table...')
    
    // Check if table already exists by trying to query it
    try {
      await prisma.globalSettings.findFirst()
      console.log('✅ GlobalSettings table already exists')
      return
    } catch (error) {
      // Table doesn't exist, we need to create it
      console.log('📝 GlobalSettings table does not exist, creating...')
    }
    
    // For SQLite, we need to create the table manually
    if (process.env.NODE_ENV !== 'production') {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "global_settings" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "key" TEXT NOT NULL UNIQUE,
          "value" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log('✅ GlobalSettings table created successfully (SQLite)')
    } else {
      // For PostgreSQL in production
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "global_settings" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "key" TEXT NOT NULL UNIQUE,
          "value" JSONB NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log('✅ GlobalSettings table created successfully (PostgreSQL)')
    }
    
    // Test the table
    const testRecord = await prisma.globalSettings.create({
      data: {
        key: 'test_key',
        value: { test: 'value' }
      }
    })
    
    await prisma.globalSettings.delete({
      where: { id: testRecord.id }
    })
    
    console.log('✅ GlobalSettings table is working correctly')
    
  } catch (error) {
    console.error('❌ Error adding GlobalSettings table:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  addGlobalSettingsTable()
    .then(() => {
      console.log('🎉 GlobalSettings table setup completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Failed to setup GlobalSettings table:', error)
      process.exit(1)
    })
}

module.exports = { addGlobalSettingsTable }
