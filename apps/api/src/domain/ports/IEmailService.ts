export interface EmailMessage {
  subject: string
  html: string
  text: string
}

export interface IEmailService {
  /** Send a pre-built branded message. */
  send(email: string, message: EmailMessage): Promise<void>
  /** Convenience: send the OTP verification email. */
  sendOtp(email: string, otp: string): Promise<void>
}
