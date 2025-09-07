import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
	console.log("🌱 بدء إنشاء البيانات الأولية...")

	try {
		// Create admin account
		console.log("👑 إنشاء حساب المدير...")
		const adminPasswordHash = await bcrypt.hash("admin123", 12)
		await prisma.admin.upsert({
			where: { email: "admin@hackathon.gov.sa" },
			update: {},
			create: {
				name: "مدير النظام",
				email: "admin@hackathon.gov.sa",
				password_hash: adminPasswordHash,
			},
		})
		console.log("✅ تم إنشاء حساب المدير")

		// Create judge account
		console.log("⚖️ إنشاء حساب المحكم...")
		const judgePasswordHash = await bcrypt.hash("judge123", 12)
		await prisma.judge.upsert({
			where: { email: "ahmed@hackathon.gov.sa" },
			update: {},
			create: {
				name: "أحمد محمد",
				email: "ahmed@hackathon.gov.sa",
				password_hash: judgePasswordHash,
				is_active: true,
			},
		})
		console.log("✅ تم إنشاء حساب المحكم")

		console.log("🎉 تم إنشاء البيانات الأولية بنجاح!")
		console.log("=".repeat(50))
		console.log("🔑 حسابات الدخول:")
		console.log("=".repeat(50))
		console.log("👑 مدير النظام:")
		console.log("   البريد: admin@hackathon.gov.sa")
		console.log("   كلمة المرور: admin123")
		console.log("")
		console.log("⚖️ محكم:")
		console.log("   البريد: ahmed@hackathon.gov.sa") 
		console.log("   كلمة المرور: judge123")
		console.log("=".repeat(50))

	} catch (error) {
		console.error("❌ خطأ في إنشاء البيانات:", error)
		throw error
	}
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
