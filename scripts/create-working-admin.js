const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createWorkingAdmin() {
  try {
    console.log("🚀 Creating working admin user...");

    // Check database connection
    await prisma.$connect();
    console.log("✅ Database connected");

    // Delete any existing admin users to avoid conflicts
    console.log("🧹 Cleaning existing admin users...");
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: "admin@hackathon.com" },
          { email: "admin@hackathon.gov.sa" },
          { role: "admin" },
        ],
      },
    });

    // Create new admin with bcrypt hashing (matching the login system)
    console.log("👤 Creating new admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 12);

    const admin = await prisma.user.create({
      data: {
        name: "مدير النظام",
        email: "admin@hackathon.com",
        password: hashedPassword, // Using password field as defined in schema
        phone: "+966500000000",
        city: "الرياض",
        nationality: "سعودي",
        role: "admin",
        isActive: true,
        emailVerified: true,
        preferredRole: "مدير النظام",
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@hackathon.com");
    console.log("🔑 Password: admin123");
    console.log("🆔 ID:", admin.id);
    console.log("🔐 Password Hash:", hashedPassword.substring(0, 20) + "...");

    // Test the password hash
    const testPassword = await bcrypt.compare("admin123", hashedPassword);
    console.log("🧪 Password test:", testPassword ? "✅ PASS" : "❌ FAIL");

    // Create admin record in admins table
    try {
      await prisma.admin.create({
        data: {
          userId: admin.id,
          hackathonId: null, // Super admin
          permissions: {
            canManageHackathons: true,
            canManageUsers: true,
            canManageJudges: true,
            canViewReports: true,
            canManageSettings: true,
          },
          role: "super_admin",
          isActive: true,
        },
      });
      console.log("✅ Admin permissions created");
    } catch (adminError) {
      console.log(
        "⚠️ Admin permissions creation failed (table might not exist):",
        adminError.message
      );
    }

    console.log("\n🎉 Admin creation completed!");
    console.log("\n🔗 Login URL: http://localhost:3000/login");
    console.log("📧 Email: admin@hackathon.com");
    console.log("🔑 Password: admin123");
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    console.error("Full error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createWorkingAdmin();
