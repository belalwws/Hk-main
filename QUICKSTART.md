# 🚀 HackPro - Quick Start Guide

## One-Line Setup

```bash
git clone https://github.com/belalwws/Hk-main.git && cd Hk-main && npm install && cp .env.example .env
```

Then edit `.env` and run:
```bash
npx prisma db push && npm run dev
```

---

## Essential Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Sync schema to database
npx prisma studio        # Open database GUI

# Code Quality
npm run type-check       # TypeScript check
npm run lint             # ESLint
```

---

## Quick Access

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/saas` | SaaS landing page |
| `/login` | Login |
| `/register` | Register |
| `/admin/dashboard` | Admin panel |
| `/judge` | Judge portal |
| `/participant` | Participant portal |

Default admin: `admin@hackathon.gov.sa` / `admin123`

---

## Project Structure (Simplified)

```
hackpro-saas/
├── app/
│   ├── api/              # Backend APIs
│   ├── admin/            # Admin pages
│   ├── saas/             # Landing page
│   └── ...
├── components/           # React components
├── lib/                  # Utilities
│   ├── multi-tenancy.ts  # Multi-tenancy logic
│   ├── auth.ts           # Authentication
│   └── ...
├── hooks/                # React hooks
├── prisma/
│   └── schema.prisma     # Database schema
└── ...
```

---

## Multi-Tenancy Quick Guide

### Get Current Organization
```typescript
import { useOrganization } from '@/hooks/use-organization'

function MyComponent() {
  const { organization } = useOrganization()
  return <div>{organization?.name}</div>
}
```

### Check Limits
```typescript
import { checkLimit } from '@/lib/multi-tenancy'

const check = await checkLimit(organizationId, 'hackathons')
if (!check.allowed) {
  // Show upgrade prompt
}
```

### Track Usage
```typescript
import { trackUsage } from '@/lib/multi-tenancy'

await trackUsage(organizationId, 'email', 1)
```

---

## Database Schema Overview

```prisma
Organization  →  Hackathon, User
Hackathon     →  Participant, Team, Judge
User          →  Participant, Judge, Admin
Team          →  Participant, Score
Judge         →  Score
```

---

## Common Tasks

### Add a New Model
1. Update `schema.prisma`
2. Run `npx prisma db push`
3. Run `npx prisma generate`

### Create API Endpoint
```typescript
// app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ data: [] })
}
```

### Add New Page
```typescript
// app/mypage/page.tsx
export default function MyPage() {
  return <div>My Page</div>
}
```

---

## Environment Variables (Essential)

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
GMAIL_USER="your@email.com"
GMAIL_PASS="your-app-password"
```

---

## Troubleshooting

### "Prisma Client not found"
```bash
npx prisma generate
```

### "Database connection error"
Check `DATABASE_URL` in `.env`

### "Module not found"
```bash
npm install
```

### "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

---

## Next Steps

1. ✅ Read [CONTRIBUTING.md](./CONTRIBUTING.md)
2. ✅ Check [CHANGELOG.md](./CHANGELOG.md)
3. ✅ Review [README.md](./README.md)
4. ✅ Join our [Discord](https://discord.gg/hackpro)

---

**Happy coding! 🎉**
