'use client'
import { Crown } from 'lucide-react'
import { RARITY_COLOR, RARITY_ORDER, type Reward, type Rarity } from '@qhatu/shared'

// Rarity → gradient palette for the title pill
const GRAD: Record<Rarity, [string, string]> = {
  COMMON:    ['#6B6578', '#4A4556'],
  RARE:      ['#4DA3FF', '#2D6FE0'],
  EPIC:      ['#B14DFF', '#7B3FF2'],
  LEGENDARY: ['#FFD700', '#FF9A3D'],
  MYTHIC:    ['#FF4DA6', '#7B3FF2'],
}

/** Premium equippable title — gradient pill, rarity glow, crown on mythic. */
export function TitleChip({ reward, locked = false, size = 'md' }: { reward: Reward; locked?: boolean; size?: 'sm' | 'md' }) {
  const [g0, g1] = GRAD[reward.rarity]
  const epicPlus = RARITY_ORDER[reward.rarity] >= 2
  const mythic   = reward.rarity === 'MYTHIC'
  const pad = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-4 py-1.5 text-xs'

  if (locked) {
    return (
      <span className={`inline-flex items-center gap-1 ${pad} rounded-full font-heading font-bold text-white/35 border border-white/10 bg-white/[0.03]`}>
        {reward.name}
      </span>
    )
  }

  return (
    <span
      className={`relative inline-flex items-center gap-1.5 ${pad} rounded-full font-heading font-bold text-white overflow-hidden`}
      style={{
        background: `linear-gradient(135deg, ${g0}, ${g1})`,
        boxShadow: epicPlus
          ? `0 0 14px ${RARITY_COLOR[reward.rarity]}66, inset 0 1px 0 rgba(255,255,255,0.25)`
          : 'inset 0 1px 0 rgba(255,255,255,0.18)',
      }}
    >
      {/* shimmer sweep for legendary/mythic */}
      {epicPlus && (
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
            backgroundSize: '200% 100%',
            animation: 'rwd-shimmer 3s linear infinite',
          }}
        />
      )}
      {mythic && <Crown size={size === 'sm' ? 11 : 13} className="relative z-10 -ml-0.5" />}
      <span className="relative z-10 tracking-wide" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>{reward.name}</span>
    </span>
  )
}
