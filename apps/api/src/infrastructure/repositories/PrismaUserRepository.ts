import type { PrismaClient } from '@prisma/client'
import type { IUserRepository, CreateUserData } from '../../domain/ports/IUserRepository'
import type { User } from '../../domain/entities/User'

// Map a Prisma User record to the domain entity
function toDomain(record: {
  id: string
  emailHash: string
  nickname: string
  avatarSeed: string
  faculty: string | null
  ageRange: string | null
  gender: string | null
  universityDomain: string
  streakCount: number
  totalLikesEarned: number
  createdAt: Date
}): User {
  return {
    id: record.id,
    emailHash: record.emailHash,
    nickname: record.nickname,
    avatarSeed: record.avatarSeed,
    faculty: record.faculty,
    ageRange: record.ageRange,
    gender: record.gender,
    universityDomain: record.universityDomain,
    streakCount: record.streakCount,
    totalLikesEarned: record.totalLikesEarned,
    createdAt: record.createdAt,
  }
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByEmailHash(emailHash: string): Promise<User | null> {
    const record = await this.db.user.findUnique({ where: { emailHash } })
    if (!record || record.deletedAt) return null  // deleted accounts can't authenticate
    return toDomain(record)
  }

  async findByNickname(nickname: string): Promise<User | null> {
    const record = await this.db.user.findUnique({ where: { nickname } })
    return record ? toDomain(record) : null
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.db.user.findUnique({ where: { id } })
    if (!record || record.deletedAt) return null
    return toDomain(record)
  }

  async nicknameExists(nickname: string): Promise<boolean> {
    const count = await this.db.user.count({ where: { nickname } })
    return count > 0
  }

  async emailHashExists(emailHash: string): Promise<boolean> {
    const count = await this.db.user.count({ where: { emailHash } })
    return count > 0
  }

  async updateEmailHash(userId: string, emailHash: string, universityDomain: string): Promise<void> {
    await this.db.user.update({ where: { id: userId }, data: { emailHash, universityDomain } })
  }

  async updateAvatarSeed(userId: string, avatarSeed: string): Promise<void> {
    await this.db.user.update({ where: { id: userId }, data: { avatarSeed } })
  }

  async updateNickname(userId: string, nickname: string): Promise<void> {
    await this.db.user.update({ where: { id: userId }, data: { nickname } })
  }

  async softDeleteUser(userId: string): Promise<void> {
    await this.db.$transaction([
      this.db.user.update({ where: { id: userId }, data: { deletedAt: new Date() } }),
      this.db.refreshToken.deleteMany({ where: { userId } }),  // kill all sessions
    ])
  }

  async create(data: CreateUserData): Promise<User> {
    const record = await this.db.user.create({
      data: {
        emailHash: data.emailHash,
        nickname: data.nickname,
        avatarSeed: data.avatarSeed,
        universityDomain: data.universityDomain,
        faculty: data.faculty ?? null,
        ageRange: data.ageRange ?? null,
        gender: data.gender ?? null,
      },
    })
    return toDomain(record)
  }

  // ── OTP ──────────────────────────────────────────────────────────────────────

  async createOtpRequest(emailHash: string, otpHash: string, expiresAt: Date): Promise<void> {
    await this.db.otpRequest.create({
      data: { emailHash, otpHash, expiresAt },
    })
  }

  async findValidOtpRequest(
    emailHash: string,
  ): Promise<{ id: string; otpHash: string; attempts: number } | null> {
    const record = await this.db.otpRequest.findFirst({
      where: {
        emailHash,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })
    if (!record) return null
    return { id: record.id, otpHash: record.otpHash, attempts: record.attempts }
  }

  async incrementOtpAttempts(id: string): Promise<void> {
    await this.db.otpRequest.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    })
  }

  async markOtpUsed(id: string): Promise<void> {
    await this.db.otpRequest.update({
      where: { id },
      data: { used: true },
    })
  }

  // ── Refresh tokens ───────────────────────────────────────────────────────────

  async createRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.db.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    })
  }

  async findRefreshToken(
    tokenHash: string,
  ): Promise<{ id: string; userId: string; expiresAt: Date } | null> {
    const record = await this.db.refreshToken.findUnique({ where: { tokenHash } })
    if (!record) return null
    return { id: record.id, userId: record.userId, expiresAt: record.expiresAt }
  }

  async deleteRefreshToken(id: string): Promise<void> {
    await this.db.refreshToken.delete({ where: { id } })
  }

  async deleteExpiredRefreshTokens(userId: string): Promise<void> {
    await this.db.refreshToken.deleteMany({
      where: { userId, expiresAt: { lt: new Date() } },
    })
  }

  async deleteAllRefreshTokens(userId: string): Promise<void> {
    await this.db.refreshToken.deleteMany({ where: { userId } })
  }

  // ─── Actualiza facultad, edad y género del usuario ───
  async updateProfile(userId: string, data: { faculty?: string; ageRange?: string; gender?: string }): Promise<void> {
    await this.db.user.update({
      where: { id: userId },
      data: {
        faculty:  data.faculty  ?? undefined,
        ageRange: data.ageRange ?? undefined,
        gender:   data.gender   ?? undefined,
      },
    })
  }
}
