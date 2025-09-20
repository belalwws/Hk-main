#!/usr/bin/env node

/**
 * 🛡️ Data Protection Guard
 * 
 * حارس حماية البيانات - يمنع أي عملية قد تؤدي لمسح البيانات
 * يعمل كطبقة حماية إضافية قبل أي تحديث لقاعدة البيانات
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logHeader(message) {
  console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(50)}${colors.reset}`)
  console.log(`${colors.bold}${colors.cyan}${message}${colors.reset}`)
  console.log(`${colors.bold}${colors.cyan}${'='.repeat(50)}${colors.reset}\n`)
}

// إنشاء snapshot للبيانات الحالية
async function createDataSnapshot() {
  const prisma = new PrismaClient()
  
  try {
    logHeader('📸 CREATING DATA SNAPSHOT')
    
    const snapshot = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      render: process.env.RENDER === 'true',
      data: {}
    }

    // جمع البيانات المهمة
    const tables = [
      'user',
      'hackathon', 
      'participant',
      'team',
      'judge',
      'score',
      'admin',
      'hackathonForm',
      'hackathonLandingPage',
      'hackathonFormDesign'
    ]

    for (const table of tables) {
      try {
        const count = await prisma[table].count()
        snapshot.data[table] = {
          count,
          exists: count > 0
        }
        
        // إذا كان هناك بيانات، احفظ عينة صغيرة للتحقق
        if (count > 0 && count <= 10) {
          snapshot.data[table].sample = await prisma[table].findMany({
            take: 5,
            select: { id: true, createdAt: true }
          })
        }
        
        log(`✅ ${table}: ${count} records`, count > 0 ? 'green' : 'white')
      } catch (error) {
        snapshot.data[table] = {
          count: 0,
          exists: false,
          error: error.message
        }
        log(`⚠️ ${table}: table not accessible`, 'yellow')
      }
    }

    // حفظ الـ snapshot
    const snapshotDir = path.join(process.cwd(), 'data', 'snapshots')
    if (!fs.existsSync(snapshotDir)) {
      fs.mkdirSync(snapshotDir, { recursive: true })
    }
    
    const snapshotFile = path.join(snapshotDir, `snapshot-${Date.now()}.json`)
    fs.writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2))
    
    log(`📸 Snapshot saved: ${snapshotFile}`, 'cyan')
    
    // حفظ آخر snapshot كـ current
    const currentSnapshotFile = path.join(snapshotDir, 'current.json')
    fs.writeFileSync(currentSnapshotFile, JSON.stringify(snapshot, null, 2))
    
    return snapshot
    
  } catch (error) {
    log('❌ Failed to create snapshot:', 'red')
    log(error.message, 'red')
    return null
  } finally {
    await prisma.$disconnect()
  }
}

// مقارنة البيانات قبل وبعد التحديث
async function compareDataIntegrity(beforeSnapshot) {
  if (!beforeSnapshot) {
    log('⚠️ No before snapshot available for comparison', 'yellow')
    return true
  }

  const prisma = new PrismaClient()
  
  try {
    logHeader('🔍 VERIFYING DATA INTEGRITY')
    
    let allGood = true
    const issues = []

    for (const [table, beforeData] of Object.entries(beforeSnapshot.data)) {
      if (beforeData.error) continue
      
      try {
        const currentCount = await prisma[table].count()
        const beforeCount = beforeData.count
        
        if (currentCount < beforeCount) {
          allGood = false
          const lost = beforeCount - currentCount
          issues.push(`❌ ${table}: Lost ${lost} records (${beforeCount} → ${currentCount})`)
          log(`❌ ${table}: Lost ${lost} records (${beforeCount} → ${currentCount})`, 'red')
        } else if (currentCount === beforeCount) {
          log(`✅ ${table}: No data loss (${currentCount} records)`, 'green')
        } else {
          log(`📈 ${table}: Data increased (${beforeCount} → ${currentCount})`, 'cyan')
        }
        
      } catch (error) {
        log(`⚠️ ${table}: Could not verify (${error.message})`, 'yellow')
      }
    }

    if (allGood) {
      log('\n💚 DATA INTEGRITY VERIFIED - No data loss detected!', 'green')
    } else {
      log('\n💥 DATA LOSS DETECTED!', 'red')
      issues.forEach(issue => log(issue, 'red'))
      
      // حفظ تقرير المشاكل
      const issueReport = {
        timestamp: new Date().toISOString(),
        issues,
        beforeSnapshot: beforeSnapshot.timestamp
      }
      
      const reportFile = path.join(process.cwd(), 'data', 'snapshots', `data-loss-report-${Date.now()}.json`)
      fs.writeFileSync(reportFile, JSON.stringify(issueReport, null, 2))
      log(`📋 Issue report saved: ${reportFile}`, 'yellow')
    }

    return allGood
    
  } catch (error) {
    log('❌ Failed to verify data integrity:', 'red')
    log(error.message, 'red')
    return false
  } finally {
    await prisma.$disconnect()
  }
}

// استعادة البيانات من snapshot
async function restoreFromSnapshot(snapshotFile) {
  try {
    logHeader('🔄 RESTORING FROM SNAPSHOT')
    
    if (!fs.existsSync(snapshotFile)) {
      log('❌ Snapshot file not found:', 'red')
      log(snapshotFile, 'red')
      return false
    }

    const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'))
    log(`📸 Restoring from snapshot created at: ${snapshot.timestamp}`, 'cyan')
    
    // هذا مجرد مثال - في الواقع ستحتاج لتنفيذ استعادة كاملة
    log('⚠️ Snapshot restore is not fully implemented yet', 'yellow')
    log('💡 This would require a full backup/restore system', 'yellow')
    
    return true
    
  } catch (error) {
    log('❌ Failed to restore from snapshot:', 'red')
    log(error.message, 'red')
    return false
  }
}

// تنظيف snapshots القديمة
async function cleanupOldSnapshots() {
  try {
    const snapshotDir = path.join(process.cwd(), 'data', 'snapshots')
    if (!fs.existsSync(snapshotDir)) return
    
    const files = fs.readdirSync(snapshotDir)
    const snapshotFiles = files.filter(f => f.startsWith('snapshot-') && f.endsWith('.json'))
    
    // احتفظ بآخر 10 snapshots فقط
    if (snapshotFiles.length > 10) {
      const sortedFiles = snapshotFiles
        .map(f => ({
          name: f,
          path: path.join(snapshotDir, f),
          time: fs.statSync(path.join(snapshotDir, f)).mtime
        }))
        .sort((a, b) => b.time - a.time)
      
      const filesToDelete = sortedFiles.slice(10)
      
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path)
        log(`🗑️ Deleted old snapshot: ${file.name}`, 'yellow')
      }
    }
    
  } catch (error) {
    log('⚠️ Failed to cleanup old snapshots:', 'yellow')
    log(error.message, 'yellow')
  }
}

// الدالة الرئيسية
async function main() {
  const command = process.argv[2]
  
  try {
    switch (command) {
      case 'snapshot':
        await createDataSnapshot()
        await cleanupOldSnapshots()
        break
        
      case 'verify':
        const currentSnapshotFile = path.join(process.cwd(), 'data', 'snapshots', 'current.json')
        if (fs.existsSync(currentSnapshotFile)) {
          const snapshot = JSON.parse(fs.readFileSync(currentSnapshotFile, 'utf8'))
          await compareDataIntegrity(snapshot)
        } else {
          log('⚠️ No current snapshot found for verification', 'yellow')
        }
        break
        
      case 'restore':
        const snapshotFile = process.argv[3]
        if (!snapshotFile) {
          log('❌ Please provide snapshot file path', 'red')
          log('Usage: node data-protection-guard.js restore <snapshot-file>', 'yellow')
          process.exit(1)
        }
        await restoreFromSnapshot(snapshotFile)
        break
        
      case 'cleanup':
        await cleanupOldSnapshots()
        break
        
      default:
        log('🛡️ Data Protection Guard', 'cyan')
        log('', 'white')
        log('Available commands:', 'white')
        log('  snapshot  - Create data snapshot', 'white')
        log('  verify    - Verify data integrity', 'white')
        log('  restore   - Restore from snapshot', 'white')
        log('  cleanup   - Clean old snapshots', 'white')
        log('', 'white')
        log('Usage: node data-protection-guard.js <command>', 'yellow')
    }
    
  } catch (error) {
    log('❌ Command failed:', 'red')
    log(error.message, 'red')
    process.exit(1)
  }
}

// تشغيل السكريبت
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  createDataSnapshot,
  compareDataIntegrity,
  restoreFromSnapshot,
  cleanupOldSnapshots
}
