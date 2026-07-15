import type { User } from '../entities/User'

export interface CreateUserData {
  emailHash: string
  nickname: string
  avatarSeed: string
  universityDomain: string
  faculty?: string
  ageRange?: string
  gender?: string
}

export interface IUserRepository {
  findByEmailHash(emailHash: string): Promise<User | null>
  findByNickname(nickname: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  nicknameExists(nickname: string): Promise<boolean>
  emailHashExists(emailHash: string): Promise<boolean>
  updateEmailHash(userId: string, emailHash: string, universityDomain: string): Promise<void>
  updateAvatarSeed(userId: string, avatarSeed: string): Promise<void>
  updateNickname(userId: string, nickname: string): Promise<void>
  updateProfile(userId: string, data: { faculty?: string; ageRange?: string; gender?: string }): Promise<void>
  softDeleteUser(userId: string): Promise<void>
  create(data: CreateUserData): Promise<User>

  // OTP management
  createOtpRequest(emailHash: string, otpHash: string, expiresAt: Date): Promise<void>
  findValidOtpRequest(
    emailHash: string,
  ): Promise<{ id: string; otpHash: string; attempts: number } | null>
  incrementOtpAttempts(id: string): Promise<void>
  markOtpUsed(id: string): Promise<void>

  // Refresh tokens
  createRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void>
  findRefreshToken(
    tokenHash: string,
  ): Promise<{ id: string; userId: string; expiresAt: Date } | null>
  deleteRefreshToken(id: string): Promise<void>
  deleteExpiredRefreshTokens(userId: string): Promise<void>
  deleteAllRefreshTokens(userId: string): Promise<void>
}
