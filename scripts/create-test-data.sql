-- إنشاء هاكاثون جديد
INSERT INTO hackathons (id, title, description, "startDate", "endDate", "registrationDeadline", "maxParticipants", status, requirements, "createdBy", "createdAt", "updatedAt")
VALUES (
  'hackathon_test_2025',
  'هاكاثون تطوير التطبيقات المبتكرة 2025',
  'مسابقة لتطوير تطبيقات مبتكرة تخدم المجتمع السعودي وتحل مشاكل حقيقية',
  '2025-02-15 09:00:00',
  '2025-02-17 18:00:00',
  '2025-02-10 23:59:59',
  100,
  'open',
  'خبرة في البرمجة، العمل الجماعي، الإبداع',
  'admin_user_id',
  NOW(),
  NOW()
);

-- إنشاء المستخدمين والمشاركين
INSERT INTO users (id, name, email, "password_hash", phone, city, nationality, role, "createdAt", "updatedAt")
VALUES 
  ('user_001', 'أحمد محمد العلي', 'ahmed.ali@test.com', '$2a$10$example.hash.here', '+966501234567', 'الرياض', 'سعودي', 'participant', NOW(), NOW()),
  ('user_002', 'فاطمة عبدالله الزهراني', 'fatima.zahrani@test.com', '$2a$10$example.hash.here', '+966502345678', 'جدة', 'سعودية', 'participant', NOW(), NOW()),
  ('user_003', 'محمد سعد القحطاني', 'mohammed.qahtani@test.com', '$2a$10$example.hash.here', '+966503456789', 'الدمام', 'سعودي', 'participant', NOW(), NOW()),
  ('user_004', 'نورا خالد الشمري', 'nora.shamri@test.com', '$2a$10$example.hash.here', '+966504567890', 'الرياض', 'سعودية', 'participant', NOW(), NOW()),
  ('user_005', 'عبدالرحمن أحمد الغامدي', 'abdulrahman.ghamdi@test.com', '$2a$10$example.hash.here', '+966505678901', 'الطائف', 'سعودي', 'participant', NOW(), NOW()),
  ('user_006', 'سارة عمر البقمي', 'sara.baqami@test.com', '$2a$10$example.hash.here', '+966506789012', 'مكة المكرمة', 'سعودية', 'participant', NOW(), NOW()),
  ('user_007', 'يوسف علي الحربي', 'youssef.harbi@test.com', '$2a$10$example.hash.here', '+966507890123', 'المدينة المنورة', 'سعودي', 'participant', NOW(), NOW()),
  ('user_008', 'ريم محمد العتيبي', 'reem.otaibi@test.com', '$2a$10$example.hash.here', '+966508901234', 'جدة', 'سعودية', 'participant', NOW(), NOW()),
  ('user_009', 'خالد عبدالعزيز الدوسري', 'khalid.dosari@test.com', '$2a$10$example.hash.here', '+966509012345', 'الخبر', 'سعودي', 'participant', NOW(), NOW()),
  ('user_010', 'هند سالم الشهري', 'hind.shahri@test.com', '$2a$10$example.hash.here', '+966500123456', 'أبها', 'سعودية', 'participant', NOW(), NOW()),
  ('user_011', 'عمر فهد المطيري', 'omar.mutairi@test.com', '$2a$10$example.hash.here', '+966501234568', 'حائل', 'سعودي', 'participant', NOW(), NOW()),
  ('user_012', 'لينا أحمد الجهني', 'lina.juhani@test.com', '$2a$10$example.hash.here', '+966502345679', 'ينبع', 'سعودية', 'participant', NOW(), NOW()),
  ('user_013', 'سلطان عبدالله الرشيد', 'sultan.rashid@test.com', '$2a$10$example.hash.here', '+966503456780', 'بريدة', 'سعودي', 'participant', NOW(), NOW()),
  ('user_014', 'مريم خالد العنزي', 'mariam.anzi@test.com', '$2a$10$example.hash.here', '+966504567891', 'تبوك', 'سعودية', 'participant', NOW(), NOW()),
  ('user_015', 'بندر سعود الفيصل', 'bandar.faisal@test.com', '$2a$10$example.hash.here', '+966505678902', 'الجوف', 'سعودي', 'participant', NOW(), NOW());

-- إنشاء المشاركات
INSERT INTO participants (id, "userId", "hackathonId", status, "registeredAt", "createdAt", "updatedAt")
VALUES 
  ('part_001', 'user_001', 'hackathon_test_2025', 'pending', NOW(), NOW(), NOW()),
  ('part_002', 'user_002', 'hackathon_test_2025', 'pending', NOW(), NOW(), NOW()),
  ('part_003', 'user_003', 'hackathon_test_2025', 'pending', NOW(), NOW(), NOW()),
  ('part_004', 'user_004', 'hackathon_test_2025', 'pending', NOW(), NOW(), NOW()),
  ('part_005', 'user_005', 'hackathon_test_2025', 'pending', NOW(), NOW(), NOW()),
  ('part_006', 'user_006', 'hackathon_test_2025', 'pending', NOW(), NOW(), NOW()),
  ('part_007', 'user_007', 'hackathon_test_2025', 'pending', NOW(), NOW(), NOW()),
  ('part_008', 'user_008', 'hackathon_test_2025', 'pending', NOW(), NOW(), NOW()),
  ('part_009', 'user_009', 'hackathon_test_2025', 'pending', NOW(), NOW(), NOW()),
  ('part_010', 'user_010', 'hackathon_test_2025', 'pending', NOW(), NOW(), NOW()),
  ('part_011', 'user_011', 'hackathon_test_2025', 'pending', NOW(), NOW(), NOW()),
  ('part_012', 'user_012', 'hackathon_test_2025', 'pending', NOW(), NOW(), NOW()),
  ('part_013', 'user_013', 'hackathon_test_2025', 'pending', NOW(), NOW(), NOW()),
  ('part_014', 'user_014', 'hackathon_test_2025', 'pending', NOW(), NOW(), NOW()),
  ('part_015', 'user_015', 'hackathon_test_2025', 'pending', NOW(), NOW(), NOW());
