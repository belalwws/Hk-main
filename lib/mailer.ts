type MailOptions = {
  to: string | string[]
  subject: string
  text?: string
  html?: string
}

let cachedTransporter: any | null = null
let cachedStatus: { installed: boolean; provider: 'smtp' | 'gmail' | null; configured: boolean } | null = null
const FORCE_SEND = String(process.env.EMAIL_FORCE_SEND || '').toLowerCase() === 'true'

async function getMailer() {
  if (cachedTransporter) return cachedTransporter

  // Attempt to dynamically import nodemailer only if available
  let nodemailer: any
  try {
    console.log('🔧 [mailer] Attempting to import nodemailer...')
    // @ts-ignore - dynamic import at runtime; avoids build-time dependency
    nodemailer = (await import('nodemailer')).default
    console.log('✅ [mailer] Nodemailer imported successfully')
  } catch (error) {
    console.error('❌ [mailer] Failed to import nodemailer:', error)
    cachedStatus = { installed: false, provider: null, configured: false }
    if (FORCE_SEND) throw new Error('[mailer] nodemailer not installed')
    return null
  }

  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_PASS

  // Debug environment variables
  console.log('🔍 [mailer] Environment check:')
  console.log('🔍 [mailer] GMAIL_USER:', gmailUser ? 'SET' : 'NOT SET')
  console.log('🔍 [mailer] GMAIL_PASS:', gmailPass ? 'SET' : 'NOT SET')
  console.log('🔍 [mailer] SMTP_HOST:', host ? 'SET' : 'NOT SET')

  // 1) Preferred: explicit SMTP settings
  if (host && port && smtpUser && smtpPass) {
    const secure = Number(port) === 465
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user: smtpUser, pass: smtpPass },
    })
    cachedStatus = { installed: true, provider: 'smtp', configured: true }
    return cachedTransporter
  }

  // 2) Fallback: Gmail service if provided
  if (gmailUser && gmailPass) {
    console.log('🔧 [mailer] Creating Gmail transporter...')
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    })
    cachedStatus = { installed: true, provider: 'gmail', configured: true }
    console.log('✅ [mailer] Gmail transporter created successfully')
    return cachedTransporter
  }

  // 3) Not configured
  cachedStatus = { installed: true, provider: null, configured: false }
  if (FORCE_SEND) throw new Error('[mailer] SMTP not configured')
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[mailer] SMTP not configured. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS or GMAIL_USER/GMAIL_PASS')
  }
  return null

  return cachedTransporter
}

export async function sendMail(options: MailOptions) {
  console.log('📧 [mailer] Attempting to send email to:', options.to)
  console.log('🔍 [mailer] Environment check:')
  console.log('🔍 [mailer] GMAIL_USER:', process.env.GMAIL_USER ? 'SET' : 'NOT SET')
  console.log('🔍 [mailer] GMAIL_PASS:', process.env.GMAIL_PASS ? 'SET' : 'NOT SET')
  console.log('🔍 [mailer] NODE_ENV:', process.env.NODE_ENV)

  console.log('🔧 [mailer] Getting transporter...')
  const transporter = await getMailer()
  console.log('🔍 [mailer] Transporter result:', transporter ? 'AVAILABLE' : 'NOT AVAILABLE')
  
  const from = process.env.MAIL_FROM || `Hackathon <${process.env.SMTP_USER || process.env.GMAIL_USER || 'no-reply@example.com'}>`
  console.log('📧 [mailer] From address:', from)

  // If mailer not available (no nodemailer or env), log and noop so build/dev works
  if (!transporter) {
    console.warn('❌ [mailer] No transporter available! SMTP not configured properly.')
    console.warn('❌ [mailer] GMAIL_USER:', process.env.GMAIL_USER ? 'SET' : 'NOT SET')
    console.warn('❌ [mailer] GMAIL_PASS:', process.env.GMAIL_PASS ? 'SET' : 'NOT SET')

    if (process.env.NODE_ENV !== 'production') {
      console.warn('[mailer] Logging email instead of sending:')
      console.info('[mailer] To:', options.to)
      console.info('[mailer] Subject:', options.subject)
      if (options.text) console.info('[mailer] Text:', options.text?.substring(0, 100) + '...')
    }
    if (FORCE_SEND) throw new Error('[mailer] Mailer not configured and EMAIL_FORCE_SEND=true')
    return { messageId: `dev-${Date.now()}`, mocked: true, actuallyMailed: false }
  }

  console.log('✅ [mailer] Transporter ready, sending real email...')
  console.log('📧 [mailer] From:', from)
  console.log('📧 [mailer] To:', options.to)
  console.log('📧 [mailer] Subject:', options.subject)
  
  try {
    const result = await transporter.sendMail({ from, ...options })
    console.log('✅ [mailer] Email sent successfully:', result.messageId)
    return Object.assign(result || {}, { actuallyMailed: true })
  } catch (error) {
    console.error('❌ [mailer] Failed to send email:', error)
    throw error
  }
}

/**
 * Send email using template system
 */
export async function sendTemplatedEmail(
  templateType: keyof import('./email-templates').EmailTemplates,
  to: string,
  variables: Record<string, any>,
  hackathonId?: string
) {
  try {
    const { processEmailTemplate } = await import('./email-templates')
    const { subject, body } = await processEmailTemplate(templateType, variables, hackathonId)

    console.log(`📧 [mailer] Sending templated email (${templateType}) to:`, to)

    // Fetch hackathon name for dynamic sender if hackathonId is provided
    let fromAddress: string | undefined = undefined
    if (hackathonId) {
      try {
        const { prisma } = await import('./prisma')
        const hackathon = await prisma.hackathon.findUnique({
          where: { id: hackathonId },
          select: { title: true }
        })
        if (hackathon) {
          fromAddress = `"${hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`
          console.log(`📧 [mailer] Using hackathon-specific sender: ${fromAddress}`)
        }
      } catch (error) {
        console.warn(`⚠️ [mailer] Failed to fetch hackathon for sender name:`, error)
      }
    }

    return await sendMail({
      to,
      subject,
      html: body.replace(/\n/g, '<br>'),
      text: body,
      ...(fromAddress && { from: fromAddress })
    })
  } catch (error) {
    console.error(`❌ [mailer] Failed to send templated email (${templateType}):`, error)
    throw error
  }
}

export function mailerStatus() {
  const status = cachedStatus || { installed: !!cachedTransporter, provider: null as any, configured: !!cachedTransporter }
  const mode = FORCE_SEND ? 'force' : (process.env.NODE_ENV === 'production' ? 'prod' : 'dev')
  return { ...status, mode }
}
