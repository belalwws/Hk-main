// Create a test registration form for the hackathon
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestForm() {
  const hackathonId = 'cmfrav55o0001fd8wu0hasq8s';
  
  try {
    console.log('🔍 Creating test registration form...');
    
    // Check if form already exists
    const existingForm = await prisma.hackathonForm.findFirst({
      where: { hackathonId: hackathonId }
    });
    
    if (existingForm) {
      console.log('✅ Form already exists:', existingForm.id);
      return;
    }
    
    // Create a basic registration form
    const formData = {
      hackathonId: hackathonId,
      title: 'نموذج التسجيل',
      description: 'نموذج التسجيل في الهاكاثون',
      isActive: true,
      fields: JSON.stringify([
        {
          id: 'name',
          type: 'text',
          label: 'الاسم الكامل',
          placeholder: 'اكتب اسمك الكامل',
          required: true
        },
        {
          id: 'email',
          type: 'email',
          label: 'البريد الإلكتروني',
          placeholder: 'example@email.com',
          required: true
        },
        {
          id: 'phone',
          type: 'phone',
          label: 'رقم الهاتف',
          placeholder: '+966xxxxxxxxx',
          required: true
        },
        {
          id: 'experience',
          type: 'select',
          label: 'مستوى الخبرة',
          required: true,
          options: ['مبتدئ', 'متوسط', 'متقدم', 'خبير']
        }
      ]),
      settings: JSON.stringify({
        allowMultipleSubmissions: false,
        requireApproval: true,
        sendConfirmationEmail: true
      })
    };
    
    const savedForm = await prisma.hackathonForm.create({
      data: formData
    });
    
    console.log('✅ Registration form created successfully:', savedForm.id);
    
  } catch (error) {
    console.error('❌ Error creating form:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestForm();
