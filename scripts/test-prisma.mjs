import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  try {
    const count = await prisma.hackathon.count();
    console.log("count:", count);
  } catch (e) {
    console.error("prisma error:", e);
  } finally {
    await prisma.$disconnect?.();
  }
}
run();
