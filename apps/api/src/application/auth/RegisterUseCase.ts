import type { IUserRepository } from '../../domain/ports/IUserRepository'
import type { IEmailService } from '../../domain/ports/IEmailService'
import { hashEmail } from '../../infrastructure/security/hashEmail'
import { generateOtp, hashToken } from '../../infrastructure/security/hashToken'

interface RegisterInput {
  email: string
}

interface RegisterOutput {
  message: string
}

export class RegisterUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly emailService: IEmailService,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const { email } = input

    // Basic university email check
    if (!email.includes('.edu')) {
      throw new Error('Se requiere un email universitario (.edu)')
    }

    const emailHash = hashEmail(email)

    // Block already-registered users from going through register flow again
    const existing = await this.userRepo.findByEmailHash(emailHash)
    if (existing) {
      throw new Error('Este email ya está registrado. Usa el flujo de verificación para iniciar sesión.')
    }

    const otp = generateOtp()
    const otpHash = hashToken(otp)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await this.userRepo.createOtpRequest(emailHash, otpHash, expiresAt)
    await this.emailService.sendOtp(email, otp)

    return { message: 'OTP enviado. Revisa tu correo universitario.' }
  }
}
