const { PrismaClient } = require("@prisma/client");
process.env.DATABASE_URL = "file:./dev.db";
const prisma = new PrismaClient();

async function checkLandingPage() {
  try {
    const landingPage = await prisma.hackathonLandingPage.findFirst({
      where: { hackathonId: "cmfrav55o0001fd8wu0hasq8s" },
      include: { hackathon: true },
    });

    if (landingPage) {
      console.log("✅ Landing Page found:");
      console.log("- HTML length:", landingPage.htmlContent?.length || 0);
      console.log("- CSS length:", landingPage.cssContent?.length || 0);
      console.log("- JS length:", landingPage.jsContent?.length || 0);
      console.log("- Is enabled:", landingPage.isEnabled);
      console.log("- Template:", landingPage.template);

      if (landingPage.cssContent) {
        console.log("\n📝 CSS Content preview:");
        console.log(landingPage.cssContent.substring(0, 200) + "...");
      } else {
        console.log("❌ No CSS content found");
      }

      if (landingPage.htmlContent) {
        console.log("\n📝 HTML Content preview:");
        console.log(landingPage.htmlContent.substring(0, 200) + "...");
      } else {
        console.log("❌ No HTML content found");
      }
    } else {
      console.log("❌ No landing page found");
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLandingPage();
