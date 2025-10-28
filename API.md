# 📡 HackPro API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production:  https://hackpro.cloud/api
```

## Authentication

All protected endpoints require JWT authentication via cookies:

```http
Cookie: auth-token=<JWT_TOKEN>
```

### Get Auth Token
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🏢 Organizations

### Get Current Organization
```http
GET /api/organization/current

Response:
{
  "organization": {
    "id": "org_123",
    "name": "My Company",
    "slug": "my-company",
    "plan": "professional",
    "primaryColor": "#01645e",
    "secondaryColor": "#3ab666",
    "accentColor": "#c3e956"
  }
}
```

### Switch Organization
```http
POST /api/organization/switch
Content-Type: application/json

{
  "organizationId": "org_456"
}

Response:
{
  "success": true,
  "message": "Organization switched successfully"
}
```

### Get Usage Metrics
```http
GET /api/organization/usage

Response:
{
  "usage": {
    "hackathons": { "used": 3, "limit": 10, "percentage": 30 },
    "users": { "used": 25, "limit": 999999, "percentage": 0 },
    "participants": { "used": 150, "limit": 999999, "percentage": 0 },
    "emails": { "used": 1200, "limit": 5000, "percentage": 24 },
    "storage": { "used": 5368709120, "limit": 53687091200, "percentage": 10 },
    "apiCalls": { "used": 8500, "limit": 50000, "percentage": 17 }
  },
  "plan": "professional",
  "planLimits": { ... }
}
```

---

## 🎯 Hackathons

### List Hackathons
```http
GET /api/hackathons
Query Parameters:
  - status: draft|open|closed|completed
  - page: number (default: 1)
  - limit: number (default: 10)

Response:
{
  "hackathons": [
    {
      "id": "hack_123",
      "title": "AI Innovation Hackathon",
      "status": "open",
      "startDate": "2025-11-01T00:00:00Z",
      "endDate": "2025-11-03T00:00:00Z",
      "_count": {
        "participants": 150,
        "teams": 30
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

### Get Hackathon
```http
GET /api/hackathons/:id

Response:
{
  "hackathon": {
    "id": "hack_123",
    "title": "AI Innovation Hackathon",
    "description": "Build the future with AI",
    "status": "open",
    "startDate": "2025-11-01T00:00:00Z",
    "endDate": "2025-11-03T00:00:00Z",
    "registrationDeadline": "2025-10-25T00:00:00Z",
    "maxParticipants": 200,
    "requirements": ["Must be 18+", "Team of 2-4"],
    "prizes": {
      "first": "$5000",
      "second": "$3000",
      "third": "$1000"
    }
  }
}
```

### Create Hackathon
```http
POST /api/hackathons
Content-Type: application/json

{
  "title": "New Hackathon",
  "description": "Description here",
  "startDate": "2025-12-01T00:00:00Z",
  "endDate": "2025-12-03T00:00:00Z",
  "registrationDeadline": "2025-11-25T00:00:00Z",
  "maxParticipants": 100
}

Response:
{
  "hackathon": { ... },
  "message": "Hackathon created successfully"
}
```

### Update Hackathon
```http
PUT /api/hackathons/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "open"
}

Response:
{
  "hackathon": { ... },
  "message": "Hackathon updated successfully"
}
```

### Delete Hackathon
```http
DELETE /api/hackathons/:id

Response:
{
  "success": true,
  "message": "Hackathon deleted successfully"
}
```

---

## 👥 Participants

### Register Participant
```http
POST /api/participants
Content-Type: application/json

{
  "hackathonId": "hack_123",
  "teamName": "Team Awesome",
  "projectTitle": "AI Assistant",
  "projectDescription": "An AI-powered assistant",
  "teamType": "team",
  "additionalInfo": {
    "skills": ["React", "Python"],
    "experience": "2 years"
  }
}

Response:
{
  "participant": { ... },
  "message": "Registration successful"
}
```

### Get Participant
```http
GET /api/participants/:id

Response:
{
  "participant": {
    "id": "part_123",
    "userId": "user_456",
    "hackathonId": "hack_789",
    "teamName": "Team Awesome",
    "status": "approved",
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Update Participant Status
```http
PUT /api/participants/:id/status
Content-Type: application/json

{
  "status": "approved"
}

Response:
{
  "participant": { ... },
  "message": "Status updated successfully"
}
```

### List Participants
```http
GET /api/participants
Query Parameters:
  - hackathonId: string
  - status: pending|approved|rejected
  - page: number
  - limit: number

Response:
{
  "participants": [ ... ],
  "pagination": { ... }
}
```

---

## ⚖️ Judges

### Invite Judge
```http
POST /api/judges/invite
Content-Type: application/json

{
  "email": "judge@example.com",
  "name": "Jane Smith",
  "hackathonId": "hack_123"
}

Response:
{
  "invitation": {
    "id": "inv_123",
    "email": "judge@example.com",
    "token": "unique-token",
    "expiresAt": "2025-11-01T00:00:00Z"
  },
  "message": "Invitation sent successfully"
}
```

### Accept Judge Invitation
```http
POST /api/judges/accept
Content-Type: application/json

{
  "token": "unique-token",
  "password": "newpassword123"
}

Response:
{
  "success": true,
  "message": "Invitation accepted"
}
```

### Get Assigned Teams
```http
GET /api/judges/:judgeId/teams

Response:
{
  "teams": [
    {
      "id": "team_123",
      "name": "Team Awesome",
      "projectName": "AI Assistant",
      "members": [ ... ]
    }
  ]
}
```

### Submit Score
```http
POST /api/scores
Content-Type: application/json

{
  "judgeId": "judge_123",
  "teamId": "team_456",
  "hackathonId": "hack_789",
  "criterionId": "crit_012",
  "score": 4,
  "comments": "Great work!"
}

Response:
{
  "score": { ... },
  "message": "Score submitted successfully"
}
```

---

## 📊 Analytics

### Dashboard Stats
```http
GET /api/admin/dashboard

Response:
{
  "stats": {
    "totalHackathons": 10,
    "activeHackathons": 3,
    "totalParticipants": 500,
    "totalTeams": 100,
    "totalJudges": 25
  },
  "recentActivity": [ ... ]
}
```

### Detailed Analytics
```http
GET /api/admin/analytics

Response:
{
  "participantStats": {
    "total": 500,
    "byStatus": {
      "approved": 450,
      "pending": 30,
      "rejected": 20
    },
    "growth": [ ... ]
  },
  "hackathonStats": { ... },
  "userStats": { ... }
}
```

---

## 🔐 Admin

### Create Admin
```http
POST /api/admin/create
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword",
  "name": "Admin Name",
  "hackathonId": "hack_123" // optional
}

Response:
{
  "user": { ... },
  "admin": { ... },
  "message": "Admin created successfully"
}
```

### List Users
```http
GET /api/admin/users
Query Parameters:
  - role: admin|judge|participant
  - page: number
  - limit: number

Response:
{
  "users": [ ... ],
  "pagination": { ... }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden / Limit Exceeded |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

### Common Error Codes

```javascript
UNAUTHORIZED          // Not authenticated
FORBIDDEN             // No permission
NOT_FOUND             // Resource not found
LIMIT_EXCEEDED        // Plan limit reached
VALIDATION_ERROR      // Input validation failed
DUPLICATE_ENTRY       // Resource already exists
INTERNAL_ERROR        // Server error
```

### Limit Exceeded Example

```json
{
  "error": "You've reached your hackathons limit (10/10). Please upgrade your plan.",
  "code": "LIMIT_EXCEEDED",
  "details": {
    "limitType": "hackathons",
    "current": 10,
    "limit": 10,
    "percentage": 100
  }
}
```

---

## Rate Limiting

API requests are limited based on your plan:

| Plan | Requests/Hour |
|------|---------------|
| Free | 100 |
| Starter | 500 |
| Professional | 5000 |
| Enterprise | Unlimited |

Rate limit headers:
```http
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1635724800
```

---

## Webhooks (Upcoming)

Subscribe to events:
- `hackathon.created`
- `participant.registered`
- `participant.approved`
- `team.submitted`
- `score.submitted`

---

## SDK (Planned)

```bash
npm install @hackpro/sdk
```

```typescript
import { HackPro } from '@hackpro/sdk'

const client = new HackPro({
  apiKey: process.env.HACKPRO_API_KEY
})

const hackathons = await client.hackathons.list()
```

---

## Support

- 📧 Email: [api@hackpro.com](mailto:api@hackpro.com)
- 📖 Docs: [https://docs.hackpro.com](https://docs.hackpro.com)
- 💬 Discord: [Join our server](https://discord.gg/hackpro)

---

**Last Updated:** October 28, 2025  
**API Version:** 2.0
