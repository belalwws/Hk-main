// Test script to check if the form design is working
const fetch = require('node-fetch');

async function testFormDesign() {
  const hackathonId = 'cmfrav55o0001fd8wu0hasq8s';
  
  try {
    console.log('🔍 Testing form design endpoint...');
    
    // Test the form endpoint
    const formResponse = await fetch(`http://localhost:3000/api/form/${hackathonId}`);
    console.log('Form endpoint status:', formResponse.status);
    
    if (formResponse.status === 200) {
      const html = await formResponse.text();
      console.log('✅ Form endpoint returned HTML');
      console.log('HTML length:', html.length);
      
      // Check if it contains the custom design elements
      if (html.includes('linear-gradient')) {
        console.log('✅ Custom design detected (contains gradients)');
      } else {
        console.log('⚠️ No custom design detected');
      }
      
      if (html.includes('Cairo')) {
        console.log('✅ Custom font detected');
      } else {
        console.log('⚠️ No custom font detected');
      }
      
      // Save a sample of the HTML for inspection
      const fs = require('fs');
      fs.writeFileSync('form-output.html', html);
      console.log('📄 Saved form HTML to form-output.html');
      
    } else if (formResponse.status === 302) {
      console.log('🔄 Form redirected (probably to default form)');
    } else {
      console.log('❌ Form endpoint error:', formResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Error testing form:', error.message);
  }
}

testFormDesign();
