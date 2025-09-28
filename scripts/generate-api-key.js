#!/usr/bin/env node

/**
 * Generate a secure API key for external API access
 */

const crypto = require('crypto')

function generateApiKey() {
  // Generate a random 32-byte key and convert to hex
  const apiKey = crypto.randomBytes(32).toString('hex')
  return `hk_${apiKey}`
}

function generateMultipleKeys(count = 1) {
  const keys = []
  for (let i = 0; i < count; i++) {
    keys.push(generateApiKey())
  }
  return keys
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2)
  const count = args[0] ? parseInt(args[0]) : 1
  
  console.log('🔑 External API Key Generator')
  console.log('=' .repeat(50))
  
  if (count === 1) {
    const apiKey = generateApiKey()
    console.log('Generated API Key:')
    console.log(apiKey)
    console.log('')
    console.log('Add this to your .env file:')
    console.log(`EXTERNAL_API_KEY="${apiKey}"`)
  } else {
    const keys = generateMultipleKeys(count)
    console.log(`Generated ${count} API Keys:`)
    keys.forEach((key, index) => {
      console.log(`${index + 1}. ${key}`)
    })
    console.log('')
    console.log('Add one of these to your .env file:')
    console.log(`EXTERNAL_API_KEY="${keys[0]}"`)
  }
  
  console.log('')
  console.log('⚠️  Important Security Notes:')
  console.log('- Keep this API key secure and private')
  console.log('- Do not commit it to version control')
  console.log('- Rotate the key regularly')
  console.log('- Monitor API usage for suspicious activity')
}

module.exports = { generateApiKey, generateMultipleKeys }
