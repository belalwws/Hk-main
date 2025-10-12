// 🔍 Supervisor Authentication Debug Script
// Copy and paste this in Browser Console (F12) to diagnose auth issues

console.log('🚀 Starting Supervisor Auth Diagnosis...\n');

// 1. Check localStorage
console.log('📱 LocalStorage Check:');
const authUser = localStorage.getItem('auth-user');
const lastVerified = localStorage.getItem('auth-last-verified');

if (authUser) {
  try {
    const user = JSON.parse(authUser);
    console.log('✅ Auth User Found:', user.email, 'Role:', user.role);
    console.log('📅 Last Verified:', new Date(parseInt(lastVerified || '0')).toLocaleString());
    
    const now = Date.now();
    const timeDiff = now - parseInt(lastVerified || '0');
    console.log('⏰ Time since last verification:', Math.round(timeDiff / 1000 / 60), 'minutes');
  } catch (e) {
    console.log('❌ Invalid auth user data in localStorage');
  }
} else {
  console.log('❌ No auth user in localStorage');
}

// 2. Check sessionStorage
console.log('\n📱 SessionStorage Check:');
const loginRedirected = sessionStorage.getItem('login-redirected');
console.log('🔀 Login Redirected Flag:', loginRedirected);

// 3. Check cookies
console.log('\n🍪 Cookies Check:');
const cookies = document.cookie.split(';').reduce((acc, cookie) => {
  const [name, value] = cookie.trim().split('=');
  acc[name] = value;
  return acc;
}, {});

if (cookies['auth-token']) {
  console.log('✅ Auth Token Cookie Found, length:', cookies['auth-token'].length);
  console.log('🔑 First 20 chars:', cookies['auth-token'].substring(0, 20) + '...');
} else {
  console.log('❌ No auth-token cookie found');
}

// 4. Test API endpoints
console.log('\n🌐 API Endpoints Test:');

// Test verify-session
fetch('/api/verify-session', {
  method: 'GET',
  credentials: 'include'
})
.then(response => {
  console.log('📡 /api/verify-session Status:', response.status);
  return response.json();
})
.then(data => {
  if (data.user) {
    console.log('✅ Verify Session Success:', data.user.email, 'Role:', data.user.role);
  } else {
    console.log('❌ Verify Session Failed:', data.error);
  }
})
.catch(error => {
  console.log('❌ Verify Session Error:', error.message);
});

// Test supervisor dashboard API
fetch('/api/supervisor/dashboard', {
  method: 'GET',
  credentials: 'include'
})
.then(response => {
  console.log('📡 /api/supervisor/dashboard Status:', response.status);
  return response.json();
})
.then(data => {
  if (data.supervisor) {
    console.log('✅ Dashboard API Success:', data.supervisor.name);
  } else {
    console.log('❌ Dashboard API Failed:', data.error);
  }
})
.catch(error => {
  console.log('❌ Dashboard API Error:', error.message);
});

// 5. Check current page
console.log('\n📍 Current Page Info:');
console.log('🌐 URL:', window.location.href);
console.log('📄 Pathname:', window.location.pathname);
console.log('🔍 Search Params:', window.location.search);

// 6. Check if we're in a redirect loop
console.log('\n🔄 Redirect Loop Detection:');
let redirectCount = parseInt(sessionStorage.getItem('redirect-count') || '0');
redirectCount++;
sessionStorage.setItem('redirect-count', redirectCount.toString());

if (redirectCount > 5) {
  console.log('🚨 REDIRECT LOOP DETECTED! Count:', redirectCount);
  console.log('💡 Clearing redirect flags...');
  sessionStorage.removeItem('login-redirected');
  sessionStorage.removeItem('redirect-count');
} else {
  console.log('✅ Redirect count:', redirectCount, '(normal)');
}

// 7. Recommendations
console.log('\n💡 Recommendations:');
if (!authUser) {
  console.log('1. ❌ No user in localStorage - try logging in again');
}
if (!cookies['auth-token']) {
  console.log('2. ❌ No auth cookie - check if login is setting cookies properly');
}
if (redirectCount > 3) {
  console.log('3. ⚠️ Multiple redirects detected - clear browser cache and try again');
}

console.log('\n✅ Diagnosis Complete! Check the results above.');

// Clear redirect count after a delay
setTimeout(() => {
  sessionStorage.removeItem('redirect-count');
}, 30000);
