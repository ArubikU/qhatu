'use client'
import { getReward, type Reward } from '@qhatu/shared'
import type { CSSProperties } from 'react'
import { useHolo, type HoloMode } from '@/components/rewards/HoloField'

interface NameEffectProps {
  effectId?: string | null
  children: string
  className?: string
}

// Variants painted by the global GLSL canvas (real shader text)
const GLSL_MODE: Record<string, HoloMode> = {
  holo: 'holo', gold: 'gold', chrome: 'chrome', blood: 'blood', rainbow: 'rainbow',
}

/**
 * Renders a nickname with its equipped effect.
 *  - holo/gold/chrome/blood/rainbow → real GLSL via the global HoloField canvas
 *  - glitch → layered RGB-split DOM
 *  - rest → CSS gradient/glow
 */
export function NameEffect({ effectId, children, className }: NameEffectProps) {
  const reward = effectId ? getReward(effectId) : undefined
  if (!reward || reward.category !== 'NAME_EFFECT') {
    return <span className={className}>{children}</span>
  }
  if (GLSL_MODE[reward.variant]) {
    return <HoloName text={children} mode={GLSL_MODE[reward.variant]!} className={className} />
  }
  if (reward.variant === 'glitch') return <GlitchText className={className}>{children}</GlitchText>

  const { style, cls } = effectStyle(reward)
  return <span className={`${className ?? ''} ${cls}`.trim()} style={style}>{children}</span>
}

/** Hidden span (reserves layout) painted by the global GLSL HoloField canvas. */
function HoloName({ text, mode, className }: { text: string; mode: HoloMode; className?: string }) {
  const ref = useHolo(text, mode)
  return <span ref={ref} className={className} style={{ visibility: 'hidden' }}>{text}</span>
}

/** RGB-split glitch — 2 coloured copies clipped + offset behind the white text. */
function GlitchText({ children, className }: { children: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className ?? ''}`.trim()}>
      <span className="relative z-10 text-white">{children}</span>
      <span aria-hidden style={{ position: 'absolute', inset: 0, color: '#00E5FF', animation: 'rwd-glitch-a 2.2s infinite linear', opacity: 0.85 }}>{children}</span>
      <span aria-hidden style={{ position: 'absolute', inset: 0, color: '#FF4D6D', animation: 'rwd-glitch-b 2.6s infinite linear', opacity: 0.85 }}>{children}</span>
    </span>
  )
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
      return { style: { backgroundImage: 'linear-gradient(95deg,#8C6A1E,#FFD700,#FFF6C9,#FFB23E,#8C6A1E)', filter: 'url(#qhatu-foil)' }, cls: 'rwd-text-anim' }

    case 'glitch':
      return { style: { color: c0, textShadow: `1.5px 0 ${c1}, -1.5px 0 ${c2}`, animation: 'rwd-glitch 0.8s steps(2) infinite' }, cls: '' }

    case 'matrix':
      return { style: { color: '#00FF66', textShadow: '0 0 6px #00FF66', fontFamily: 'monospace' }, cls: '' }

    case 'holo':
      // iridescent gradient + animated procedural sheen (SVG turbulence)
      return { style: { backgroundImage: 'linear-gradient(90deg,#7B3FF2,#00E5FF,#9BFF3D,#FF4DA6,#7B3FF2)', filter: 'url(#qhatu-holo)', animation: 'rwd-shimmer 2.5s linear infinite, rwd-rainbow 8s linear infinite' }, cls: 'rwd-text-static' }

    case 'blood':
      return { style: { backgroundImage: 'linear-gradient(95deg,#7A0010,#FF1A3C,#FF5566,#8B0000,#7A0010)', filter: 'url(#qhatu-holo)', animation: 'rwd-pulse 2s ease-in-out infinite, rwd-shimmer 4s linear infinite' }, cls: 'rwd-text-static' }

    case 'chrome':
      return { style: { backgroundImage: 'linear-gradient(90deg,#6B7280,#FFFFFF,#9BA3B5,#E8E8F0,#6B7280)', filter: 'url(#qhatu-foil)' }, cls: 'rwd-text-anim' }

    case 'shadow':
      return { style: { color: c0, textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.6)' }, cls: '' }

    case 'plain':
    default:
      return { style: { color: '#FFFFFF' }, cls: '' }
  }
}
