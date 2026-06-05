import {
  unlockedRewardIds, getReward, REWARDS,
  type RewardCategory, type UserStats,
} from '@qhatu/shared'
import type { IGamificationRepository, EquippedSlots } from '../../domain/ports/IGamificationRepository'

const CATEGORY_SLOT: Record<RewardCategory, keyof EquippedSlots | null> = {
  FRAME:        'equippedFrame',
  NAME_EFFECT:  'equippedNameEffect',
  BADGE:        'equippedBadge',
  TITLE:        'equippedTitle',
  STREAK_BADGE: 'equippedBadge',   // streak badges share the badge slot
}

export interface GamificationProfile {
  stats: UserStats
  owned: string[]
  equipped: EquippedSlots
}

export class GamificationService {
  constructor(private readonly repo: IGamificationRepository) {}

  /** Recompute stats, grant any newly-earned threshold rewards. Returns owned ids. */
  async sync(userId: string, special: string[] = []): Promise<string[]> {
    const stats   = await this.repo.computeStats(userId)
    const owned   = new Set(await this.repo.getOwnedRewardIds(userId))
    const earned  = unlockedRewardIds(stats)

    // "Coleccionista" special: owns ≥ 40 rewards
    const toGrant = earned.filter((id) => !owned.has(id))
    for (const s of special) if (!owned.has(s)) toGrant.push(s)

    if (toGrant.length) {
      await this.repo.grantRewards(userId, [...new Set(toGrant)])
      for (const id of toGrant) owned.add(id)
    }

    // Coleccionista title once they hold a big collection
    if (owned.size >= 40) {
      const col = REWARDS.find((r) => r.name === 'Coleccionista')
      if (col && !owned.has(col.id)) {
        await this.repo.grantRewards(userId, [col.id])
        owned.add(col.id)
      }
    }

    return [...owned]
  }

  async getProfile(userId: string): Promise<GamificationProfile> {
    const [stats, owned, equipped] = await Promise.all([
      this.repo.computeStats(userId),
      this.repo.getOwnedRewardIds(userId),
      this.repo.getEquipped(userId),
    ])
    return { stats, owned, equipped }
  }

  /** Equip (or unequip with rewardId=null) a cosmetic. Validates ownership + category. */
  async equip(userId: string, rewardId: string | null, category: RewardCategory): Promise<EquippedSlots> {
    const slot = CATEGORY_SLOT[category]
    if (!slot) throw new Error('Categoría no equipable.')

    if (rewardId !== null) {
      const reward = getReward(rewardId)
      if (!reward) throw new Error('Recompensa no encontrada.')
      if (CATEGORY_SLOT[reward.category] !== slot) throw new Error('La recompensa no corresponde a esta ranura.')
      const owned = await this.repo.getOwnedRewardIds(userId)
      if (!owned.includes(rewardId)) throw new Error('Aún no desbloqueas esta recompensa.')
    }

    await this.repo.setEquipped(userId, slot, rewardId)
    return this.repo.getEquipped(userId)
  }

  /** Streak bump on post — also returns the streak-milestone reward to grant, if any. */
  async onPost(userId: string, opts: { revealedIdentity: boolean; isEphemeral: boolean }): Promise<void> {
    await this.repo.bumpStreak(userId)
    const special: string[] = []
    if (opts.revealedIdentity) {
      const mask = REWARDS.find((r) => r.variant === 'mask' && r.category === 'BADGE')
      if (mask) special.push(mask.id)
    }
    await this.sync(userId, special)
  }
}
