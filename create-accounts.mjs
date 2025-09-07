import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
	console.log("🌱 إنشاء حسابات المدير والمحكم...")

	try {
		// Check current schema
		console.log("🔍 فحص قاعدة البيانات...")
		
		// Try to create admin with current schema
		try {
			const adminPasswordHash = await bcrypt.hash("admin123", 12)
			const admin = await prisma.$executeRaw`
				INSERT OR REPLACE INTO admins (id, name, email, password_hash, createdAt, updatedAt)
				VALUES ('admin-1', 'مدير النظام', 'admin@hackathon.gov.sa', ${adminPasswordHash}, datetime('now'), datetime('now'))
			`
			console.log("✅ تم إنشاء حساب المدير")
		} catch (error) {
			console.log("⚠️ فشل إنشاء المدير:", error.message)
		}

		// Try to create judge
		try {
			const judgePasswordHash = await bcrypt.hash("judge123", 12)
			const judge = await prisma.$executeRaw`
				INSERT OR REPLACE INTO judges (id, name, email, password_hash, is_active, createdAt, updatedAt)
				VALUES ('judge-1', 'أحمد محمد', 'ahmed@hackathon.gov.sa', ${judgePasswordHash}, 1, datetime('now'), datetime('now'))
			`
			console.log("✅ تم إنشاء حساب المحكم")
		} catch (error) {
			console.log("⚠️ فشل إنشاء المحكم:", error.message)
		}

		console.log("🎉 تم إنشاء الحسابات!")
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
		console.error("❌ خطأ عام:", error)
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
