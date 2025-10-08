#!/usr/bin/env node

/**
 * Manual Restore Script
 * Paste your backup JSON data here
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// 👇 الصق الـ JSON اللي نسخته من Render هنا
const backupData = {
  users: [],
  hackathons: [],
  participants: []
  // ... باقي البيانات
}

async function restore() {
  try {
    console.log('📦 Starting manual restore...')

    // Restore Users
    if (backupData.users && backupData.users.length > 0) {
      console.log(`👥 Restoring ${backupData.users.length} users...`)
      for (const user of backupData.users) {
        await prisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user
        })
      }
      console.log('✅ Users restored')
    }

    // Restore Hackathons
    if (backupData.hackathons && backupData.hackathons.length > 0) {
      console.log(`🏆 Restoring ${backupData.hackathons.length} hackathons...`)
      for (const hackathon of backupData.hackathons) {
        await prisma.hackathon.upsert({
          where: { id: hackathon.id },
          update: hackathon,
          create: hackathon
        })
      }
      console.log('✅ Hackathons restored')
    }

    // Restore Participants
    if (backupData.participants && backupData.participants.length > 0) {
      console.log(`👨‍💻 Restoring ${backupData.participants.length} participants...`)
      for (const participant of backupData.participants) {
        await prisma.participant.upsert({
          where: { id: participant.id },
          update: participant,
          create: participant
        })
      }
      console.log('✅ Participants restored')
    }

    console.log('\n✅ Restore completed successfully!')

  } catch (error) {
    console.error('❌ Restore failed:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

restore()

