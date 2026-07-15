import type { FastifyInstance } from 'fastify'
import type { IUserRepository } from '../../domain/ports/IUserRepository'
import { hashEmail } from '../../infrastructure/security/hashEmail'
import { hashToken, generateRefreshToken } from '../../infrastructure/security/hashToken'
import { generateUniqueNickname } from '../../infrastructure/security/nicknameGenerator'

interface RecoverInput {
  email: string
  otp: string
  device?: string
}

interface AuthUser {
  nickname: string
  avatarSeed: string
  faculty: string | null
}

interface RecoverOutput {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

/**
 * "Perdí mi cuenta": valida OTP del correo y REINICIA la identidad de la cuenta
 * (nuevo nickname + avatar, mata todas las sesiones) SIN borrar los posts previos
 * — los posts siguen ligados al mismo userId, que no cambia. Devuelve una sesión
 * nueva, rehaciendo el flujo de login. El correo queda libre para una identidad nueva.
 */
export class RecoverAccountUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly jwt: FastifyInstance['jwt'],
  ) {}

  async execute(input: RecoverInput): Promise<RecoverOutput> {
    const { email, otp } = input
    const emailHash = hashEmail(email)

    // 1. OTP válido (no expirado, no usado)
    const otpRequest = await this.userRepo.findValidOtpRequest(emailHash)
    if (!otpRequest) {
      throw new Error('No hay un código válido para este correo. Solicita uno nuevo.')
    }
    if (otpRequest.attempts >= 5) {
      throw new Error('Demasiados intentos fallidos. Solicita un nuevo código.')
    }
    if (hashToken(otp) !== otpRequest.otpHash) {
      await this.userRepo.incrementOtpAttempts(otpRequest.id)
      throw new Error('Código incorrecto.')
    }
    await this.userRepo.markOtpUsed(otpRequest.id)

    // 2. La cuenta debe existir (recuperación, no registro)
    const user = await this.userRepo.findByEmailHash(emailHash)
    if (!user) {
      throw new Error('No existe una cuenta con este correo.')
    }

    // 3. Reinicia identidad — posts intactos (FK a user.id, que no cambia)
    const newNickname = await generateUniqueNickname((n) => this.userRepo.nicknameExists(n))
    const newAvatar   = Math.random().toString(36).slice(2, 10)
    await this.userRepo.updateNickname(user.id, newNickname)
    await this.userRepo.updateAvatarSeed(user.id, newAvatar)

    // 4. Mata todas las sesiones viejas
    await this.userRepo.deleteAllRefreshTokens(user.id)

    // 5. Nueva sesión (rehace login)
    const accessToken = this.jwt.sign(
      { sub: user.id, nickname: newNickname },
      { expiresIn: '15m' },
    )
    const rawRefreshToken  = generateRefreshToken()
    const refreshTokenHash = hashToken(rawRefreshToken)
    const refreshExpiry    = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await this.userRepo.createRefreshToken(user.id, refreshTokenHash, refreshExpiry)

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: { nickname: newNickname, avatarSeed: newAvatar, faculty: user.faculty },
    }
  }
}
