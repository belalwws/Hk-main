#!/usr/bin/env node

/**
 * 🧪 External API Test Script
 * 
 * اختبار External API للتسجيل في الهاكاثونات
 */

const fetch = require('node-fetch')

const BASE_URL = process.env.TEST_URL || 'https://hackathon-platform-601l.onrender.com'
const API_KEY = process.env.EXTERNAL_API_KEY || 'test-api-key-12345'

const headers = {
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json'
}

async function testExternalAPI() {
  console.log('🧪 Testing External API...\n')
  console.log(`🔗 Base URL: ${BASE_URL}`)
  console.log(`🔑 API Key: ${API_KEY}\n`)
  
  try {
    // Test 1: Get all hackathons
    console.log('📋 Test 1: Getting all hackathons...')
    const hackathonsResponse = await fetch(`${BASE_URL}/api/external/hackathons`, {
      method: 'GET',
      headers: headers
    })
    
    console.log(`📡 Response Status: ${hackathonsResponse.status}`)
    
    if (hackathonsResponse.ok) {
      const hackathonsData = await hackathonsResponse.json()
      console.log('✅ Hackathons retrieved successfully!')
      console.log(`   Total hackathons: ${hackathonsData.total}`)
      
      if (hackathonsData.hackathons && hackathonsData.hackathons.length > 0) {
        const firstHackathon = hackathonsData.hackathons[0]
        console.log(`   First hackathon: ${firstHackathon.title}`)
        console.log(`   Registration open: ${firstHackathon.isRegistrationOpen}`)
        console.log(`   Spots available: ${firstHackathon.spotsAvailable}`)
        
        // Test 2: Get hackathon details
        console.log('\n📋 Test 2: Getting hackathon details...')
        const detailsResponse = await fetch(`${BASE_URL}/api/external/hackathons/${firstHackathon.id}`, {
          method: 'GET',
          headers: headers
        })
        
        console.log(`📡 Response Status: ${detailsResponse.status}`)
        
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json()
          console.log('✅ Hackathon details retrieved successfully!')
          console.log(`   Title: ${detailsData.hackathon.title}`)
          console.log(`   Current participants: ${detailsData.hackathon.currentParticipants}`)
          console.log(`   Max participants: ${detailsData.hackathon.maxParticipants}`)
          
          // Test 3: Register for hackathon (if registration is open)
          if (firstHackathon.isRegistrationOpen) {
            console.log('\n📋 Test 3: Testing registration...')
            
            const testUser = {
              name: 'مستخدم تجريبي',
              email: `test-${Date.now()}@example.com`,
              phone: '+966501234567',
              university: 'جامعة الملك سعود',
              major: 'علوم الحاسب',
              graduationYear: '2025',
              preferredRole: 'مطور',
              experience: 'متوسط',
              skills: ['JavaScript', 'Python', 'React'],
              portfolioUrl: 'https://portfolio.example.com',
              linkedinUrl: 'https://linkedin.com/in/testuser',
              githubUrl: 'https://github.com/testuser',
              motivation: 'أريد تعلم تقنيات جديدة والمشاركة في مشاريع مبتكرة',
              source: 'external_api_test'
            }
            
            const registerResponse = await fetch(`${BASE_URL}/api/external/hackathons/${firstHackathon.id}/register`, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify(testUser)
            })
            
            console.log(`📡 Registration Response Status: ${registerResponse.status}`)
            
            if (registerResponse.ok) {
              const registerData = await registerResponse.json()
              console.log('✅ Registration successful!')
              console.log(`   Participant ID: ${registerData.data.participantId}`)
              console.log(`   Registration Date: ${registerData.data.registrationDate}`)
            } else {
              const errorData = await registerResponse.json()
              console.log('❌ Registration failed!')
              console.log(`   Error: ${errorData.error}`)
            }
          } else {
            console.log('\n⚠️ Test 3: Skipped - Registration is closed for this hackathon')
          }
          
        } else {
          const errorData = await detailsResponse.text()
          console.log('❌ Failed to get hackathon details!')
          console.log(`   Error: ${errorData}`)
        }
        
      } else {
        console.log('⚠️ No hackathons found for testing')
      }
      
    } else {
      const errorData = await hackathonsResponse.text()
      console.log('❌ Failed to get hackathons!')
      console.log(`   Error: ${errorData}`)
    }
    
    // Test 4: Test invalid API key
    console.log('\n📋 Test 4: Testing invalid API key...')
    const invalidResponse = await fetch(`${BASE_URL}/api/external/hackathons`, {
      method: 'GET',
      headers: {
        'X-API-Key': 'invalid-key',
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`📡 Invalid Key Response Status: ${invalidResponse.status}`)
    
    if (invalidResponse.status === 401) {
      console.log('✅ API key validation working correctly!')
    } else {
      console.log('❌ API key validation not working properly!')
    }
    
    console.log('\n🎉 External API testing completed!')
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message)
  }
}

// Environment check
console.log('🔧 Environment Check:')
console.log(`   Base URL: ${BASE_URL}`)
console.log(`   API Key: ${API_KEY ? '✅ Set' : '❌ Not set'}`)
console.log('')

// Run the test
testExternalAPI()
