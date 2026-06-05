import type { PrismaClient } from '@prisma/client'
import type { UserStats } from '@qhatu/shared'
import type { IGamificationRepository, EquippedSlots } from '../../domain/ports/IGamificationRepository'

export class PrismaGamificationRepository implements IGamificationRepository {
  constructor(private readonly db: PrismaClient) {}

  async computeStats(userId: string): Promise<UserStats> {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { nickname: true, streakCount: true, prestige: true, bestRank: true },
    })
    if (!user) {
      return { streakCount: 0, prestige: 0, postsCount: 0, likesReceived: 0, commentsCount: 0, followers: 0, pollsCreated: 0, ephemeralCount: 0, bestRank: null }
    }

    const [postAgg, postsCount, pollsCreated, ephemeralCount, commentsCount, followers] = await Promise.all([
      this.db.post.aggregate({
        where: { authorId: userId, deletedAt: null },
        _sum: { likesCount: true, fireCount: true, teaCount: true, dedCount: true },
      }),
      this.db.post.count({ where: { authorId: userId, deletedAt: null } }),
      this.db.post.count({ where: { authorId: userId, deletedAt: null, type: 'POLL' } }),
      this.db.post.count({ where: { authorId: userId, deletedAt: null, type: 'EPHEMERAL' } }),
      this.db.comment.count({ where: { authorId: userId, deletedAt: null } }),
      this.db.userFollow.count({ where: { targetNickname: user.nickname } }),
    ])

    const likesReceived =
      (postAgg._sum.likesCount ?? 0) +
      (postAgg._sum.fireCount ?? 0) +
      (postAgg._sum.teaCount ?? 0) +
      (postAgg._sum.dedCount ?? 0)

    return {
      streakCount:    user.streakCount,
      prestige:       user.prestige,
      postsCount,
      likesReceived,
      commentsCount,
      followers,
      pollsCreated,
      ephemeralCount,
      bestRank:       user.bestRank,
    }
  }

  async getOwnedRewardIds(userId: string): Promise<string[]> {
    const rows = await this.db.userReward.findMany({ where: { userId }, select: { rewardId: true } })
    return rows.map((r) => r.rewardId)
  }

  async grantRewards(userId: string, rewardIds: string[]): Promise<void> {
    if (rewardIds.length === 0) return
    await this.db.userReward.createMany({
      data: rewardIds.map((rewardId) => ({ userId, rewardId })),
      skipDuplicates: true,
    })
  }

  async getEquipped(userId: string): Promise<EquippedSlots> {
    const u = await this.db.user.findUnique({
      where: { id: userId },
      select: { equippedFrame: true, equippedNameEffect: true, equippedBadge: true, equippedTitle: true },
    })
    return {
      equippedFrame:      u?.equippedFrame ?? null,
      equippedNameEffect: u?.equippedNameEffect ?? null,
      equippedBadge:      u?.equippedBadge ?? null,
      equippedTitle:      u?.equippedTitle ?? null,
    }
  }

  async setEquipped(userId: string, slot: keyof EquippedSlots, rewardId: string | null): Promise<void> {
    await this.db.user.update({ where: { id: userId }, data: { [slot]: rewardId } })
  }

  async bumpStreak(userId: string): Promise<number> {
    const user = await this.db.user.findUnique({ where: { id: userId }, select: { streakCount: true, prestige: true, lastPostDate: true } })
    if (!user) return 0

    const today = startOfDay(new Date())
    const last  = user.lastPostDate ? startOfDay(user.lastPostDate) : null

    let next: number
    if (!last) {
      next = 1
    } else {
      const days = Math.round((today.getTime() - last.getTime()) / 86_400_000)
      if (days === 0)      next = user.streakCount        // already posted today
      else if (days === 1) next = user.streakCount + 1    // consecutive day
      else                 next = 1                        // streak broken
    }

    // Prestige = highest completed 365-day cycle ever reached (persists across resets)
    const prestige = Math.max(user.prestige, Math.floor(next / 365))

    await this.db.user.update({
      where: { id: userId },
      data:  { streakCount: next, prestige, lastPostDate: new Date() },
    })
    return next
  }
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
