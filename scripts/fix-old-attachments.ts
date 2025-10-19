/**
 * Script to fix old email attachments in Cloudinary
 * Makes private files public so they can be downloaded without authentication
 */

import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'

const prisma = new PrismaClient()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface Attachment {
  url: string
  name: string
  type: string
  size: number
}

async function fixOldAttachments() {
  console.log('🔧 Starting to fix old email attachments...\n')

  try {
    // Get all email templates with attachments
    const templates = await prisma.emailTemplate.findMany({
      where: {
        attachments: {
          not: null
        }
      }
    })

    console.log(`📋 Found ${templates.length} templates with attachments\n`)

    let totalAttachments = 0
    let fixedAttachments = 0
    let failedAttachments = 0

    for (const template of templates) {
      console.log(`\n📧 Template: ${template.nameAr} (${template.templateKey})`)
      
      if (!template.attachments) continue

      let attachments: Attachment[] = []
      try {
        attachments = JSON.parse(template.attachments as string)
      } catch (error) {
        console.error(`  ❌ Failed to parse attachments JSON`)
        continue
      }

      console.log(`  📎 Found ${attachments.length} attachments`)

      for (const attachment of attachments) {
        totalAttachments++
        console.log(`\n  📥 Processing: ${attachment.name}`)
        console.log(`     URL: ${attachment.url}`)

        // Extract public_id from URL
        // Example URL: https://res.cloudinary.com/djva3nfy5/raw/upload/v1760907241/email-attachments/documents/filename.pdf
        const urlParts = attachment.url.split('/')
        const versionIndex = urlParts.findIndex(part => part.startsWith('v'))
        
        if (versionIndex === -1) {
          console.error(`     ❌ Could not extract public_id from URL`)
          failedAttachments++
          continue
        }

        // Get everything after version number
        const publicIdParts = urlParts.slice(versionIndex + 1)
        const publicId = publicIdParts.join('/')
        
        // Remove file extension from public_id
        const publicIdWithoutExt = publicId.replace(/\.[^/.]+$/, '')

        console.log(`     🔑 Public ID: ${publicIdWithoutExt}`)

        // Test if file is accessible
        console.log(`     🧪 Testing current accessibility...`)
        try {
          const testResponse = await fetch(attachment.url)
          if (testResponse.ok) {
            console.log(`     ✅ File is already accessible (${testResponse.status})`)
            fixedAttachments++
            continue
          } else {
            console.log(`     ⚠️  File is not accessible (${testResponse.status})`)
          }
        } catch (error) {
          console.log(`     ⚠️  Failed to test accessibility`)
        }

        // Try to update access mode in Cloudinary
        console.log(`     🔄 Updating access mode to public...`)
        try {
          // Method 1: Try to update existing resource
          try {
            const result = await cloudinary.api.update(publicIdWithoutExt, {
              resource_type: 'raw',
              type: 'upload',
              access_mode: 'public'
            })
            console.log(`     ✅ Updated successfully via API`)
            fixedAttachments++
            continue
          } catch (apiError: any) {
            console.log(`     ⚠️  API update failed: ${apiError.message}`)
          }

          // Method 2: Try explicit transformation
          try {
            await cloudinary.uploader.explicit(publicIdWithoutExt, {
              resource_type: 'raw',
              type: 'upload',
              access_mode: 'public'
            })
            console.log(`     ✅ Updated successfully via explicit`)
            fixedAttachments++
            continue
          } catch (explicitError: any) {
            console.log(`     ⚠️  Explicit update failed: ${explicitError.message}`)
          }

          // If both methods failed
          console.error(`     ❌ Could not update file - may need manual re-upload`)
          failedAttachments++

        } catch (error: any) {
          console.error(`     ❌ Error updating file: ${error.message}`)
          failedAttachments++
        }
      }
    }

    console.log('\n\n📊 Summary:')
    console.log(`   Total attachments found: ${totalAttachments}`)
    console.log(`   ✅ Fixed/Already accessible: ${fixedAttachments}`)
    console.log(`   ❌ Failed to fix: ${failedAttachments}`)

    if (failedAttachments > 0) {
      console.log('\n⚠️  Some attachments could not be fixed automatically.')
      console.log('   You may need to re-upload these files manually.')
      console.log('   Go to /supervisor/email-management, delete the old attachment, and upload it again.')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fixOldAttachments()
  .then(() => {
    console.log('\n✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })

