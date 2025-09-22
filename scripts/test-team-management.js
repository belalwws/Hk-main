/**
 * Test script for team management features
 * Run this script to test the new team management APIs
 */

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

// Test data - replace with actual IDs from your database
const TEST_DATA = {
  hackathonId: 'test-hackathon-id',
  teamId1: 'test-team-1-id',
  teamId2: 'test-team-2-id',
  participantId: 'test-participant-id'
}

/**
 * Test removing a member from a team
 */
async function testRemoveMember() {
  console.log('🧪 Testing: Remove member from team...')
  
  try {
    const response = await fetch(
      `${BASE_URL}/api/admin/hackathons/${TEST_DATA.hackathonId}/teams/${TEST_DATA.teamId1}/members/${TEST_DATA.participantId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Remove member test passed:', result.message)
    } else {
      console.log('❌ Remove member test failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Remove member test error:', error.message)
  }
}

/**
 * Test moving a member between teams
 */
async function testMoveMember() {
  console.log('🧪 Testing: Move member between teams...')
  
  try {
    const response = await fetch(
      `${BASE_URL}/api/admin/hackathons/${TEST_DATA.hackathonId}/teams/${TEST_DATA.teamId1}/members/${TEST_DATA.participantId}/move`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetTeamId: TEST_DATA.teamId2
        })
      }
    )

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Move member test passed:', result.message)
    } else {
      console.log('❌ Move member test failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Move member test error:', error.message)
  }
}

/**
 * Test fetching teams data
 */
async function testFetchTeams() {
  console.log('🧪 Testing: Fetch teams data...')
  
  try {
    const response = await fetch(
      `${BASE_URL}/api/admin/hackathons/${TEST_DATA.hackathonId}/teams`
    )

    const result = await response.json()
    
    if (response.ok && result.teams) {
      console.log('✅ Fetch teams test passed')
      console.log(`📊 Found ${result.teams.length} teams`)
      
      result.teams.forEach((team, index) => {
        console.log(`   Team ${index + 1}: ${team.name} (${team.members.length} members)`)
      })
    } else {
      console.log('❌ Fetch teams test failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Fetch teams test error:', error.message)
  }
}

/**
 * Test sending team emails
 */
async function testSendTeamEmails() {
  console.log('🧪 Testing: Send team emails...')
  
  try {
    const response = await fetch(
      `${BASE_URL}/api/admin/hackathons/${TEST_DATA.hackathonId}/teams/${TEST_DATA.teamId1}/send-emails`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Send emails test passed')
      console.log(`📧 Emails sent: ${result.emailsSent}`)
      console.log(`❌ Emails failed: ${result.emailsFailed}`)
    } else {
      console.log('❌ Send emails test failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Send emails test error:', error.message)
  }
}

/**
 * Validate test data
 */
function validateTestData() {
  const required = ['hackathonId', 'teamId1', 'teamId2', 'participantId']
  const missing = required.filter(key => !TEST_DATA[key] || TEST_DATA[key].startsWith('test-'))
  
  if (missing.length > 0) {
    console.log('⚠️  Warning: Test data contains placeholder values:')
    missing.forEach(key => {
      console.log(`   - ${key}: ${TEST_DATA[key]}`)
    })
    console.log('   Please update TEST_DATA with actual IDs from your database')
    return false
  }
  
  return true
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Team Management Tests...')
  console.log('=' .repeat(50))
  
  if (!validateTestData()) {
    console.log('\n❌ Please update test data before running tests')
    return
  }
  
  // Test 1: Fetch teams
  await testFetchTeams()
  console.log('')
  
  // Test 2: Send team emails
  await testSendTeamEmails()
  console.log('')
  
  // Test 3: Move member (comment out if you don't want to actually move)
  // await testMoveMember()
  // console.log('')
  
  // Test 4: Remove member (comment out if you don't want to actually remove)
  // await testRemoveMember()
  // console.log('')
  
  console.log('=' .repeat(50))
  console.log('🏁 Tests completed!')
}

/**
 * Manual test instructions
 */
function showManualTestInstructions() {
  console.log('📋 Manual Testing Instructions:')
  console.log('')
  console.log('1. Open the admin panel in your browser')
  console.log('2. Navigate to a hackathon with existing teams')
  console.log('3. Test the following features:')
  console.log('')
  console.log('   🖱️  Drag and Drop:')
  console.log('      - Drag a member from one team')
  console.log('      - Drop them on another team')
  console.log('      - Confirm the move in the dialog')
  console.log('')
  console.log('   🔄 Manual Move:')
  console.log('      - Hover over a team member')
  console.log('      - Click the blue arrow button (⇄)')
  console.log('      - Select target team from dropdown')
  console.log('      - Click "نقل العضو"')
  console.log('')
  console.log('   🗑️  Remove Member:')
  console.log('      - Hover over a team member')
  console.log('      - Click the red trash button (🗑️)')
  console.log('      - Confirm removal in the dialog')
  console.log('')
  console.log('   📧 Email Notifications:')
  console.log('      - Check email inboxes for notifications')
  console.log('      - Verify email content and formatting')
  console.log('')
  console.log('4. Verify that:')
  console.log('   - Teams update immediately after operations')
  console.log('   - Email notifications are sent')
  console.log('   - No errors appear in browser console')
  console.log('   - Database is updated correctly')
}

// Run tests if this script is executed directly
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.includes('--manual')) {
    showManualTestInstructions()
  } else {
    runAllTests().catch(console.error)
  }
}

module.exports = {
  testRemoveMember,
  testMoveMember,
  testFetchTeams,
  testSendTeamEmails,
  runAllTests,
  showManualTestInstructions
}
