import type { FastifyInstance } from 'fastify'
import type { IUserRepository } from '../../domain/ports/IUserRepository'
import { hashToken, generateRefreshToken } from '../../infrastructure/security/hashToken'

interface RefreshTokenInput {
  refreshToken: string
}

interface RefreshTokenOutput {
  accessToken: string
  refreshToken: string  // raw token — caller (route) sets it as HttpOnly cookie
}

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly jwt: FastifyInstance['jwt'],
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const incomingHash = hashToken(input.refreshToken)

    // 1. Look up token in DB
    const stored = await this.userRepo.findRefreshToken(incomingHash)
    if (!stored) {
      throw new Error('Token de actualización inválido.')
    }

    // 2. Check expiry
    if (stored.expiresAt < new Date()) {
      await this.userRepo.deleteRefreshToken(stored.id)
      throw new Error('Token de actualización expirado. Por favor inicia sesión nuevamente.')
    }

    // 3. Rotate: delete old token
    await this.userRepo.deleteRefreshToken(stored.id)

    // 4. Fetch user via repository port (no direct Prisma)
    const user = await this.userRepo.findById(stored.userId)
    if (!user) {
      throw new Error('Usuario no encontrado.')
    }

    // 5. Issue new access token
    const accessToken = this.jwt.sign(
      { sub: user.id, nickname: user.nickname },
      { expiresIn: '15m' },
    )

    // 6. Issue new refresh token (rotation)
    const rawRefreshToken = generateRefreshToken()
    const newHash         = hashToken(rawRefreshToken)
    const newExpiry       = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await this.userRepo.createRefreshToken(user.id, newHash, newExpiry)

    return { accessToken, refreshToken: rawRefreshToken }
  }
}
