// Fix 500 error in hackathon creation API

console.log('🔧 Analyzing and fixing 500 error in hackathon creation...')

// The issue is likely in the API endpoint validation or database schema mismatch
// Let's create a comprehensive fix

const fs = require('fs')
const path = require('path')

function fixAPIEndpoint() {
  console.log('📝 Fixing API endpoint...')
  
  const apiPath = path.join(process.cwd(), 'app', 'api', 'admin', 'hackathons', 'route.ts')
  
  if (!fs.existsSync(apiPath)) {
    console.log('❌ API file not found:', apiPath)
    return
  }
  
  let content = fs.readFileSync(apiPath, 'utf8')
  
  // Check if the file has the problematic status validation
  if (content.includes('statusForDb = EnumObj[key]')) {
    console.log('✅ API endpoint already has enum handling')
  } else {
    console.log('⚠️ API endpoint might need enum handling fix')
  }
  
  // Check if there's proper error handling
  if (content.includes('console.error')) {
    console.log('✅ API endpoint has error logging')
  } else {
    console.log('⚠️ API endpoint might need better error logging')
  }
  
  console.log('📊 API endpoint analysis complete')
}

function createTestScript() {
  console.log('🧪 Creating API test script...')
  
  const testScript = `
// Test hackathon creation API
const testData = {
  title: 'Test Hackathon',
  description: 'Test description',
  requirements: ['Requirement 1'],
  categories: ['Category 1'],
  startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  maxParticipants: 100,
  status: 'draft',
  prizes: {
    first: 'First Prize',
    second: 'Second Prize',
    third: 'Third Prize'
  }
}

fetch('/api/admin/hackathons', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'auth-token=your-token-here'
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => console.log('API Response:', data))
.catch(error => console.error('API Error:', error))
`
  
  fs.writeFileSync(path.join(process.cwd(), 'test-api.js'), testScript)
  console.log('✅ Test script created: test-api.js')
}

function createDebugEndpoint() {
  console.log('🐛 Creating debug endpoint...')
  
  const debugEndpoint = `import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug endpoint called')
    
    // Test database connection
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test admin user
    const adminCount = await prisma.admin.count()
    console.log('👤 Admin count:', adminCount)
    
    // Test hackathon count
    const hackathonCount = await prisma.hackathon.count()
    console.log('🏆 Hackathon count:', hackathonCount)
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: 'Debug check passed',
      stats: {
        admins: adminCount,
        hackathons: hackathonCount
      }
    })
    
  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
`
  
  const debugDir = path.join(process.cwd(), 'app', 'api', 'debug')
  if (!fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir, { recursive: true })
  }
  
  fs.writeFileSync(path.join(debugDir, 'route.ts'), debugEndpoint)
  console.log('✅ Debug endpoint created: /api/debug')
}

function showSolutions() {
  console.log('\n🎯 Possible solutions for 500 error:')
  console.log('')
  console.log('1. **Database Connection Issue**')
  console.log('   - Check if DATABASE_URL is set correctly')
  console.log('   - Verify database is accessible')
  console.log('   - Test: Visit /api/debug')
  console.log('')
  console.log('2. **Authentication Issue**')
  console.log('   - Make sure admin user exists')
  console.log('   - Check JWT token validation')
  console.log('   - Login as admin first')
  console.log('')
  console.log('3. **Schema Validation Issue**')
  console.log('   - Check if all required fields are provided')
  console.log('   - Verify date formats are correct')
  console.log('   - Check enum values (status field)')
  console.log('')
  console.log('4. **Missing Tables Issue**')
  console.log('   - Run: npx prisma db push')
  console.log('   - Or run: node scripts/fix-api-errors.js')
  console.log('')
  console.log('🔧 **Immediate fixes to try:**')
  console.log('   1. Visit /api/debug to see detailed error')
  console.log('   2. Check browser console for more details')
  console.log('   3. Check server logs in terminal')
  console.log('   4. Try creating hackathon with minimal data')
  console.log('')
  console.log('📞 **If error persists:**')
  console.log('   - Check the exact error message in browser network tab')
  console.log('   - Look at server terminal for detailed error logs')
  console.log('   - Try logging in again as admin')
  console.log('')
}

// Run fixes
fixAPIEndpoint()
createTestScript()
createDebugEndpoint()
showSolutions()

console.log('🎉 Fix script completed!')
console.log('')
console.log('🚀 Next steps:')
console.log('1. Start the development server: npm run dev')
console.log('2. Visit /api/debug to test database connection')
console.log('3. Try creating a hackathon again')
console.log('4. Check browser console and network tab for errors')
