'use client'
import type { Reward } from '@qhatu/shared'
import { Avatar } from '@/components/common/Avatar'
import { NameEffect } from '@/components/rewards/NameEffect'
import { RewardBadge } from '@/components/rewards/RewardBadge'
import { StreakBadge } from '@/components/rewards/StreakBadge'

/** Renders a representative preview of any reward (for the gallery tiles). */
export function RewardVisual({ reward, size = 56, locked = false, prestige = 0 }: { reward: Reward; size?: number; locked?: boolean; prestige?: number }) {
  switch (reward.category) {
    case 'FRAME':
      return (
        <div style={{ opacity: locked ? 0.4 : 1, filter: locked ? 'grayscale(0.8)' : undefined }}>
          <Avatar seed="Qhatu" size={size} frameId={reward.id} />
        </div>
      )

    case 'NAME_EFFECT':
      // Always render the effect (dimmed if locked) so users can preview it
      return (
        <div style={{ opacity: locked ? 0.5 : 1 }} className="text-base font-bold font-heading">
          <NameEffect effectId={reward.id}>Nickname</NameEffect>
        </div>
      )

    case 'STREAK_BADGE':
      return <StreakBadge reward={reward} size={size} locked={locked} prestige={prestige} />

    case 'BADGE':
      return <RewardBadge reward={reward} size={size} locked={locked} />

    case 'TITLE':
      return (
        <span
          className="text-xs font-semibold px-3 py-1.5 rounded-full font-body"
          style={{
            color: locked ? '#6B6578' : (reward.colors?.[0] ?? '#C8B6FF'),
            background: locked ? 'rgba(255,255,255,0.04)' : `${reward.colors?.[0] ?? '#7B3FF2'}1a`,
            border: `1px solid ${locked ? '#2A2438' : (reward.colors?.[0] ?? '#7B3FF2')}55`,
          }}
        >
          {reward.name}
        </span>
      )

    default:
      return null
  }
}
