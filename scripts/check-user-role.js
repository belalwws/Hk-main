const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserRole() {
  try {
    console.log('🔍 Checking recent supervisor invitations...');
    
    // Find recent accepted invitations
    const invitations = await prisma.supervisorInvitation.findMany({
      where: {
        status: 'accepted'
      },
      orderBy: {
        acceptedAt: 'desc'
      },
      take: 3
    });
    
    console.log('📧 Recent accepted invitations:');
    invitations.forEach((inv, index) => {
      console.log(`${index + 1}. ${inv.email} - ${inv.status} - ${inv.acceptedAt}`);
    });
    
    if (invitations.length === 0) {
      console.log('❌ No accepted invitations found');
      return;
    }
    
    // Check each user
    for (const invitation of invitations) {
      console.log(`\n🔍 Checking user: ${invitation.email}`);
      
      const user = await prisma.user.findUnique({
        where: { email: invitation.email },
        include: {
          supervisor: true,
          participant: true
        }
      });
      
      if (!user) {
        console.log('❌ User not found');
        continue;
      }
      
      console.log('👤 User details:', {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isActive: user.isActive,
        emailVerified: user.emailVerified
      });
      
      console.log('🔗 Related records:', {
        hasSupervisor: !!user.supervisor,
        hasParticipant: !!user.participant,
        supervisorActive: user.supervisor?.isActive,
        participantActive: user.participant?.isActive
      });
      
      // Check if user needs fixing
      if (user.role !== 'supervisor' || user.participant || !user.supervisor) {
        console.log('🔧 User needs fixing!');
        
        await prisma.$transaction(async (tx) => {
          // Update user role
          await tx.user.update({
            where: { id: user.id },
            data: { 
              role: 'supervisor',
              isActive: true,
              emailVerified: true
            }
          });
          console.log('✅ Updated user role to supervisor');
          
          // Delete participant record if exists
          if (user.participant) {
            await tx.participant.deleteMany({
              where: { userId: user.id }
            });
            console.log('✅ Deleted participant record');
          }
          
          // Create or update supervisor record
          if (!user.supervisor) {
            await tx.supervisor.create({
              data: {
                userId: user.id,
                hackathonId: invitation.hackathonId,
                permissions: invitation.permissions || {},
                department: invitation.department,
                isActive: true
              }
            });
            console.log('✅ Created supervisor record');
          } else {
            await tx.supervisor.update({
              where: { id: user.supervisor.id },
              data: {
                isActive: true,
                hackathonId: invitation.hackathonId || user.supervisor.hackathonId,
                permissions: invitation.permissions || user.supervisor.permissions,
                department: invitation.department || user.supervisor.department
              }
            });
            console.log('✅ Updated supervisor record');
          }
        });
        
        console.log('🎉 User fixed successfully!');
      } else {
        console.log('✅ User is already correct');
      }
    }
    
    // Final verification
    console.log('\n🔍 Final verification:');
    for (const invitation of invitations) {
      const user = await prisma.user.findUnique({
        where: { email: invitation.email },
        include: {
          supervisor: true,
          participant: true
        }
      });
      
      console.log(`${invitation.email}:`, {
        role: user.role,
        hasSupervisor: !!user.supervisor,
        hasParticipant: !!user.participant,
        supervisorActive: user.supervisor?.isActive
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  checkUserRole()
    .then(() => {
      console.log('\n🎉 Script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { checkUserRole };
