'use client'
import { getReward, RARITY_COLOR, type Reward } from '@qhatu/shared'
import { WebGLFrame } from '@/components/rewards/WebGLFrame'

interface RewardFrameProps {
  /** Frame reward id (FRAME category). If undefined/unknown → no frame, just children. */
  frameId?: string | null
  size: number
  children: React.ReactNode
}

/**
 * Wraps an avatar with a decorative SVG frame drawn per-variant.
 * Pure SVG + CSS — no external assets.
 */
export function RewardFrame({ frameId, size, children }: RewardFrameProps) {
  const reward = frameId ? getReward(frameId) : undefined
  if (!reward || reward.category !== 'FRAME') return <>{children}</>

  // Frame draws slightly larger than the avatar
  const pad   = Math.round(size * 0.12)
  const total = size + pad * 2

  // MYTHIC frames render a real animated WebGL plasma ring
  const useWebGL = reward.rarity === 'MYTHIC'
  const colors = reward.colors?.length ? reward.colors : [RARITY_COLOR[reward.rarity]]

  return (
    <div style={{ position: 'relative', width: total, height: total, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {useWebGL ? <WebGLFrame colors={colors} size={total} /> : <FrameSvg reward={reward} size={total} />}
      </div>
      <div style={{ width: size, height: size }}>{children}</div>
    </div>
  )
}

function FrameSvg({ reward, size }: { reward: Reward; size: number }) {
  const colors = reward.colors?.length ? reward.colors : [RARITY_COLOR[reward.rarity]]
  const c0 = colors[0]!
  const c1 = colors[1] ?? c0
  const c2 = colors[2] ?? c1
  const c3 = colors[3] ?? c2
  const cx = size / 2
  const cy = size / 2
  const r  = size / 2 - size * 0.04
  const sw = Math.max(2, size * 0.05)   // stroke width
  const gid = `g-${reward.id}`
  const anim = reward.animated

  const gradStops = (
    <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stopColor={c0} />
      <stop offset="50%"  stopColor={c1} />
      <stop offset="100%" stopColor={c2} />
    </linearGradient>
  )

  // Per-variant ring rendering
  let ring: React.ReactNode
  switch (reward.variant) {
    case 'dashed':
      ring = <circle cx={cx} cy={cy} r={r} fill="none" stroke={c0} strokeWidth={sw} strokeDasharray={`${sw * 2} ${sw * 1.5}`} strokeLinecap="round" />
      break
    case 'double':
      ring = <>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={c0} strokeWidth={sw * 0.6} />
        <circle cx={cx} cy={cy} r={r - sw * 1.3} fill="none" stroke={c1} strokeWidth={sw * 0.6} />
      </>
      break
    case 'glow':
    case 'neon':
      ring = <circle cx={cx} cy={cy} r={r} fill="none" stroke={c0} strokeWidth={sw}
                     style={{ filter: `drop-shadow(0 0 ${sw}px ${c0})`, ...(anim ? { animation: 'rwd-pulse 1.8s ease-in-out infinite' } : {}) }} />
      break
    case 'andean':
      // stepped / geometric pattern via square-cap long dashes
      ring = <circle cx={cx} cy={cy} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={sw}
                     strokeDasharray={`${sw * 1.8} ${sw * 0.9}`} strokeLinecap="butt" />
      break
    case 'fire':
      ring = <circle cx={cx} cy={cy} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={sw}
                     style={{ filter: `drop-shadow(0 0 ${sw * 1.2}px ${c0})`, animation: 'rwd-flicker 0.9s ease-in-out infinite' }} />
      break
    case 'ice':
      ring = <>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={sw} />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2
          return <line key={i} x1={cx + Math.cos(a) * (r - sw)} y1={cy + Math.sin(a) * (r - sw)}
                       x2={cx + Math.cos(a) * (r + sw * 0.6)} y2={cy + Math.sin(a) * (r + sw * 0.6)}
                       stroke={c0} strokeWidth={sw * 0.4} strokeLinecap="round" />
        })}
      </>
      break
    case 'leaves':
      ring = <>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={c1} strokeWidth={sw * 0.5} />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          const px = cx + Math.cos(a) * r
          const py = cy + Math.sin(a) * r
          return <circle key={i} cx={px} cy={py} r={sw * 0.9} fill={c0} />
        })}
      </>
      break
    case 'gold':
      ring = <circle cx={cx} cy={cy} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={sw}
                     style={{ filter: `drop-shadow(0 0 ${sw}px ${c0})`, ...(anim ? { animation: 'rwd-pulse 2.4s ease-in-out infinite' } : {}) }} />
      break
    case 'cosmic':
    case 'aurora':
      ring = <g style={anim ? { transformOrigin: 'center', animation: 'rwd-spin 8s linear infinite' } : undefined}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={sw}
                style={{ filter: `drop-shadow(0 0 ${sw}px ${c2})` }} />
      </g>
      break
    case 'glitch':
      ring = <g style={anim ? { animation: 'rwd-glitch 0.7s steps(2) infinite' } : undefined}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={c0} strokeWidth={sw * 0.7} opacity={0.8} />
        <circle cx={cx + sw * 0.4} cy={cy} r={r} fill="none" stroke={c1} strokeWidth={sw * 0.7} opacity={0.7} />
      </g>
      break
    case 'crown':
      ring = <>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={sw}
                style={{ filter: `drop-shadow(0 0 ${sw}px ${c0})`, ...(anim ? { animation: 'rwd-pulse 2s ease-in-out infinite' } : {}) }} />
        {/* crown on top */}
        <path d={crownPath(cx, cy - r, size * 0.16)} fill={c0} stroke={c1} strokeWidth={1} />
      </>
      break
    case 'ring':
    default:
      ring = <circle cx={cx} cy={cy} r={r} fill="none" stroke={c0} strokeWidth={sw} />
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>{gradStops}</defs>
      {ring}
    </svg>
  )
}

function crownPath(cx: number, topY: number, w: number): string {
  const h = w * 0.7
  const l = cx - w / 2
  const rgt = cx + w / 2
  const yB = topY + h * 0.2
  const yT = topY - h * 0.6
  return `M ${l} ${yB} L ${l} ${topY - h * 0.1} L ${cx - w * 0.25} ${yT} L ${cx} ${topY - h * 0.05} L ${cx + w * 0.25} ${yT} L ${rgt} ${topY - h * 0.1} L ${rgt} ${yB} Z`
}
