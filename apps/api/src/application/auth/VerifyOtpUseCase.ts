import type { FastifyInstance } from 'fastify'
import type { IUserRepository } from '../../domain/ports/IUserRepository'
import type { IEmailService } from '../../domain/ports/IEmailService'
import { hashEmail } from '../../infrastructure/security/hashEmail'
import { hashToken, generateRefreshToken } from '../../infrastructure/security/hashToken'
import { generateUniqueNickname } from '../../infrastructure/security/nicknameGenerator'

interface VerifyOtpInput {
  email: string
  otp: string
  faculty?: string
  ageRange?: string
  gender?: string
  device?: string   // user-agent summary for the login-alert email
}

interface AuthUser {
  nickname: string
  avatarSeed: string
  faculty: string | null
}

interface VerifyOtpOutput {
  accessToken: string
  refreshToken: string  // raw token — caller (route) sets it as HttpOnly cookie
  user: AuthUser
}

export class VerifyOtpUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly jwt: FastifyInstance['jwt'],
  ) {}

  async execute(input: VerifyOtpInput): Promise<VerifyOtpOutput> {
    const { email, otp, faculty, ageRange, gender, device } = input

    const emailHash = hashEmail(email)

    // 1. Find valid (non-expired, non-used) OTP request
    const otpRequest = await this.userRepo.findValidOtpRequest(emailHash)
    if (!otpRequest) {
      throw new Error('No hay un código OTP válido para este email. Solicita uno nuevo.')
    }

    // 2. Guard: too many attempts
    if (otpRequest.attempts >= 5) {
      throw new Error('Demasiados intentos fallidos. Solicita un nuevo código OTP.')
    }

    // 3. Verify OTP
    const providedHash = hashToken(otp)
    if (providedHash !== otpRequest.otpHash) {
      await this.userRepo.incrementOtpAttempts(otpRequest.id)
      throw new Error('Código OTP incorrecto.')
    }

    // 4. Mark OTP as used
    await this.userRepo.markOtpUsed(otpRequest.id)

    // 5. Find or create user
    let user = await this.userRepo.findByEmailHash(emailHash)

    if (!user) {
      const universityDomain = email.split('@')[1] ?? 'unknown.edu'
      const avatarSeed       = Math.random().toString(36).slice(2, 10)
      const nickname         = await generateUniqueNickname(
        (n) => this.userRepo.nicknameExists(n),
      )

      user = await this.userRepo.create({
        emailHash,
        nickname,
        avatarSeed,
        universityDomain,
        faculty,
        ageRange,
        gender,
      })

      // Welcome email on first signup (non-blocking)
      const { welcomeEmail } = await import('../../infrastructure/email/templates')
      this.emailService.send(email, welcomeEmail(user.nickname)).catch(() => null)
    } else {
      // Existing user logging in → security alert (non-blocking). We have the
      // plaintext email here (in-flow) — never stored, so this is the only
      // moment we can notify them.
      const { securityAlertEmail } = await import('../../infrastructure/email/templates')
      const when = new Date().toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })
      this.emailService.send(email, securityAlertEmail({ when, device })).catch(() => null)
    }

    // 6. Clean up stale refresh tokens for this user
    await this.userRepo.deleteExpiredRefreshTokens(user.id)

    // 7. Generate JWT access token (15 min)
    const accessToken = this.jwt.sign(
      { sub: user.id, nickname: user.nickname },
      { expiresIn: '15m' },
    )

    // 8. Generate refresh token and store its hash
    const rawRefreshToken  = generateRefreshToken()
    const refreshTokenHash = hashToken(rawRefreshToken)
    const refreshExpiry    = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await this.userRepo.createRefreshToken(user.id, refreshTokenHash, refreshExpiry)

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        nickname:   user.nickname,
        avatarSeed: user.avatarSeed,
        faculty:    user.faculty,
      },
    }
  }
}
