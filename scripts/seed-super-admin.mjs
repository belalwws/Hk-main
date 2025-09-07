import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = "admin@hackathon.gov.sa"
  const plain = "admin123"
  const name = "Super Admin"

  const password_hash = await bcrypt.hash(plain, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, password_hash, role: "ADMIN" },
    create: { name, email, password_hash, role: "ADMIN" },
  })

  console.log("Seeded admin user:")
  console.log({ id: user.id, email: user.email, role: user.role })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

