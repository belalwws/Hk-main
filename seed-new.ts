import { PrismaClient } from "@prisma/client"
import { hashPassword } from "./lib/password"

const prisma = new PrismaClient()

async function main() {
	// Create super admin user
	const adminPassword = await hashPassword("admin123")
	const superAdminUser = await prisma.user.upsert({
		where: { email: "admin@hackathon.gov.sa" },
		update: {},
		create: { 
			name: "مدير النظام الرئيسي", 
			email: "admin@hackathon.gov.sa", 
			password_hash: adminPassword,
			role: "ADMIN"
		},
	})

	// Create super admin record
	await prisma.admin.upsert({
		where: { userId_hackathonId: { userId: superAdminUser.id, hackathonId: null } },
		update: {},
		create: { 
			userId: superAdminUser.id,
			hackathonId: null, // Super admin
			permissions: { canManageHackathons: true, canManageUsers: true }
		},
	})

	// Create sample hackathon
	const hackathon = await prisma.hackathon.upsert({
		where: { id: "sample-hackathon" },
		update: {},
		create: {
			id: "sample-hackathon",
			title: "هاكاثون الابتكار الحكومي 2025",
			description: "هاكاثون لتطوير حلول مبتكرة للخدمات الحكومية",
			requirements: "المشاركة مفتوحة لجميع المطورين والمصممين",
			startDate: new Date("2025-01-01"),
			endDate: new Date("2025-01-03"),
			isActive: true,
			settings: {
				maxTeamSize: 5,
				allowIndividualParticipation: true,
				autoTeaming: false,
				evaluationCriteria: [
					{ name: "الجدوى", weight: 0.2 },
					{ name: "ابتكارية الفكرة", weight: 0.25 },
					{ name: "قابلية التطبيق", weight: 0.25 },
					{ name: "التأثير على المؤسسة", weight: 0.2 },
					{ name: "مهارات العرض", weight: 0.1 }
				]
			}
		},
	})

	// Create judge users
	const judgePassword = await hashPassword("judge123")
	const judges = [
		{ name: "د. أحمد محمد", email: "ahmed@hackathon.gov.sa", city: "الرياض", nationality: "سعودي" },
		{ name: "د. فاطمة علي", email: "fatima@hackathon.gov.sa", city: "جدة", nationality: "سعودية" },
		{ name: "د. محمد سالم", email: "mohammed@hackathon.gov.sa", city: "الدمام", nationality: "سعودي" },
		{ name: "د. نورا أحمد", email: "nora@hackathon.gov.sa", city: "الرياض", nationality: "سعودية" },
		{ name: "د. خالد عبدالله", email: "khalid@hackathon.gov.sa", city: "مكة", nationality: "سعودي" },
	]

	for (const judgeData of judges) {
		const judgeUser = await prisma.user.upsert({
			where: { email: judgeData.email },
			update: {},
			create: { 
				name: judgeData.name, 
				email: judgeData.email, 
				password_hash: judgePassword,
				city: judgeData.city,
				nationality: judgeData.nationality,
				role: "JUDGE"
			},
		})

		// Assign judge to hackathon
		await prisma.judge.upsert({
			where: { userId_hackathonId: { userId: judgeUser.id, hackathonId: hackathon.id } },
			update: {},
			create: { 
				userId: judgeUser.id,
				hackathonId: hackathon.id
			},
		})
	}

	// Create sample participant users
	const participantPassword = await hashPassword("participant123")
	const participants = [
		{ name: "سارة أحمد", email: "sara@example.com", city: "الرياض", nationality: "سعودية" },
		{ name: "محمد علي", email: "mohammed.ali@example.com", city: "جدة", nationality: "سعودي" },
		{ name: "نور محمد", email: "noor@example.com", city: "الدمام", nationality: "سعودية" },
		{ name: "عبدالله سالم", email: "abdullah@example.com", city: "الرياض", nationality: "سعودي" },
		{ name: "فاطمة خالد", email: "fatima.khalid@example.com", city: "مكة", nationality: "سعودية" },
	]

	for (const participantData of participants) {
		const participantUser = await prisma.user.upsert({
			where: { email: participantData.email },
			update: {},
			create: { 
				name: participantData.name, 
				email: participantData.email, 
				password_hash: participantPassword,
				city: participantData.city,
				nationality: participantData.nationality,
				role: "PARTICIPANT"
			},
		})

		// Register participant in hackathon
		await prisma.participant.upsert({
			where: { userId_hackathonId: { userId: participantUser.id, hackathonId: hackathon.id } },
			update: {},
			create: { 
				userId: participantUser.id,
				hackathonId: hackathon.id,
				teamType: "INDIVIDUAL",
				status: "APPROVED"
			},
		})
	}

	// Create sample teams
	for (let i = 1; i <= 10; i++) {
		await prisma.team.upsert({
			where: { hackathonId_teamNumber: { hackathonId: hackathon.id, teamNumber: i } },
			update: {},
			create: { 
				name: `فريق الابتكار ${i}`,
				hackathonId: hackathon.id,
				teamNumber: i,
				ideaTitle: `فكرة مبتكرة ${i}`,
				ideaDescription: `وصف الفكرة المبتكرة رقم ${i} لتطوير الخدمات الحكومية`
			},
		})
	}

	console.log("Database seeded successfully!")
	console.log("=".repeat(50))
	console.log("🔑 حسابات الدخول:")
	console.log("=".repeat(50))
	console.log("👑 مدير النظام الرئيسي:")
	console.log("   البريد: admin@hackathon.gov.sa")
	console.log("   كلمة المرور: admin123")
	console.log("")
	console.log("⚖️ محكم:")
	console.log("   البريد: ahmed@hackathon.gov.sa")
	console.log("   كلمة المرور: judge123")
	console.log("")
	console.log("👤 مشارك:")
	console.log("   البريد: sara@example.com")
	console.log("   كلمة المرور: participant123")
	console.log("=".repeat(50))
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
