// Script to check email template attachments in database
import { prisma } from '../lib/prisma'

async function checkAttachments() {
  console.log('🔍 Checking email template attachments...\n')

  const templates = await prisma.emailTemplate.findMany({
    select: {
      id: true,
      templateKey: true,
      nameAr: true,
      attachments: true
    }
  })

  console.log(`Found ${templates.length} templates\n`)

  for (const template of templates) {
    console.log(`📧 Template: ${template.nameAr} (${template.templateKey})`)
    console.log(`   ID: ${template.id}`)
    
    const attachmentsField = (template as any).attachments
    console.log(`   Attachments field type: ${typeof attachmentsField}`)
    console.log(`   Attachments field value: ${attachmentsField}`)
    
    if (attachmentsField) {
      try {
        const parsed = JSON.parse(attachmentsField as string)
        console.log(`   ✅ Parsed attachments (${parsed.length}):`)
        parsed.forEach((att: any, index: number) => {
          console.log(`      ${index + 1}. ${att.name}`)
          console.log(`         URL: ${att.url}`)
          console.log(`         Type: ${att.type}`)
          console.log(`         Size: ${att.size}`)
        })
      } catch (error) {
        console.log(`   ❌ Failed to parse attachments:`, error)
      }
    } else {
      console.log(`   ℹ️  No attachments`)
    }
    console.log('')
  }

  await prisma.$disconnect()
}

checkAttachments().catch(console.error)

