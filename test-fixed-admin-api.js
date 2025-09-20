const { PrismaClient } = require("@prisma/client");
process.env.DATABASE_URL = "file:./dev.db";
const prisma = new PrismaClient();

async function testFixedAdminAPI() {
  try {
    const hackathonId = "cmfrav55o0001fd8wu0hasq8s";
    console.log("🔍 Testing FIXED admin API for:", hackathonId);

    // Test the fixed logic step by step
    console.log("📊 Step 1: Get hackathon basic info...");
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      console.log("❌ Hackathon not found");
      return;
    }

    console.log("✅ Hackathon found:", hackathon.title);

    // Step 2: Get participants separately
    console.log("📊 Step 2: Get participants...");
    let participants = [];
    try {
      participants = await prisma.participant.findMany({
        where: { hackathonId: hackathonId },
        select: {
          id: true,
          userId: true,
          hackathonId: true,
          teamName: true,
          projectTitle: true,
          projectDescription: true,
          githubRepo: true,
          teamRole: true,
          status: true,
          registeredAt: true,
          approvedAt: true,
          rejectedAt: true,
          teamId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              city: true,
              nationality: true,
              preferredRole: true,
            },
          },
        },
      });
      console.log("✅ Found participants:", participants.length);
    } catch (error) {
      console.log("⚠️ Could not fetch participants:", error.message);
    }

    // Step 3: Get teams separately
    console.log("📊 Step 3: Get teams...");
    let teams = [];
    try {
      teams = await prisma.team.findMany({
        where: { hackathonId: hackathonId },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
      console.log("✅ Found teams:", teams.length);
    } catch (error) {
      console.log("⚠️ Could not fetch teams:", error.message);
    }

    // Step 4: Build response
    console.log("📊 Step 4: Building response...");
    const transformedHackathon = {
      id: hackathon.id,
      title: hackathon.title,
      description: hackathon.description,
      startDate: hackathon.startDate ? hackathon.startDate.toISOString() : null,
      endDate: hackathon.endDate ? hackathon.endDate.toISOString() : null,
      registrationDeadline: hackathon.registrationDeadline
        ? hackathon.registrationDeadline.toISOString()
        : null,
      maxParticipants: hackathon.maxParticipants,
      status: hackathon.status,
      prizes: hackathon.prizes,
      requirements: hackathon.requirements,
      categories: hackathon.categories,
      settings: hackathon.settings,
      createdAt: hackathon.createdAt ? hackathon.createdAt.toISOString() : null,
      participants: participants.map((p) => ({
        id: p.id,
        userId: p.userId,
        user: p.user,
        teamId: p.teamId,
        teamName: p.teamName,
        projectTitle: p.projectTitle,
        projectDescription: p.projectDescription,
        githubRepo: p.githubRepo,
        teamRole: p.teamRole,
        status: p.status,
        registeredAt: p.registeredAt ? p.registeredAt.toISOString() : null,
        approvedAt: p.approvedAt ? p.approvedAt.toISOString() : null,
        rejectedAt: p.rejectedAt ? p.rejectedAt.toISOString() : null,
      })),
      teams: teams,
      stats: {
        totalParticipants: participants.length,
        totalTeams: teams.length,
        totalJudges: 0,
        pendingParticipants: participants.filter((p) => p.status === "pending")
          .length,
        approvedParticipants: participants.filter(
          (p) => p.status === "approved"
        ).length,
        rejectedParticipants: participants.filter(
          (p) => p.status === "rejected"
        ).length,
      },
    };

    console.log("✅ Response built successfully!");
    console.log("📊 Final stats:");
    console.log(
      "- Participants:",
      transformedHackathon.stats.totalParticipants
    );
    console.log("- Teams:", transformedHackathon.stats.totalTeams);
    console.log("- Pending:", transformedHackathon.stats.pendingParticipants);
    console.log("- Approved:", transformedHackathon.stats.approvedParticipants);
    console.log("- Rejected:", transformedHackathon.stats.rejectedParticipants);

    console.log("🎉 Admin API should work now!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testFixedAdminAPI();
