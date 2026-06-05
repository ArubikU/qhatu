import type { PrismaClient } from '@prisma/client'
import type { ISocialRepository } from '../../domain/ports/ISocialRepository'

export class PrismaSocialRepository implements ISocialRepository {
  constructor(private readonly db: PrismaClient) {}

  async followUser(followerId: string, targetNickname: string): Promise<void> {
    await this.db.userFollow.upsert({
      where: { followerId_targetNickname: { followerId, targetNickname } },
      create: { followerId, targetNickname },
      update: {},
    })
  }

  async unfollowUser(followerId: string, targetNickname: string): Promise<void> {
    await this.db.userFollow.deleteMany({
      where: { followerId, targetNickname },
    })
  }

  async isFollowingUser(followerId: string, targetNickname: string): Promise<boolean> {
    const count = await this.db.userFollow.count({
      where: { followerId, targetNickname },
    })
    return count > 0
  }

  async getFollowedNicknames(followerId: string): Promise<string[]> {
    const rows = await this.db.userFollow.findMany({
      where: { followerId, targetNickname: { not: null } },
      select: { targetNickname: true },
    })
    return rows.map((r) => r.targetNickname!).filter(Boolean)
  }
}
