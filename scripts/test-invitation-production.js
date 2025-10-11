const https = require('https');

async function testInvitationEndpoint() {
  console.log('🧪 Testing supervisor invitation endpoint in production...');
  
  const testUrl = 'https://hackathon-platform-601l.onrender.com/api/supervisor/accept-invitation?token=test-token-123';
  
  console.log('🔗 Testing URL:', testUrl);
  
  try {
    const response = await fetch(testUrl);
    console.log('📊 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 200 || response.status === 400 || response.status === 404) {
      const data = await response.json();
      console.log('✅ API Response (JSON):', data);
      
      if (data.error && data.error.includes('رابط الدعوة غير صالح')) {
        console.log('🎉 SUCCESS: Invitation endpoint is working correctly!');
        console.log('✅ The endpoint is accessible without authentication');
        return true;
      } else {
        console.log('⚠️  Unexpected response content');
        return false;
      }
    } else if (response.status === 401) {
      console.log('❌ FAILED: Endpoint requires authentication (401)');
      console.log('🔧 This means middleware is still blocking the request');
      return false;
    } else if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('location');
      console.log('❌ FAILED: Redirect detected to:', location);
      if (location && location.includes('/login')) {
        console.log('🔧 This means middleware is redirecting to login page');
      }
      return false;
    } else {
      console.log('❌ FAILED: Unexpected status code');
      const text = await response.text();
      console.log('📄 Response body:', text);
      return false;
    }
  } catch (error) {
    console.error('❌ FAILED: Network error:', error.message);
    return false;
  }
}

async function testInvitationPage() {
  console.log('\n🧪 Testing invitation page in production...');

  const testUrl = 'https://hackathon-platform-601l.onrender.com/invitation/test-token-123';

  console.log('🔗 Testing URL:', testUrl);
  
  try {
    const response = await fetch(testUrl);
    console.log('📊 Response status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ SUCCESS: Invitation page is accessible!');
      console.log('🎉 The page loads without redirect to login');
      return true;
    } else if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('location');
      console.log('❌ FAILED: Redirect detected to:', location);
      if (location && location.includes('/login')) {
        console.log('🔧 This means middleware is redirecting to login page');
      }
      return false;
    } else {
      console.log('❌ FAILED: Unexpected status code');
      return false;
    }
  } catch (error) {
    console.error('❌ FAILED: Network error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting production invitation tests...\n');
  
  const apiTest = await testInvitationEndpoint();
  const pageTest = await testInvitationPage();
  
  console.log('\n📋 Test Results Summary:');
  console.log('API Endpoint:', apiTest ? '✅ PASS' : '❌ FAIL');
  console.log('Invitation Page:', pageTest ? '✅ PASS' : '❌ FAIL');
  
  if (apiTest && pageTest) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Supervisor invitation system is working correctly in production');
  } else {
    console.log('\n❌ SOME TESTS FAILED!');
    console.log('🔧 Check middleware configuration and redeploy if needed');
  }
  
  return apiTest && pageTest;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { testInvitationEndpoint, testInvitationPage, runTests };
