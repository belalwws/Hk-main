
// Test hackathon creation API
const testData = {
  title: 'Test Hackathon',
  description: 'Test description',
  requirements: ['Requirement 1'],
  categories: ['Category 1'],
  startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  maxParticipants: 100,
  status: 'draft',
  prizes: {
    first: 'First Prize',
    second: 'Second Prize',
    third: 'Third Prize'
  }
}

fetch('/api/admin/hackathons', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'auth-token=your-token-here'
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => console.log('API Response:', data))
.catch(error => console.error('API Error:', error))
