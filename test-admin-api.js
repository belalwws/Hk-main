const { PrismaClient } = require('@prisma/client');
process.env.DATABASE_URL = 'file:./dev.db';
const prisma = new PrismaClient();

async function testAdminAPI() {
  try {
    const hackathonId = 'cmfrd5gme0002fdmgt2urqx6g';
    console.log('🔍 Testing admin API for:', hackathonId);
    
    // Simulate the admin API logic
    const resolvedParams = { id: hackathonId };
    
    console.log('📊 Fetching hackathon with participants and teams...');
    
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: resolvedParams.id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                city: true,
                nationality: true,
                preferredRole: true
              }
            }
          },
          orderBy: {
            registeredAt: 'desc'
          }
        },
        teams: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!hackathon) {
      console.log('❌ Hackathon not found');
      return;
    }

    console.log('✅ Hackathon found with data:');
    console.log('- ID:', hackathon.id);
    console.log('- Title:', hackathon.title);
    console.log('- Participants count:', hackathon.participants?.length || 0);
    console.log('- Teams count:', hackathon.teams?.length || 0);
    
    // Test the response format
    const response = {
      hackathon: {
        ...hackathon,
        startDate: hackathon.startDate?.toISOString(),
        endDate: hackathon.endDate?.toISOString(),
        registrationDeadline: hackathon.registrationDeadline?.toISOString(),
        createdAt: hackathon.createdAt?.toISOString(),
        updatedAt: hackathon.updatedAt?.toISOString()
      }
    };
    
    console.log('📝 Response structure looks good');
    console.log('- Participants:', response.hackathon.participants?.length || 0);
    console.log('- Teams:', response.hackathon.teams?.length || 0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAPI();
