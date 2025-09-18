const fs = require('fs')
const path = require('path')

function removeEmptyDirectories(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      return
    }

    const files = fs.readdirSync(dirPath)
    
    if (files.length === 0) {
      console.log(`🗑️ Removing empty directory: ${dirPath}`)
      fs.rmdirSync(dirPath)
      return
    }

    // Recursively check subdirectories
    files.forEach(file => {
      const fullPath = path.join(dirPath, file)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        removeEmptyDirectories(fullPath)
      }
    })

    // Check again if directory is now empty after removing subdirectories
    const remainingFiles = fs.readdirSync(dirPath)
    if (remainingFiles.length === 0) {
      console.log(`🗑️ Removing empty directory: ${dirPath}`)
      fs.rmdirSync(dirPath)
    }
  } catch (error) {
    console.log(`⚠️ Could not remove directory ${dirPath}:`, error.message)
  }
}

function fixRoutingConflicts() {
  console.log('🔧 Fixing routing conflicts...')
  
  // Remove empty directories that might cause conflicts
  const pathsToCheck = [
    'app/api/admin/participants/[id]',
    'app/api/admin/participants/[id]/status',
  ]

  pathsToCheck.forEach(dirPath => {
    removeEmptyDirectories(dirPath)
  })

  console.log('✅ Routing conflicts fixed!')
}

// Run the fix
fixRoutingConflicts()
