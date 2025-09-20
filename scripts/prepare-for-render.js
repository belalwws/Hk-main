const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");

async function prepareForRender() {
  console.log("🚀 Preparing project for Render deployment...");

  // 1. Check if we're in production environment
  const isProduction = process.env.NODE_ENV === "production";
  console.log(`🌍 Environment: ${isProduction ? "Production" : "Development"}`);

  // 2. Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.log(
      "⚠️  DATABASE_URL not set - this is normal for local development"
    );
    console.log("   Render will automatically provide this in production");
  } else {
    console.log("✅ DATABASE_URL is configured");
  }

  // 3. Try to connect to database and create admin
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Check if admin exists
    const adminExists = await prisma.user.findFirst({
      where: {
        email: "admin@hackathon.com",
        role: "admin",
      },
    });

    if (!adminExists) {
      console.log("👤 Creating admin user for production...");

      const hashedPassword = await bcrypt.hash("admin123", 12);

      const admin = await prisma.user.create({
        data: {
          name: "مدير النظام",
          email: "admin@hackathon.com",
          password: hashedPassword,
          phone: "+966500000000",
          city: "الرياض",
          nationality: "سعودي",
          role: "admin",
          isActive: true,
          emailVerified: true,
          preferredRole: "مدير النظام",
        },
      });

      console.log("✅ Admin user created for production");
      console.log("📧 Email: admin@hackathon.com");
      console.log("🔑 Password: admin123");
    } else {
      console.log("✅ Admin user already exists");
      console.log("📧 Email:", adminExists.email);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.log(
      "⚠️  Database connection failed (normal in development):",
      error.message
    );
    console.log("   This will work automatically on Render with PostgreSQL");
  }

  // 4. Check essential files
  const essentialFiles = [
    "package.json",
    "schema.prisma",
    "app/layout.tsx",
    "app/page.tsx",
    "app/api/auth/login/route.ts",
    "lib/auth.ts",
    "lib/password.ts",
    "lib/prisma.ts",
  ];

  console.log("\n📋 Checking essential files...");
  essentialFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - MISSING!`);
    }
  });

  // 5. Check package.json scripts
  console.log("\n📦 Checking package.json scripts...");
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

  const requiredScripts = ["build", "start", "postinstall"];
  requiredScripts.forEach((script) => {
    if (packageJson.scripts[script]) {
      console.log(`✅ ${script}: ${packageJson.scripts[script]}`);
    } else {
      console.log(`❌ ${script} - MISSING!`);
    }
  });

  // 6. Environment variables check
  console.log("\n🔧 Environment variables for Render:");
  console.log("Required environment variables:");
  console.log("- DATABASE_URL (automatically provided by Render)");
  console.log("- JWT_SECRET (set this in Render dashboard)");
  console.log("- NEXTAUTH_SECRET (set this in Render dashboard)");
  console.log("- NEXTAUTH_URL (set to your Render app URL)");
  console.log("- NODE_ENV=production (automatically set by Render)");

  // 7. Build command check
  console.log("\n🏗️  Build process:");
  console.log("Render will run:");
  console.log("1. npm ci (install dependencies)");
  console.log("2. npx prisma generate --schema ./schema.prisma");
  console.log(
    "3. npx prisma db push --force-reset=false --schema ./schema.prisma"
  );
  console.log("4. npm run build");

  console.log("\n🎉 Project preparation completed!");
  console.log("\n📋 Next steps for Render deployment:");
  console.log("1. Push code to GitHub");
  console.log("2. Connect GitHub repo to Render");
  console.log("3. Set environment variables in Render dashboard");
  console.log("4. Deploy!");
  console.log("\n🔑 Admin login after deployment:");
  console.log("📧 Email: admin@hackathon.com");
  console.log("🔑 Password: admin123");
}

prepareForRender().catch(console.error);
