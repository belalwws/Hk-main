/**
 * Email utility functions for the hackathon platform
 * Handles email sending with fallback mechanisms
 */

import nodemailer from 'nodemailer'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export interface EmailTransporter {
  sendMail: (options: EmailOptions) => Promise<any>
}

/**
 * Create email transporter with error handling
 */
export function createEmailTransporter(): EmailTransporter | null {
  try {
    const gmailUser = process.env.GMAIL_USER || 'racein668@gmail.com'
    const gmailPass = process.env.GMAIL_PASS || 'gpbyxbbvrzfyluqt'

    if (!gmailUser || !gmailPass) {
      console.error('❌ Gmail credentials not configured')
      return null
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    })
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error)
    return null
  }
}

/**
 * Send email with fallback mechanisms
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createEmailTransporter()
    
    if (!transporter) {
      console.error('❌ No email transporter available')
      return false
    }

    const mailOptions = {
      from: options.from || process.env.MAIL_FROM || 'هاكاثون الابتكار التقني <racein668@gmail.com>',
      to: options.to,
      subject: options.subject,
      html: options.html
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully:', result.messageId)
    return true
    
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    return false
  }
}

/**
 * Generate registration confirmation email HTML
 */
export function getRegistrationConfirmationEmail(
  userName: string,
  hackathonTitle: string,
  startDate: string,
  endDate: string
): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تأكيد التسجيل</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 تم تأكيد التسجيل!</h1>
          <p style="color: #c3e956; margin: 10px 0 0 0; font-size: 18px;">مرحباً بك في الهاكاثون</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #01645e; margin: 0 0 20px 0; font-size: 24px;">مرحباً ${userName}! 👋</h2>
          
          <p style="color: #333; line-height: 1.8; font-size: 16px; margin-bottom: 25px;">
            تم تأكيد تسجيلك بنجاح في <strong style="color: #3ab666;">${hackathonTitle}</strong>
          </p>

          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-right: 4px solid #3ab666; padding: 25px; margin: 25px 0; border-radius: 10px;">
            <h3 style="color: #01645e; margin: 0 0 15px 0; font-size: 20px;">📅 تفاصيل الهاكاثون</h3>
            <p style="color: #666; margin: 5px 0; font-size: 16px;"><strong>تاريخ البداية:</strong> ${new Date(startDate).toLocaleDateString('ar-SA')}</p>
            <p style="color: #666; margin: 5px 0; font-size: 16px;"><strong>تاريخ النهاية:</strong> ${new Date(endDate).toLocaleDateString('ar-SA')}</p>
          </div>

          <h3 style="color: #01645e; margin: 30px 0 15px 0;">📋 الخطوات التالية:</h3>
          <ul style="color: #333; line-height: 1.8; padding-right: 20px;">
            <li style="margin-bottom: 10px;">ستصلك رسالة إلكترونية أخرى قبل بداية الهاكاثون بالتفاصيل</li>
            <li style="margin-bottom: 10px;">تأكد من تحضير أدواتك وأفكارك</li>
            <li style="margin-bottom: 10px;">ابدأ في تكوين فريقك أو انتظر التوزيع التلقائي</li>
            <li style="margin-bottom: 10px;">راجع قواعد ومعايير التقييم</li>
          </ul>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'https://clownfish-app-px9sc.ondigitalocean.app'}/login" style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; transition: transform 0.3s;">
              🏠 دخول المنصة
            </a>
          </div>

          <div style="background: #e8f5e8; border: 1px solid #3ab666; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <p style="color: #01645e; margin: 0; font-weight: bold; text-align: center;">
              🚀 نتطلع لرؤية إبداعك في الهاكاثون!
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            هل تحتاج مساعدة؟ تواصل معنا على 
            <a href="mailto:support@hackathon.gov.sa" style="color: #3ab666;">support@hackathon.gov.sa</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
