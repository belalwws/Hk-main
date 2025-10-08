import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'racein668@gmail.com',
    pass: process.env.GMAIL_PASS || 'gpbyxbbvrzfyluqt'
  }
})

// POST /api/admin/hackathons/[id]/teams/auto-create - Create teams automatically
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params

    console.log(`🚀 Starting automatic team creation for hackathon: ${hackathonId}`)

    // Get the highest team number to continue numbering
    const existingTeams = await prisma.team.findMany({
      where: { hackathonId: hackathonId },
      orderBy: { teamNumber: 'desc' },
      take: 1
    })

    const startingTeamNumber = existingTeams.length > 0 ? existingTeams[0].teamNumber + 1 : 1

    // Get hackathon with settings to determine team size
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        id: true,
        title: true,
        settings: true
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Get team formation settings
    const hackathonSettings = hackathon.settings as any
    const teamFormationSettings = hackathonSettings?.teamFormationSettings || {
      teamSize: 4,
      minTeamSize: 3,
      maxTeamSize: 5,
      allowPartialTeams: true,
      rules: []
    }

    const teamSize = teamFormationSettings.teamSize
    const rules = teamFormationSettings.rules || []

    console.log(`🎯 Using team size: ${teamSize} from hackathon settings`)
    console.log(`📋 Using ${rules.length} distribution rules`)

    // Get approved participants with user data and custom fields
    const approvedParticipants = await prisma.participant.findMany({
      where: {
        hackathonId: hackathonId,
        status: 'approved' as any,
        teamId: null // Only participants not already in a team
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            preferredRole: true
          }
        },
        hackathon: {
          select: {
            title: true
          }
        }
      }
    })

    if (approvedParticipants.length === 0) {
      return NextResponse.json({ error: 'لا توجد مشاركين مقبولين متاحين لتكوين الفرق' }, { status: 400 })
    }

    console.log(`👥 Found ${approvedParticipants.length} approved participants`)

    // Group participants based on rules
    const groups: { [key: string]: { [value: string]: typeof approvedParticipants } } = {}

    // Process each rule
    for (const rule of rules) {
      if (rule.distribution === 'ignore') continue

      groups[rule.fieldId] = {}

      approvedParticipants.forEach(participant => {
        // Get value from participant's custom fields or standard fields
        let value: string | undefined

        // Check standard fields first
        if (rule.fieldId === 'preferredRole' || rule.fieldLabel.includes('دور') || rule.fieldLabel.includes('role')) {
          value = participant.user.preferredRole || participant.preferredRole || 'غير محدد'
        } else if (participant.additionalInfo) {
          const additionalInfo = participant.additionalInfo as any
          value = additionalInfo[rule.fieldId] || additionalInfo[rule.fieldLabel] || 'غير محدد'
        } else {
          // Try to get from other participant fields
          value = (participant as any)[rule.fieldId] || 'غير محدد'
        }

        if (!groups[rule.fieldId][value]) {
          groups[rule.fieldId][value] = []
        }
        groups[rule.fieldId][value].push(participant)
      })

      console.log(`📊 ${rule.fieldLabel} distribution:`,
        Object.keys(groups[rule.fieldId]).map(val => `${val}: ${groups[rule.fieldId][val].length}`)
      )
    }

    // Fallback: if no rules, group by preferredRole
    if (rules.length === 0) {
      const roleGroups: { [key: string]: typeof approvedParticipants } = {}

      approvedParticipants.forEach(participant => {
        const role = participant.user.preferredRole || 'مطور'
        if (!roleGroups[role]) {
          roleGroups[role] = []
        }
        roleGroups[role].push(participant)
      })

      groups['preferredRole'] = roleGroups
      console.log('📊 Role distribution (fallback):', Object.keys(roleGroups).map(role => `${role}: ${roleGroups[role].length}`))
    }

    // Create balanced teams using the configured team size and rules
    const teams: Array<{
      name: string
      teamNumber: number
      members: typeof approvedParticipants
    }> = []

    // Calculate number of teams needed
    const totalParticipants = approvedParticipants.length
    const numberOfTeams = Math.ceil(totalParticipants / teamSize)

    console.log(`🎯 Creating ${numberOfTeams} teams with ~${teamSize} members each`)

    // Initialize teams
    for (let i = 0; i < numberOfTeams; i++) {
      teams.push({
        name: `الفريق ${startingTeamNumber + i}`,
        teamNumber: startingTeamNumber + i,
        members: []
      })
    }

    // Distribute participants based on rules
    const assignedParticipants = new Set<string>()

    // Sort rules by priority
    const sortedRules = [...rules].sort((a, b) => (a.priority || 999) - (b.priority || 999))

    // Process each rule
    for (const rule of sortedRules) {
      if (rule.distribution === 'ignore' || !groups[rule.fieldId]) continue

      const fieldGroups = groups[rule.fieldId]
      const values = Object.keys(fieldGroups)

      if (rule.distribution === 'balanced' || rule.distribution === 'one_per_team') {
        // Distribute evenly across teams
        let currentTeamIndex = 0

        for (const value of values) {
          const participants = fieldGroups[value].filter(p => !assignedParticipants.has(p.id))

          for (const participant of participants) {
            // Check team constraints
            if (rule.distribution === 'one_per_team') {
              const maxPerTeam = rule.maxPerTeam || 1
              const currentCount = teams[currentTeamIndex].members.filter(m => {
                const mValue = (m.additionalInfo as any)?.[rule.fieldId] || (m as any)[rule.fieldId] || m.user.preferredRole
                return mValue === value
              }).length

              if (currentCount >= maxPerTeam) {
                currentTeamIndex = (currentTeamIndex + 1) % numberOfTeams
                continue
              }
            }

            teams[currentTeamIndex].members.push(participant)
            assignedParticipants.add(participant.id)
            currentTeamIndex = (currentTeamIndex + 1) % numberOfTeams
          }
        }
      }
    }

    // Assign remaining participants (not assigned by rules)
    const remainingParticipants = approvedParticipants.filter(p => !assignedParticipants.has(p.id))
    let currentTeamIndex = 0

    for (const participant of remainingParticipants) {
      teams[currentTeamIndex].members.push(participant)
      currentTeamIndex = (currentTeamIndex + 1) % numberOfTeams
    }

    console.log('🔄 Team formation completed')
    console.log(`📊 Assigned by rules: ${assignedParticipants.size}, Remaining: ${remainingParticipants.length}`)

    // Create teams in database and assign participants
    const createdTeams: any[] = []
    const emailPromises: Promise<any>[] = []

    for (let i = 0; i < teams.length; i++) {
      const teamData = teams[i]
      
      if (teamData.members.length === 0) continue

      try {
        // Create team
        const team = await prisma.team.create({
          data: {
            name: teamData.name,
            hackathonId: hackathonId,
            teamNumber: teamData.teamNumber,
            createdAt: new Date()
          }
        })

        console.log(`✅ Created team: ${team.name} (ID: ${team.id})`)

        // Assign participants to team
        const participantIds = teamData.members.map(p => p.id)
        
        await prisma.participant.updateMany({
          where: {
            id: { in: participantIds }
          },
          data: {
            teamId: team.id
          }
        })

        console.log(`👥 Assigned ${participantIds.length} participants to ${team.name}`)

        createdTeams.push({
          id: team.id,
          name: team.name,
          members: teamData.members
        })

        // Prepare emails for team members
        teamData.members.forEach(participant => {
          const teamMembers = teamData.members.map(m => `${m.user.name} (${m.user.preferredRole || 'مطور'})`).join('\n')
          
          emailPromises.push(
            sendTeamAssignmentEmail(
              participant.user.email,
              participant.user.name,
              participant.hackathon.title,
              team.name,
              participant.user.preferredRole || 'مطور',
              teamMembers
            )
          )
        })

      } catch (error) {
        console.error(`❌ Error creating team ${teamData.name}:`, error)
      }
    }

    // Send all emails
    console.log(`📧 Sending ${emailPromises.length} team assignment emails...`)
    const emailResults = await Promise.allSettled(emailPromises)
    const successfulEmails = emailResults.filter(r => r.status === 'fulfilled').length
    const failedEmails = emailResults.filter(r => r.status === 'rejected').length

    console.log(`📊 Email results: ${successfulEmails} successful, ${failedEmails} failed`)

    return NextResponse.json({
      message: `تم تكوين الفرق بنجاح`,
      teamsCreated: createdTeams.length,
      participantsAssigned: approvedParticipants.length,
      emailsSent: successfulEmails,
      emailsFailed: failedEmails,
      teams: createdTeams.map(t => ({
        name: t.name,
        memberCount: t.members.length
      }))
    })

  } catch (error) {
    console.error('❌ Error in automatic team creation:', error)
    return NextResponse.json({ error: 'خطأ في تكوين الفرق' }, { status: 500 })
  }
}

async function sendTeamAssignmentEmail(
  email: string,
  userName: string,
  hackathonTitle: string,
  teamName: string,
  userRole: string,
  teamMembers: string
): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'هاكاثون الابتكار التقني <racein668@gmail.com>',
      to: email,
      subject: `🎉 تم تعيينك في ${teamName} - ${hackathonTitle}`,
      html: getTeamAssignmentEmailContent(userName, hackathonTitle, teamName, userRole, teamMembers)
    })
    
    console.log(`📧 Team assignment email sent to ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send team assignment email to ${email}:`, error)
    throw error
  }
}

function getTeamAssignmentEmailContent(
  userName: string,
  hackathonTitle: string,
  teamName: string,
  userRole: string,
  teamMembers: string
): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تعيين الفريق</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #c3e956/10 0%, #3ab666/10 100%); margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 مرحباً بك في فريقك!</h1>
          <p style="color: #c3e956; margin: 10px 0 0 0; font-size: 18px;">تم تعيينك في فريق جديد</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #01645e; margin: 0 0 20px 0; font-size: 24px;">مرحباً ${userName}! 👋</h2>
          
          <p style="color: #333; line-height: 1.8; font-size: 16px; margin-bottom: 25px;">
            يسعدنا إبلاغك بأنه تم تعيينك في فريق جديد لـ <strong style="color: #3ab666;">${hackathonTitle}</strong>
          </p>

          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-right: 4px solid #3ab666; padding: 25px; margin: 25px 0; border-radius: 10px;">
            <h3 style="color: #01645e; margin: 0 0 15px 0; font-size: 20px;">🏆 ${teamName}</h3>
            <p style="color: #666; margin: 0; font-size: 16px;">دورك في الفريق: <strong style="color: #3ab666;">${userRole}</strong></p>
          </div>

          <h3 style="color: #01645e; margin: 30px 0 15px 0;">👥 أعضاء فريقك:</h3>
          <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 15px 0;">
            <pre style="color: #333; margin: 0; font-family: inherit; white-space: pre-wrap; line-height: 1.6;">${teamMembers}</pre>
          </div>

          <h3 style="color: #01645e; margin: 30px 0 15px 0;">🚀 الخطوات التالية:</h3>
          <ul style="color: #333; line-height: 1.8; padding-right: 20px;">
            <li style="margin-bottom: 10px;">تواصل مع أعضاء فريقك لبدء التخطيط</li>
            <li style="margin-bottom: 10px;">ناقشوا أفكار المشاريع المبتكرة</li>
            <li style="margin-bottom: 10px;">حددوا الأدوار والمسؤوليات</li>
            <li style="margin-bottom: 10px;">ابدأوا في تطوير مشروعكم</li>
          </ul>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'https://hackathon-platform-601l.onrender.com'}/profile" style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; transition: transform 0.3s;">
              🏠 زيارة الملف الشخصي
            </a>
          </div>

          <div style="background: #e8f5e8; border: 1px solid #3ab666; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <p style="color: #01645e; margin: 0; font-weight: bold; text-align: center;">
              💡 نصيحة: التعاون والتواصل الفعال هما مفتاح نجاح فريقكم!
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            هل تحتاج مساعدة؟ تواصل معنا على 
            <a href="mailto:support@hackathon.gov.sa" style="color: #3ab666;">support@hackathon.gov.sa</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
