# 🛠️ خطة التنفيذ التفصيلية - تحويل HackPro إلى SaaS

**تاريخ الإنشاء:** 2025-10-27  
**المدة المتوقعة:** 6 أشهر  
**الفريق المطلوب:** 2-3 مطورين

---

## 📋 جدول زمني تفصيلي

### 🔴 المرحلة 1: البنية الأساسية (شهران)

#### الأسبوع 1-2: Multi-Tenancy Foundation

**المهام:**
1. إنشاء Organization Model
```typescript
// prisma/schema.prisma
model Organization {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  logo              String?
  primaryColor      String   @default("#01645e")
  domain            String?  @unique
  plan              Plan     @default(free)
  status            OrgStatus @default(active)
  
  // Limits based on plan
  maxHackathons     Int      @default(1)
  maxUsers          Int      @default(10)
  maxParticipants   Int      @default(50)
  maxStorage        BigInt   @default(1073741824) // 1GB in bytes
  maxEmailsPerMonth Int      @default(100)
  
  // Billing
  billingEmail      String?
  billingName       String?
  billingAddress    String?
  taxId             String?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  users             OrganizationUser[]
  hackathons        Hackathon[]
  subscription      Subscription?
  usageMetrics      UsageMetrics[]
  apiKeys           ApiKey[]
}

enum Plan {
  free
  starter
  professional
  enterprise
}

enum OrgStatus {
  active
  suspended
  cancelled
}
```

2. إنشاء OrganizationUser (Many-to-Many)
```typescript
model OrganizationUser {
  id             String   @id @default(cuid())
  userId         String
  organizationId String
  role           OrgRole  @default(member)
  isOwner        Boolean  @default(false)
  permissions    Json?
  joinedAt       DateTime @default(now())
  
  user         User         @relation(...)
  organization Organization @relation(...)
  
  @@unique([userId, organizationId])
}

enum OrgRole {
  owner
  admin
  member
  viewer
}
```

3. تحديث جداول موجودة
```typescript
// إضافة organizationId لكل جدول رئيسي
model Hackathon {
  // ... الحقول الموجودة
  organizationId String
  organization   Organization @relation(...)
}

model User {
  // ... الحقول الموجودة
  organizations OrganizationUser[]
}
```

**Migration Script:**
```bash
# إنشاء migration
npx prisma migrate dev --name add_multi_tenancy

# تطبيق على production (بعد backup!)
npx prisma migrate deploy
```

**Data Migration:**
```typescript
// scripts/migrate-to-multi-tenancy.ts
// نقل البيانات الموجودة إلى organization افتراضي
async function migrateData() {
  // 1. إنشاء organization افتراضي
  const defaultOrg = await prisma.organization.create({
    data: {
      name: "Default Organization",
      slug: "default",
      plan: "professional",
      maxHackathons: 999,
      // ...
    }
  })
  
  // 2. ربط جميع الهاكاثونات به
  await prisma.hackathon.updateMany({
    data: { organizationId: defaultOrg.id }
  })
  
  // 3. ربط جميع المستخدمين به
  // ...
}
```

---

#### الأسبوع 3-4: Subscription System (Stripe)

**المهام:**

1. تثبيت Stripe
```bash
npm install stripe @stripe/stripe-js
```

2. إنشاء Subscription Model
```typescript
model Subscription {
  id                   String   @id @default(cuid())
  organizationId       String   @unique
  
  // Stripe IDs
  stripeCustomerId     String?  @unique
  stripeSubscriptionId String?  @unique
  stripePriceId        String?
  
  // Subscription details
  plan                 Plan
  status               SubscriptionStatus
  billingInterval      BillingInterval @default(monthly)
  
  // Period
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean  @default(false)
  canceledAt           DateTime?
  
  // Trial
  trialStart           DateTime?
  trialEnd             DateTime?
  
  // Metadata
  metadata             Json?
  
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  
  organization Organization @relation(...)
  invoices     Invoice[]
}

enum SubscriptionStatus {
  trialing
  active
  past_due
  canceled
  unpaid
}

enum BillingInterval {
  monthly
  yearly
}

model Invoice {
  id             String   @id @default(cuid())
  subscriptionId String
  stripeInvoiceId String? @unique
  
  amount         Int      // in cents
  currency       String   @default("usd")
  status         String
  pdfUrl         String?
  hostedUrl      String?
  
  createdAt      DateTime @default(now())
  
  subscription Subscription @relation(...)
}
```

3. إنشاء Stripe Webhooks
```typescript
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!
  const body = await req.text()
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return Response.json({ error: 'Webhook signature failed' }, { status: 400 })
  }
  
  // Handle events
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object)
      break
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object)
      break
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object)
      break
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object)
      break
  }
  
  return Response.json({ received: true })
}
```

4. إنشاء صفحات الاشتراك
```typescript
// app/pricing/page.tsx
// app/checkout/page.tsx
// app/billing/page.tsx
```

---

#### الأسبوع 5-6: Usage Tracking & Limits

**المهام:**

1. إنشاء UsageMetrics Model
```typescript
model UsageMetrics {
  id             String   @id @default(cuid())
  organizationId String
  period         DateTime // Start of billing period
  
  // Counts
  hackathonsUsed     Int @default(0)
  usersUsed          Int @default(0)
  participantsUsed   Int @default(0)
  emailsSent         Int @default(0)
  storageUsed        BigInt @default(0) // in bytes
  apiCallsMade       Int @default(0)
  
  // Detailed tracking
  hackathonsByStatus Json? // {open: 2, closed: 3, ...}
  emailsByType       Json? // {invitation: 50, certificate: 20, ...}
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  organization Organization @relation(...)
  
  @@unique([organizationId, period])
}
```

2. إنشاء Usage Middleware
```typescript
// lib/usage-tracker.ts
export async function trackUsage(
  organizationId: string,
  type: 'email' | 'storage' | 'api',
  amount: number
) {
  const period = startOfMonth(new Date())
  
  await prisma.usageMetrics.upsert({
    where: {
      organizationId_period: {
        organizationId,
        period
      }
    },
    create: {
      organizationId,
      period,
      [type === 'email' ? 'emailsSent' : 
       type === 'storage' ? 'storageUsed' : 
       'apiCallsMade']: amount
    },
    update: {
      [type === 'email' ? 'emailsSent' : 
       type === 'storage' ? 'storageUsed' : 
       'apiCallsMade']: {
        increment: amount
      }
    }
  })
}
```

3. إنشاء Limit Checker
```typescript
// lib/check-limits.ts
export async function checkLimit(
  organizationId: string,
  type: 'hackathons' | 'users' | 'participants' | 'emails' | 'storage'
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { subscription: true }
  })
  
  if (!org) throw new Error('Organization not found')
  
  // Get current usage
  const period = startOfMonth(new Date())
  const usage = await prisma.usageMetrics.findUnique({
    where: {
      organizationId_period: {
        organizationId,
        period
      }
    }
  })
  
  // Check against limits
  const limits = getPlanLimits(org.plan)
  const current = usage?.[`${type}Used`] || 0
  const limit = limits[type]
  
  return {
    allowed: current < limit,
    current,
    limit
  }
}

function getPlanLimits(plan: Plan) {
  const limits = {
    free: {
      hackathons: 1,
      users: 10,
      participants: 50,
      emails: 100,
      storage: 1073741824 // 1GB
    },
    starter: {
      hackathons: 3,
      users: 50,
      participants: 200,
      emails: 1000,
      storage: 10737418240 // 10GB
    },
    professional: {
      hackathons: 10,
      users: 999999,
      participants: 999999,
      emails: 5000,
      storage: 53687091200 // 50GB
    },
    enterprise: {
      hackathons: 999999,
      users: 999999,
      participants: 999999,
      emails: 999999,
      storage: 999999999999 // Unlimited
    }
  }
  
  return limits[plan]
}
```

4. تطبيق Limits في APIs
```typescript
// في كل API يُنشئ hackathon/user/etc
const limitCheck = await checkLimit(organizationId, 'hackathons')
if (!limitCheck.allowed) {
  return Response.json({
    error: 'Limit reached',
    message: `You've reached your plan limit of ${limitCheck.limit} hackathons`,
    current: limitCheck.current,
    limit: limitCheck.limit,
    upgradeUrl: '/pricing'
  }, { status: 403 })
}
```

---

#### الأسبوع 7-8: Onboarding & Setup Wizard

**المهام:**

1. صفحة التسجيل الجديدة
```typescript
// app/signup/page.tsx
export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left: Features & Benefits */}
      <div className="w-1/2 bg-gradient-to-br from-primary to-secondary">
        <div className="p-12">
          <h1>Welcome to HackPro</h1>
          <p>Manage hackathons like a pro</p>
          
          <ul className="space-y-4 mt-8">
            <li>✓ Create unlimited hackathons (Pro plan)</li>
            <li>✓ Advanced judging system</li>
            <li>✓ Automated certificates</li>
            <li>✓ Custom branding</li>
          </ul>
        </div>
      </div>
      
      {/* Right: Signup Form */}
      <div className="w-1/2">
        <SignupForm />
      </div>
    </div>
  )
}
```

2. Setup Wizard (Multi-step)
```typescript
// components/onboarding/SetupWizard.tsx
const steps = [
  {
    title: "Welcome!",
    description: "Let's set up your organization",
    component: WelcomeStep
  },
  {
    title: "Organization Details",
    component: OrgDetailsStep
  },
  {
    title: "Choose Your Plan",
    component: PlanSelectionStep
  },
  {
    title: "Payment (if paid plan)",
    component: PaymentStep
  },
  {
    title: "Create First Hackathon",
    component: FirstHackathonStep
  },
  {
    title: "Invite Team",
    component: InviteTeamStep
  },
  {
    title: "All Set!",
    component: CompletionStep
  }
]
```

3. Interactive Tour (react-joyride)
```bash
npm install react-joyride
```

---

### 🟡 المرحلة 2: الميزات التجارية (شهران)

#### الأسبوع 9-10: Billing Dashboard

**المهام:**

1. صفحة Billing
```typescript
// app/billing/page.tsx
export default function BillingPage() {
  return (
    <div>
      {/* Current Plan Card */}
      <Card>
        <h2>Current Plan: Professional</h2>
        <p>$99/month • Renews on Jan 15, 2025</p>
        <Button>Upgrade</Button>
        <Button variant="ghost">Cancel</Button>
      </Card>
      
      {/* Usage Metrics */}
      <Card>
        <h3>Usage This Month</h3>
        <ProgressBar label="Hackathons" value={5} max={10} />
        <ProgressBar label="Emails" value={1250} max={5000} />
        <ProgressBar label="Storage" value={15} max={50} unit="GB" />
      </Card>
      
      {/* Invoice History */}
      <Card>
        <h3>Invoices</h3>
        <Table>
          {invoices.map(invoice => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.date}</TableCell>
              <TableCell>{invoice.amount}</TableCell>
              <TableCell>
                <Button onClick={() => downloadPDF(invoice.id)}>
                  Download
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
      
      {/* Payment Method */}
      <Card>
        <h3>Payment Method</h3>
        <div>**** **** **** 4242</div>
        <Button>Update</Button>
      </Card>
    </div>
  )
}
```

2. Usage Dashboard Component
```typescript
// components/billing/UsageDashboard.tsx
export function UsageDashboard({ organizationId }: Props) {
  const { data: usage } = useQuery({
    queryKey: ['usage', organizationId],
    queryFn: () => fetchUsage(organizationId)
  })
  
  const { data: limits } = useQuery({
    queryKey: ['limits', organizationId],
    queryFn: () => fetchLimits(organizationId)
  })
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <UsageCard
        title="Hackathons"
        current={usage.hackathonsUsed}
        limit={limits.hackathons}
        icon={<Calendar />}
      />
      <UsageCard
        title="Emails Sent"
        current={usage.emailsSent}
        limit={limits.emails}
        icon={<Mail />}
      />
      <UsageCard
        title="Storage"
        current={formatBytes(usage.storageUsed)}
        limit={formatBytes(limits.storage)}
        icon={<HardDrive />}
      />
    </div>
  )
}
```

---

#### الأسبوع 11-12: Custom Domains

**المهام:**

1. Custom Domain Model
```typescript
model CustomDomain {
  id             String   @id @default(cuid())
  organizationId String
  domain         String   @unique
  verified       Boolean  @default(false)
  verificationCode String @unique
  sslStatus      String   @default("pending") // pending, active, failed
  createdAt      DateTime @default(now())
  verifiedAt     DateTime?
  
  organization Organization @relation(...)
}
```

2. Domain Verification Flow
```typescript
// app/api/domains/verify/route.ts
export async function POST(req: Request) {
  const { domain, organizationId } = await req.json()
  
  // 1. Generate verification code
  const verificationCode = generateRandomString(32)
  
  // 2. Save to database
  const customDomain = await prisma.customDomain.create({
    data: {
      organizationId,
      domain,
      verificationCode
    }
  })
  
  // 3. Return DNS instructions
  return Response.json({
    message: "Add these DNS records to verify ownership",
    records: [
      {
        type: "TXT",
        name: "_hackpro-verify",
        value: verificationCode
      },
      {
        type: "CNAME",
        name: domain,
        value: "verify.hackpro.cloud"
      }
    ]
  })
}

// Check verification
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const domainId = searchParams.get('id')
  
  const domain = await prisma.customDomain.findUnique({
    where: { id: domainId }
  })
  
  if (!domain) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  
  // Check DNS
  const txtRecords = await resolveTXT(`_hackpro-verify.${domain.domain}`)
  const isVerified = txtRecords.some(record => 
    record.includes(domain.verificationCode)
  )
  
  if (isVerified) {
    await prisma.customDomain.update({
      where: { id: domainId },
      data: {
        verified: true,
        verifiedAt: new Date()
      }
    })
    
    // Trigger SSL certificate generation
    await generateSSL(domain.domain)
  }
  
  return Response.json({ verified: isVerified })
}
```

3. SSL Certificate (Let's Encrypt)
```typescript
// lib/ssl.ts
import * as acme from 'acme-client'

export async function generateSSL(domain: string) {
  const client = new acme.Client({
    directoryUrl: acme.directory.letsencrypt.production,
    accountKey: await acme.crypto.createPrivateKey()
  })
  
  // Request certificate
  const [key, csr] = await acme.crypto.createCsr({
    commonName: domain
  })
  
  const cert = await client.auto({
    csr,
    email: 'admin@hackpro.cloud',
    termsOfServiceAgreed: true,
    challengeCreateFn: async (authz, challenge, keyAuthorization) => {
      // Store challenge for verification
      await storeDNSChallenge(domain, challenge, keyAuthorization)
    },
    challengeRemoveFn: async (authz, challenge, keyAuthorization) => {
      await removeDNSChallenge(domain, challenge)
    }
  })
  
  // Store certificate
  await storeCertificate(domain, cert, key)
  
  // Update domain status
  await prisma.customDomain.update({
    where: { domain },
    data: { sslStatus: 'active' }
  })
}
```

---

#### الأسبوع 13-14: Email Service Migration (SendGrid)

**المهام:**

1. تثبيت SendGrid
```bash
npm install @sendgrid/mail
```

2. إنشاء Email Service Abstraction
```typescript
// lib/email-service.ts
interface EmailProvider {
  send(options: EmailOptions): Promise<void>
  sendBatch(emails: EmailOptions[]): Promise<void>
}

class SendGridProvider implements EmailProvider {
  private client: MailService
  
  constructor() {
    this.client = new MailService()
    this.client.setApiKey(process.env.SENDGRID_API_KEY!)
  }
  
  async send({ to, subject, html, attachments }: EmailOptions) {
    await this.client.send({
      to,
      from: {
        email: 'noreply@hackpro.cloud',
        name: 'HackPro'
      },
      subject,
      html,
      attachments: attachments?.map(att => ({
        content: att.content,
        filename: att.filename,
        type: att.type
      }))
    })
  }
  
  async sendBatch(emails: EmailOptions[]) {
    // SendGrid can handle 1000 emails per request
    const chunks = chunk(emails, 1000)
    
    for (const chunk of chunks) {
      await this.client.send(
        chunk.map(email => ({
          to: email.to,
          from: 'noreply@hackpro.cloud',
          subject: email.subject,
          html: email.html
        }))
      )
    }
  }
}

// Factory
export function getEmailProvider(
  provider: 'sendgrid' | 'gmail' = 'sendgrid'
): EmailProvider {
  switch (provider) {
    case 'sendgrid':
      return new SendGridProvider()
    case 'gmail':
      return new GmailProvider() // للتوافق مع الموجود
    default:
      throw new Error('Unknown provider')
  }
}
```

3. تحديث جميع استخدامات البريد
```typescript
// قبل:
import { sendEmail } from '@/lib/mailer'

// بعد:
import { getEmailProvider } from '@/lib/email-service'

const emailService = getEmailProvider('sendgrid')
await emailService.send({ to, subject, html })
```

4. Email Tracking
```typescript
model EmailLog {
  id             String   @id @default(cuid())
  organizationId String
  to             String
  subject        String
  status         EmailStatus
  provider       String   @default("sendgrid")
  providerMessageId String?
  
  sentAt         DateTime @default(now())
  deliveredAt    DateTime?
  openedAt       DateTime?
  clickedAt      DateTime?
  bouncedAt      DateTime?
  
  error          String?
  
  organization Organization @relation(...)
}

enum EmailStatus {
  queued
  sent
  delivered
  opened
  clicked
  bounced
  failed
}
```

---

#### الأسبوع 15-16: Mobile Optimization & PWA

**المهام:**

1. PWA Setup
```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

module.exports = withPWA({
  // ... existing config
})
```

2. Manifest & Icons
```json
// public/manifest.json
{
  "name": "HackPro - Hackathon Management",
  "short_name": "HackPro",
  "description": "Professional Hackathon Management Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#01645e",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

3. Responsive Improvements
```typescript
// استخدام shadcn/ui responsive components
// تحسين Tables على mobile
// Bottom navigation للهاتف
// Touch gestures
```

---

### 🟢 المرحلة 3: التحسينات المتقدمة (شهران)

#### الأسبوع 17-18: Redis Caching

**المهام:**

1. Setup Redis
```bash
npm install ioredis
```

2. Redis Client
```typescript
// lib/redis.ts
import Redis from 'ioredis'

export const redis = new Redis(process.env.REDIS_URL!)

// Cache utilities
export async function cached<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  // Try cache first
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached)
  }
  
  // Execute function
  const result = await fn()
  
  // Store in cache
  await redis.setex(key, ttl, JSON.stringify(result))
  
  return result
}
```

3. استخدام Cache
```typescript
// مثال: cache dashboard stats
export async function getDashboardStats(organizationId: string) {
  return cached(
    `dashboard:${organizationId}`,
    300, // 5 minutes
    async () => {
      const stats = await prisma.hackathon.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: true
      })
      
      return stats
    }
  )
}
```

---

#### الأسبوع 19-20: API للمطورين

**المهام:**

1. API Keys Model
```typescript
model ApiKey {
  id             String   @id @default(cuid())
  organizationId String
  name           String
  key            String   @unique
  secret         String
  lastUsedAt     DateTime?
  expiresAt      DateTime?
  revokedAt      DateTime?
  permissions    Json     // ['read:hackathons', 'write:participants', ...]
  
  createdAt DateTime @default(now())
  
  organization Organization @relation(...)
}
```

2. API Authentication Middleware
```typescript
// middleware/api-auth.ts
export async function apiAuth(req: Request) {
  const apiKey = req.headers.get('x-api-key')
  const apiSecret = req.headers.get('x-api-secret')
  
  if (!apiKey || !apiSecret) {
    throw new UnauthorizedError('API credentials required')
  }
  
  const key = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    include: { organization: true }
  })
  
  if (!key || key.secret !== apiSecret) {
    throw new UnauthorizedError('Invalid credentials')
  }
  
  if (key.revokedAt) {
    throw new UnauthorizedError('API key revoked')
  }
  
  if (key.expiresAt && key.expiresAt < new Date()) {
    throw new UnauthorizedError('API key expired')
  }
  
  // Update last used
  await prisma.apiKey.update({
    where: { id: key.id },
    data: { lastUsedAt: new Date() }
  })
  
  return {
    organization: key.organization,
    permissions: key.permissions
  }
}
```

3. Public API Routes
```typescript
// app/api/v1/hackathons/route.ts
export async function GET(req: Request) {
  const { organization } = await apiAuth(req)
  
  const hackathons = await prisma.hackathon.findMany({
    where: { organizationId: organization.id },
    select: {
      id: true,
      title: true,
      description: true,
      startDate: true,
      endDate: true,
      status: true
    }
  })
  
  return Response.json({
    data: hackathons,
    meta: {
      total: hackathons.length
    }
  })
}

export async function POST(req: Request) {
  const { organization, permissions } = await apiAuth(req)
  
  if (!permissions.includes('write:hackathons')) {
    throw new ForbiddenError('Permission denied')
  }
  
  const data = await req.json()
  
  // Validate
  const validated = hackathonSchema.parse(data)
  
  // Check limits
  const limitCheck = await checkLimit(organization.id, 'hackathons')
  if (!limitCheck.allowed) {
    throw new LimitExceededError('Hackathon limit reached')
  }
  
  const hackathon = await prisma.hackathon.create({
    data: {
      ...validated,
      organizationId: organization.id
    }
  })
  
  return Response.json({ data: hackathon }, { status: 201 })
}
```

4. API Documentation (OpenAPI/Swagger)
```yaml
# public/api-docs.yaml
openapi: 3.0.0
info:
  title: HackPro API
  version: 1.0.0
  description: Public API for HackPro platform

servers:
  - url: https://api.hackpro.cloud/v1

security:
  - ApiKeyAuth: []

paths:
  /hackathons:
    get:
      summary: List hackathons
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Hackathon'
```

---

#### الأسبوع 21-22: Advanced Security

**المهام:**

1. Two-Factor Authentication
```bash
npm install speakeasy qrcode
```

```typescript
// lib/2fa.ts
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export async function generate2FASecret(userId: string) {
  const secret = speakeasy.generateSecret({
    name: `HackPro (${userId})`
  })
  
  const qrCode = await QRCode.toDataURL(secret.otpauth_url!)
  
  return {
    secret: secret.base32,
    qrCode
  }
}

export function verify2FAToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time steps of variance
  })
}
```

2. SSO (Google, Microsoft)
```bash
npm install next-auth @auth/prisma-adapter
```

```typescript
// lib/auth-config.ts
import GoogleProvider from 'next-auth/providers/google'
import MicrosoftProvider from 'next-auth/providers/microsoft'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    MicrosoftProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!
    })
  ],
  // ... rest of config
}
```

3. Audit Logs
```typescript
model AuditLog {
  id             String   @id @default(cuid())
  organizationId String
  userId         String?
  action         String   // 'hackathon.created', 'user.deleted', etc
  resource       String   // 'hackathon', 'user', etc
  resourceId     String?
  changes        Json?    // Before/after
  ip             String?
  userAgent      String?
  createdAt      DateTime @default(now())
  
  organization Organization @relation(...)
  user         User?        @relation(...)
}

// Usage
await createAuditLog({
  organizationId,
  userId,
  action: 'hackathon.created',
  resource: 'hackathon',
  resourceId: hackathon.id,
  changes: { created: hackathon },
  ip: req.ip,
  userAgent: req.headers.get('user-agent')
})
```

---

#### الأسبوع 23-24: Performance & Monitoring

**المهام:**

1. Sentry للـ Error Tracking
```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV
})
```

2. Analytics (Mixpanel/PostHog)
```bash
npm install mixpanel-browser
```

```typescript
// lib/analytics.ts
import mixpanel from 'mixpanel-browser'

mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!)

export const analytics = {
  track(event: string, properties?: any) {
    mixpanel.track(event, properties)
  },
  
  identify(userId: string, properties?: any) {
    mixpanel.identify(userId)
    if (properties) {
      mixpanel.people.set(properties)
    }
  }
}

// Usage
analytics.track('Hackathon Created', {
  hackathonId,
  organizationId,
  plan
})
```

3. Performance Monitoring
```typescript
// app/api/[...]/route.ts
import { performance } from 'perf_hooks'

export async function GET(req: Request) {
  const start = performance.now()
  
  try {
    // ... your code
    
    const duration = performance.now() - start
    
    // Log slow queries
    if (duration > 1000) {
      console.warn(`Slow API call: ${req.url} took ${duration}ms`)
    }
    
    return response
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}
```

---

## 📋 Checklist النهائي

### البنية الأساسية
- [ ] Multi-tenancy implemented
- [ ] Organization management
- [ ] Stripe integration
- [ ] Subscription system
- [ ] Usage tracking
- [ ] Limit enforcement
- [ ] Onboarding flow
- [ ] Setup wizard

### الميزات التجارية
- [ ] Billing dashboard
- [ ] Invoice management
- [ ] Plan upgrades/downgrades
- [ ] Custom domains
- [ ] Domain verification
- [ ] SSL certificates
- [ ] SendGrid integration
- [ ] Email tracking
- [ ] PWA setup
- [ ] Mobile optimization

### التحسينات المتقدمة
- [ ] Redis caching
- [ ] API for developers
- [ ] API keys management
- [ ] OpenAPI docs
- [ ] Two-factor auth
- [ ] SSO (Google/Microsoft)
- [ ] Audit logs
- [ ] Sentry error tracking
- [ ] Analytics (Mixpanel)
- [ ] Performance monitoring

### Testing & Quality
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Load testing
- [ ] Security audit
- [ ] Performance audit

### Documentation
- [ ] User guide
- [ ] API documentation
- [ ] Admin guide
- [ ] Video tutorials
- [ ] FAQ
- [ ] Troubleshooting

### Marketing & Launch
- [ ] Marketing website
- [ ] Pricing page
- [ ] Blog setup
- [ ] SEO optimization
- [ ] Social media accounts
- [ ] Launch announcement
- [ ] Email campaigns
- [ ] Beta testers recruited

---

## 🎯 الخلاصة

**المدة الإجمالية:** 6 أشهر  
**الفريق المطلوب:**
- 2 Backend Developers
- 1 Frontend Developer
- 1 DevOps (part-time)
- 1 Designer (part-time)

**التكلفة المتوقعة:**
- Development: $30,000 - $50,000
- Infrastructure: $500/month
- Marketing: $2,000 - $5,000

**ROI المتوقع:**
- Break-even: 9-12 شهر
- الربح السنوي (Year 2): $100,000+

---

**🚀 ابدأ الآن! المشروع جاهز 80% والباقي تنفيذ منهجي!**
