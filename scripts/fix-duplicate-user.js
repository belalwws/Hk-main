const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDuplicateUser() {
  try {
    console.log('🔍 Checking for duplicate users...');
    
    // Find the email that was used for supervisor invitation
    const invitations = await prisma.supervisorInvitation.findMany({
      where: {
        status: 'accepted'
      },
      orderBy: {
        acceptedAt: 'desc'
      },
      take: 5
    });
    
    console.log('📧 Recent accepted invitations:', invitations.map(inv => ({
      email: inv.email,
      status: inv.status,
      acceptedAt: inv.acceptedAt
    })));
    
    if (invitations.length === 0) {
      console.log('❌ No accepted invitations found');
      return;
    }
    
    const latestInvitation = invitations[0];
    console.log('🎯 Checking user for email:', latestInvitation.email);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: latestInvitation.email },
      include: {
        supervisor: true,
        participant: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      hasSupervisor: !!user.supervisor,
      hasParticipant: !!user.participant
    });
    
    // If user role is not supervisor, fix it
    if (user.role !== 'supervisor') {
      console.log('🔧 Fixing user role from', user.role, 'to supervisor');
      
      await prisma.$transaction(async (tx) => {
        // Update user role
        await tx.user.update({
          where: { id: user.id },
          data: { role: 'supervisor' }
        });
        
        // Delete participant record if exists
        if (user.participant) {
          console.log('🗑️ Deleting participant record');
          await tx.participant.deleteMany({
            where: { userId: user.id }
          });
        }
        
        // Ensure supervisor record exists
        if (!user.supervisor) {
          console.log('➕ Creating supervisor record');
          await tx.supervisor.create({
            data: {
              userId: user.id,
              hackathonId: latestInvitation.hackathonId,
              permissions: latestInvitation.permissions || {},
              department: latestInvitation.department,
              isActive: true
            }
          });
        }
      });
      
      console.log('✅ User fixed successfully!');
    } else {
      console.log('✅ User role is already correct');
    }
    
    // Verify the fix
    const updatedUser = await prisma.user.findUnique({
      where: { email: latestInvitation.email },
      include: {
        supervisor: true,
        participant: true
      }
    });
    
    console.log('🔍 Final verification:', {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.name,
      hasSupervisor: !!updatedUser.supervisor,
      hasParticipant: !!updatedUser.participant
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  fixDuplicateUser()
    .then(() => {
      console.log('🎉 Script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixDuplicateUser };
