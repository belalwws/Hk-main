// Test script to verify deployment readiness
console.log('🚀 Testing deployment readiness...');

// Check environment variables
console.log('📋 Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('- APP_URL:', process.env.APP_URL || 'Not set');
console.log('- NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'Not set');

// Test URL construction
const baseUrl = process.env.NODE_ENV === 'production' 
  ? (process.env.APP_URL || process.env.NEXTAUTH_URL || 'https://hackathon-platform.onrender.com')
  : 'http://localhost:3000';

console.log('🔗 Base URL will be:', baseUrl);

// Test redirect URL construction
const testHackathonId = 'test-hackathon-123';
const redirectUrl = new URL(`/hackathons/${testHackathonId}/register-form`, baseUrl);
console.log('🔄 Redirect URL example:', redirectUrl.toString());

console.log('✅ Deployment test completed');
