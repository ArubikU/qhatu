import type { UserStats } from '@qhatu/shared'

export interface EquippedSlots {
  equippedFrame: string | null
  equippedNameEffect: string | null
  equippedBadge: string | null
  equippedTitle: string | null
}

export interface IGamificationRepository {
  /** Aggregate live stats for unlock evaluation. */
  computeStats(userId: string): Promise<UserStats>
  getOwnedRewardIds(userId: string): Promise<string[]>
  grantRewards(userId: string, rewardIds: string[]): Promise<void>
  getEquipped(userId: string): Promise<EquippedSlots>
  setEquipped(userId: string, slot: keyof EquippedSlots, rewardId: string | null): Promise<void>
  /** Advance/reset the daily streak based on lastPostDate. Returns new streak count. */
  bumpStreak(userId: string): Promise<number>
}
