'use client'
import { motion } from 'framer-motion'
import { Flame, Zap, Snowflake, Gem, Sparkles, Crown, Award } from 'lucide-react'
import { prestigeMaterial, type Reward } from '@qhatu/shared'

// Per-tier visual: glyph + animation differ by streak style
const STYLE: Record<string, { glyph: React.ElementType; spin?: boolean; float?: boolean; pulse?: boolean }> = {
  ember:   { glyph: Zap,       pulse: true },
  flame:   { glyph: Flame,     float: true },
  fire:    { glyph: Flame,     float: true },
  blaze:   { glyph: Flame,     pulse: true, float: true },
  azure:   { glyph: Snowflake, spin: true },
  gold:    { glyph: Award,     pulse: true },
  emerald: { glyph: Gem,       pulse: true },
  magenta: { glyph: Sparkles,  spin: true },
  cosmic:  { glyph: Sparkles,  spin: true, pulse: true },
  phoenix: { glyph: Crown,     pulse: true, float: true },
}

interface Props { reward: Reward; size?: number; locked?: boolean; prestige?: number }

export function StreakBadge({ reward, size = 56, locked = false, prestige = 0 }: Props) {
  const mat = prestige > 0 ? prestigeMaterial(prestige) : null
  const s   = STYLE[reward.variant] ?? STYLE.flame!
  const cols = reward.colors?.length ? reward.colors : ['#FF8A3D', '#FF4D00']
  const c0 = locked ? '#3A3548' : cols[0]!
  const c1 = locked ? '#2A2438' : (cols[1] ?? c0)
  const c2 = cols[2] ?? c1
  const Glyph = s.glyph
  const gid = `st-${reward.id}`

  return (
    <motion.div
      style={{ width: size, height: size, position: 'relative' }}
      animate={s.float && !locked ? { y: [0, -3, 0] } : undefined}
      transition={s.float ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {/* Aura */}
      {!locked && (
        <div
          style={{ position: 'absolute', inset: -2, borderRadius: '50%', background: `radial-gradient(circle, ${c0}55, transparent 70%)`, filter: 'blur(4px)' }}
        />
      )}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'relative' }}>
        <defs>
          <radialGradient id={gid} cx="50%" cy="35%" r="75%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="60%" stopColor={c0} />
            <stop offset="100%" stopColor={c2} />
          </radialGradient>
        </defs>
        <motion.circle
          cx={size / 2} cy={size / 2} r={size / 2 - 2}
          fill={`url(#${gid})`} stroke={locked ? '#2A2438' : c1} strokeWidth={1.5}
          opacity={locked ? 0.4 : 1}
          animate={s.spin && !locked ? { rotate: 360 } : undefined}
          transition={s.spin ? { duration: 8, repeat: Infinity, ease: 'linear' } : undefined}
          style={{ transformOrigin: 'center' }}
        />
      </svg>
      <motion.div
        style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: locked ? 0.4 : 1 }}
        animate={s.pulse && !locked ? { scale: [1, 1.12, 1] } : undefined}
        transition={s.pulse ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        <Glyph size={size * 0.4} color="#FFFFFF" strokeWidth={2.2} fill={locked ? 'none' : 'rgba(255,255,255,0.25)'} />
      </motion.div>

      {/* Prestige material ring + tier pip */}
      {mat && !locked && (
        <>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0 }}>
            <circle cx={size / 2} cy={size / 2} r={size / 2 - 0.5} fill="none"
              stroke={mat.color} strokeWidth={2.5}
              style={{ filter: `drop-shadow(0 0 4px ${mat.glow})` }} />
          </svg>
          <span
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold px-1.5 py-0.5 rounded-full font-heading"
            style={{ background: mat.color, color: '#0F0D17' }}
          >
            {prestige > 1 ? `${mat.name} ${prestige}` : mat.name}
          </span>
        </>
      )}
    </motion.div>
  )
}
