import type { IEmailService, EmailMessage } from '../../domain/ports/IEmailService'
import { otpEmail } from './templates'

export class ResendEmailService implements IEmailService {
  async send(email: string, message: EmailMessage): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      // Dev mode: log subject only (never log full HTML or recipient PII beyond this point)
      console.log('[DEV EMAIL]', email, '→', message.subject)
      return
    }

    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)
    const from   = process.env.RESEND_FROM ?? 'Qhatu <noreply@qhatu.app>'

    await resend.emails.send({
      from,
      to:      email,
      subject: message.subject,
      html:    message.html,
      text:    message.text,
    })
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    // Keep the OTP visible in dev console for local testing
    if (!process.env.RESEND_API_KEY) {
      console.log('[DEV OTP]', email, otp)
      return
    }
    await this.send(email, otpEmail(otp))
  }
}
