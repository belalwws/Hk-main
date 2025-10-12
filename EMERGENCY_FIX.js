// 🚨 EMERGENCY FIX - انسخ هذا في Browser Console
// هذا الحل سيصلح المشكلة فوراً

console.log('🚨 تطبيق الإصلاح الطارئ...');

// 1. تنظيف كامل للبيانات
sessionStorage.clear();
console.log('🧹 تم تنظيف sessionStorage');

// 2. التحقق من localStorage والإصلاح
const authUser = localStorage.getItem('auth-user');
if (authUser) {
  try {
    const user = JSON.parse(authUser);
    console.log('✅ المستخدم موجود:', user.email, 'الدور:', user.role);
    
    if (user.role === 'supervisor') {
      console.log('🔧 إصلاح مشكلة المشرف...');
      
      // إجبار إعادة تحميل الصفحة مع تنظيف Cache
      localStorage.setItem('force-supervisor-access', 'true');
      
      // إعادة توجيه مباشر
      window.location.replace('/supervisor/dashboard');
    } else {
      console.log('❌ المستخدم ليس مشرف');
    }
  } catch (e) {
    console.log('❌ بيانات غير صالحة، تنظيف...');
    localStorage.clear();
    window.location.href = '/login';
  }
} else {
  console.log('❌ لا يوجد مستخدم، إعادة تسجيل دخول مطلوبة');
  
  // محاولة تسجيل دخول تلقائي إذا كان هناك cookie
  fetch('/api/verify-session', { credentials: 'include' })
  .then(response => response.json())
  .then(data => {
    if (data.user && data.user.role === 'supervisor') {
      console.log('✅ تم العثور على جلسة صالحة');
      localStorage.setItem('auth-user', JSON.stringify(data.user));
      localStorage.setItem('auth-last-verified', Date.now().toString());
      window.location.replace('/supervisor/dashboard');
    } else {
      console.log('❌ لا توجد جلسة صالحة');
      window.location.href = '/login';
    }
  })
  .catch(error => {
    console.log('❌ خطأ في التحقق من الجلسة:', error);
    window.location.href = '/login';
  });
}

console.log('✅ تم تطبيق الإصلاح الطارئ');
