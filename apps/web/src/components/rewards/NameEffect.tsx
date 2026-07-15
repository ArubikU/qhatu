'use client'
import { getReward, type Reward } from '@qhatu/shared'
import type { CSSProperties } from 'react'

interface NameEffectProps {
  effectId?: string | null
  children: string
  className?: string
}

/**
 * Renders a nickname with its equipped text effect (pure CSS).
 * Falls back to plain white text if no/unknown effect.
 */
export function NameEffect({ effectId, children, className }: NameEffectProps) {
  const reward = effectId ? getReward(effectId) : undefined
  if (!reward || reward.category !== 'NAME_EFFECT') {
    return <span className={className}>{children}</span>
  }
  const { style, cls } = effectStyle(reward)
  return <span className={`${className ?? ''} ${cls}`.trim()} style={style}>{children}</span>
}

function effectStyle(r: Reward): { style: CSSProperties; cls: string } {
  const colors = r.colors ?? []
  const c0 = colors[0] ?? '#FFFFFF'
  const c1 = colors[1] ?? c0
  const c2 = colors[2] ?? c1
  const grad = (cs: string[]) => `linear-gradient(90deg, ${cs.join(', ')})`

  switch (r.variant) {
    case 'gradient':
      return { style: { backgroundImage: grad([c0, c1, c0]) }, cls: r.animated ? 'rwd-text-anim' : 'rwd-text-static' }

    case 'glow':
      return { style: { color: c0, textShadow: `0 0 8px ${c0}${r.animated ? '' : ''}`, animation: r.animated ? 'rwd-pulse 1.6s ease-in-out infinite' : undefined }, cls: '' }

    case 'fire':
      return { style: { backgroundImage: grad(['#FF6B00', '#FFD700', '#FF6B00']) }, cls: 'rwd-text-anim' }

    case 'rainbow':
      return { style: { backgroundImage: 'linear-gradient(90deg,#FF4D6D,#FFB23E,#9BFF3D,#00E5FF,#7B3FF2,#FF4D6D)', animation: 'rwd-shimmer 3s linear infinite, rwd-rainbow 6s linear infinite' }, cls: 'rwd-text-static' }

    case 'gold':
      return { style: { backgroundImage: 'linear-gradient(90deg,#FFD700,#FFF6C9,#FFB23E,#FFD700)' }, cls: 'rwd-text-anim' }

    case 'glitch':
      return { style: { color: c0, textShadow: `1.5px 0 ${c1}, -1.5px 0 ${c2}`, animation: 'rwd-glitch 0.8s steps(2) infinite' }, cls: '' }

    case 'matrix':
      return { style: { color: '#00FF66', textShadow: '0 0 6px #00FF66', fontFamily: 'monospace' }, cls: '' }

    case 'holo':
      return { style: { backgroundImage: 'linear-gradient(90deg,#7B3FF2,#00E5FF,#FF4DA6,#7B3FF2)', animation: 'rwd-shimmer 2.5s linear infinite, rwd-rainbow 8s linear infinite' }, cls: 'rwd-text-static' }

    case 'blood':
      return { style: { backgroundImage: grad(['#FF1A3C', '#8B0000', '#FF1A3C']), animation: 'rwd-pulse 2s ease-in-out infinite, rwd-shimmer 4s linear infinite' }, cls: 'rwd-text-static' }

    case 'chrome':
      return { style: { backgroundImage: 'linear-gradient(90deg,#9BA3B5,#FFFFFF,#9BA3B5,#E8E8F0)' }, cls: 'rwd-text-anim' }

    case 'shadow':
      return { style: { color: c0, textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.6)' }, cls: '' }

    case 'plain':
    default:
      return { style: { color: '#FFFFFF' }, cls: '' }
  }
}
