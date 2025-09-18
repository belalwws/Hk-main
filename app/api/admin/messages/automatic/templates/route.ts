import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// GET /api/admin/messages/automatic/templates - Get automatic message templates
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const templates = [
      {
        id: 'user_registration',
        type: 'user_registration',
        name: 'تسجيل مستخدم جديد',
        description: 'رسالة ترحيب للمستخدمين الجدد عند التسجيل في المنصة',
        subject: 'مرحباً بك في منصة الهاكاثونات! 🎉',
        content: `مرحباً {name}،

نرحب بك في منصة الهاكاثونات الرائدة! 

تم إنشاء حسابك بنجاح باستخدام البريد الإلكتروني: {email}

يمكنك الآن:
• تصفح الهاكاثونات المتاحة
• التسجيل في الهاكاثونات التي تهمك
• بناء فريقك والتواصل مع المشاركين الآخرين
• تتبع تقدمك ونتائجك

نتطلع لرؤية إبداعاتك!

فريق منصة الهاكاثونات`,
        isActive: true,
        variables: ['name', 'email', 'loginUrl']
      },
      {
        id: 'hackathon_registration',
        type: 'hackathon_registration',
        name: 'تسجيل في هاكاثون',
        description: 'تأكيد التسجيل في هاكاثون معين',
        subject: 'تم تسجيلك في {hackathonTitle} بنجاح! ✅',
        content: `مرحباً {name}،

تم تسجيلك بنجاح في هاكاثون "{hackathonTitle}"!

تفاصيل التسجيل:
• الاسم: {name}
• البريد الإلكتروني: {email}
• تاريخ التسجيل: {registrationDate}
• نوع المشاركة: {teamType}

ما التالي؟
• انتظر موافقة المنظمين على مشاركتك
• ستصلك رسالة تأكيد عند الموافقة
• تابع تحديثات الهاكاثون على المنصة

بالتوفيق!

فريق {hackathonTitle}`,
        isActive: true,
        variables: ['name', 'email', 'hackathonTitle', 'registrationDate', 'teamType', 'hackathonUrl']
      },
      {
        id: 'registration_approved',
        type: 'registration_approved',
        name: 'قبول المشاركة',
        description: 'إشعار بقبول المشاركة في الهاكاثون',
        subject: '🎉 تم قبول مشاركتك في {hackathonTitle}!',
        content: `تهانينا {name}!

تم قبول مشاركتك في هاكاثون "{hackathonTitle}" بنجاح!

تفاصيل الهاكاثون:
• تاريخ البداية: {startDate}
• تاريخ النهاية: {endDate}
• الموقع: {location}

الخطوات التالية:
• سجل دخولك إلى المنصة لمتابعة التحديثات
• انتظر تكوين الفرق (إذا كنت تشارك في فريق)
• استعد لتجربة رائعة من الإبداع والتعلم!

رابط الهاكاثون: {hackathonUrl}

نتطلع لرؤية إبداعك!

فريق {hackathonTitle}`,
        isActive: true,
        variables: ['name', 'hackathonTitle', 'startDate', 'endDate', 'location', 'hackathonUrl', 'feedback']
      },
      {
        id: 'registration_rejected',
        type: 'registration_rejected',
        name: 'رفض المشاركة',
        description: 'إشعار برفض المشاركة في الهاكاثون',
        subject: 'بخصوص مشاركتك في {hackathonTitle}',
        content: `مرحباً {name}،

نشكرك على اهتمامك بالمشاركة في هاكاثون "{hackathonTitle}".

للأسف، لم نتمكن من قبول مشاركتك في هذا الهاكاثون لأسباب تنظيمية.

{feedback}

لا تيأس! هناك العديد من الهاكاثونات الأخرى المتاحة على المنصة.

نشجعك على:
• تصفح الهاكاثونات الأخرى المتاحة
• التسجيل في الهاكاثونات القادمة
• تطوير مهاراتك استعداداً للفرص القادمة

شكراً لك مرة أخرى على اهتمامك.

فريق منصة الهاكاثونات`,
        isActive: false,
        variables: ['name', 'hackathonTitle', 'feedback', 'alternativeHackathons']
      },
      {
        id: 'team_formation',
        type: 'team_formation',
        name: 'تكوين الفرق',
        description: 'إشعار بتكوين الفريق للمشارك',
        subject: '👥 تم تكوين فريقك في {hackathonTitle}!',
        content: `مرحباً {name}،

تم تكوين فريقك بنجاح في هاكاثون "{hackathonTitle}"!

تفاصيل الفريق:
• اسم الفريق: {teamName}
• رقم الفريق: {teamNumber}
• عدد الأعضاء: {teamMembersCount}

أعضاء الفريق:
{teamMembers}

الخطوات التالية:
• تواصل مع أعضاء فريقك
• ابدأوا في التخطيط لمشروعكم
• تابعوا تحديثات الهاكاثون

رابط الفريق: {teamUrl}

بالتوفيق لكم جميعاً!

فريق {hackathonTitle}`,
        isActive: true,
        variables: ['name', 'hackathonTitle', 'teamName', 'teamNumber', 'teamMembersCount', 'teamMembers', 'teamUrl']
      },
      {
        id: 'evaluation_start',
        type: 'evaluation_start',
        name: 'بداية التقييم',
        description: 'إشعار ببداية مرحلة التقييم',
        subject: '⏰ بدء مرحلة التقييم في {hackathonTitle}',
        content: `مرحباً {name}،

بدأت مرحلة التقييم في هاكاثون "{hackathonTitle}"!

تفاصيل التقييم:
• تاريخ بداية التقييم: {evaluationStartDate}
• تاريخ نهاية التقييم: {evaluationEndDate}
• عدد المحكمين: {judgesCount}

معايير التقييم:
{evaluationCriteria}

تأكد من:
• رفع مشروعك النهائي
• إكمال جميع المتطلبات
• التحضير للعرض التقديمي (إن وجد)

رابط رفع المشروع: {projectSubmissionUrl}

بالتوفيق!

فريق {hackathonTitle}`,
        isActive: true,
        variables: ['name', 'hackathonTitle', 'evaluationStartDate', 'evaluationEndDate', 'judgesCount', 'evaluationCriteria', 'projectSubmissionUrl']
      },
      {
        id: 'certificate_ready',
        type: 'certificate_ready',
        name: 'الشهادة جاهزة',
        description: 'إشعار بجاهزية شهادة المشاركة',
        subject: '🏆 شهادة مشاركتك في {hackathonTitle} جاهزة!',
        content: `تهانينا {name}!

شهادة مشاركتك في هاكاثون "{hackathonTitle}" جاهزة الآن للتحميل!

تفاصيل الشهادة:
• نوع الشهادة: {certificateType}
• تاريخ الإصدار: {issueDate}
{rankInfo}

يمكنك تحميل شهادتك من الرابط التالي:
{certificateUrl}

شكراً لمشاركتك الرائعة!

فريق {hackathonTitle}`,
        isActive: true,
        variables: ['name', 'hackathonTitle', 'certificateType', 'issueDate', 'rankInfo', 'certificateUrl', 'teamName']
      },
      {
        id: 'password_sent',
        type: 'password_sent',
        name: 'إرسال كلمة المرور',
        description: 'إرسال كلمة مرور مؤقتة للمستخدم',
        subject: '🔐 كلمة المرور الخاصة بك',
        content: `مرحباً {name}،

تم إنشاء كلمة مرور مؤقتة لحسابك في منصة الهاكاثونات.

تفاصيل تسجيل الدخول:
• البريد الإلكتروني: {email}
• كلمة المرور المؤقتة: {temporaryPassword}

رابط تسجيل الدخول: {loginUrl}

تعليمات مهمة:
• استخدم كلمة المرور المؤقتة لتسجيل الدخول
• غيّر كلمة المرور فور تسجيل الدخول
• احتفظ بكلمة المرور الجديدة في مكان آمن

إذا واجهت أي مشاكل، تواصل معنا.

فريق منصة الهاكاثونات`,
        isActive: true,
        variables: ['name', 'email', 'temporaryPassword', 'loginUrl', 'passwordInstructions']
      }
    ]

    return NextResponse.json({ templates })

  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
