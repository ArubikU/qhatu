'use client'
import {
  Sparkles, PenLine, Heart, MessageCircle, BarChart3, Ghost, Users,
  Trophy, Crown, Rocket, VenetianMask, Star, Flame,
} from 'lucide-react'
import { RARITY_COLOR, type Reward } from '@qhatu/shared'

// variant → Lucide glyph
const GLYPH: Record<string, React.ElementType> = {
  spark:  Sparkles,
  pen:    PenLine,
  heart:  Heart,
  chat:   MessageCircle,
  poll:   BarChart3,
  ghost:  Ghost,
  people: Users,
  trophy: Trophy,
  crown:  Crown,
  rocket: Rocket,
  mask:   VenetianMask,
  star:   Star,
  flame:  Flame,
}

interface RewardBadgeProps {
  reward: Reward
  size?: number
  locked?: boolean
}

/**
 * Renders a BADGE / STREAK_BADGE as a rarity-tinted hexagon gem with a glyph.
 * Locked → desaturated + low opacity.
 */
export function RewardBadge({ reward, size = 48, locked = false }: RewardBadgeProps) {
  const color = locked ? '#3A3548' : (reward.colors?.[0] ?? RARITY_COLOR[reward.rarity])
  const Glyph = GLYPH[reward.variant] ?? Star
  const gid   = `gem-${reward.id}`
  const cx = size / 2
  const r  = size / 2 - 1

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
           style={reward.animated && !locked ? { filter: `drop-shadow(0 0 6px ${color})`, animation: 'rwd-pulse 2.2s ease-in-out infinite' } : undefined}>
        <defs>
          <radialGradient id={gid} cx="50%" cy="35%" r="75%">
            <stop offset="0%"  stopColor={lighten(color)} />
            <stop offset="100%" stopColor={color} />
          </radialGradient>
        </defs>
        <polygon points={hexPoints(cx, cx, r)} fill={`url(#${gid})`} stroke={lighten(color)} strokeWidth={1} opacity={locked ? 0.35 : 1} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: locked ? 0.4 : 1 }}>
        <Glyph size={size * 0.42} color="#FFFFFF" strokeWidth={2.2} />
      </div>
    </div>
  )
}

function hexPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 90)
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

function lighten(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return hex
  const n = parseInt(m[1]!, 16)
  const r = Math.min(255, ((n >> 16) & 255) + 60)
  const g = Math.min(255, ((n >> 8) & 255) + 60)
  const b = Math.min(255, (n & 255) + 60)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
