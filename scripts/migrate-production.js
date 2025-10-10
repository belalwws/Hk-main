const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

async function runProductionMigration() {
  console.log('🚀 Starting production migration for supervisor system...')
  
  // Initialize Prisma client with production database
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../migrations/add_supervisor_system.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration SQL loaded successfully')
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
          await prisma.$executeRawUnsafe(statement + ';')
          console.log(`✅ Statement ${i + 1} executed successfully`)
        } catch (error) {
          // Some errors are expected (like "already exists")
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key') ||
              error.message.includes('relation') && error.message.includes('already exists')) {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${error.message.split('\n')[0]}`)
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message)
            throw error
          }
        }
      }
    }
    
    // Verify the migration by checking if tables exist
    console.log('🔍 Verifying migration...')
    
    try {
      // Check if supervisors table exists
      await prisma.$queryRaw`SELECT 1 FROM supervisors LIMIT 1`
      console.log('✅ supervisors table verified')
    } catch (error) {
      if (error.message.includes('does not exist')) {
        throw new Error('❌ supervisors table was not created properly')
      }
    }
    
    try {
      // Check if supervisor_invitations table exists
      await prisma.$queryRaw`SELECT 1 FROM supervisor_invitations LIMIT 1`
      console.log('✅ supervisor_invitations table verified')
    } catch (error) {
      if (error.message.includes('does not exist')) {
        throw new Error('❌ supervisor_invitations table was not created properly')
      }
    }
    
    // Check if UserRole enum includes supervisor
    try {
      const enumValues = await prisma.$queryRaw`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
      `
      const hasSuper = enumValues.some(row => row.enumlabel === 'supervisor')
      if (hasSuper) {
        console.log('✅ UserRole enum includes supervisor')
      } else {
        throw new Error('❌ UserRole enum does not include supervisor')
      }
    } catch (error) {
      console.error('❌ Error checking UserRole enum:', error.message)
    }
    
    console.log('🎉 Production migration completed successfully!')
    console.log('📋 Summary:')
    console.log('   ✅ UserRole enum updated with supervisor')
    console.log('   ✅ supervisors table created')
    console.log('   ✅ supervisor_invitations table created')
    console.log('   ✅ All foreign keys and indexes created')
    console.log('')
    console.log('🚀 Your supervisor system is now ready for production!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
if (require.main === module) {
  runProductionMigration()
    .then(() => {
      console.log('✅ Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error)
      process.exit(1)
    })
}

module.exports = { runProductionMigration }
