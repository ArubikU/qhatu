import { RewardFrame } from '@/components/rewards/RewardFrame'

interface AvatarProps {
  seed: string
  size?: number
  className?: string
  /** Equipped FRAME reward id — draws a decorative frame around the avatar. */
  frameId?: string | null
  /** Optional real image (e.g. seeded Twitter pfp) — overrides the generated letter. */
  imageUrl?: string | null
}

// Deterministic color palette from seed
const COLORS = [
  '#7B3FF2', '#4B17B6', '#C8B6FF', '#10B981',
  '#F59E0B', '#EF4444', '#3B82F6', '#EC4899',
  '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
]

function seedToIndex(seed: string, len: number): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash % len
}

export function Avatar({ seed, size = 40, className = '', frameId, imageUrl }: AvatarProps) {
  const bg     = COLORS[seedToIndex(seed, COLORS.length)]!
  const letter = (seed[0] ?? 'Q').toUpperCase()

  const circle = imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt=""
      referrerPolicy="no-referrer"
      className={`rounded-full object-cover flex-shrink-0 ${className}`}
      style={{ width: size, height: size, background: bg }}
    />
  ) : (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white select-none ${className}`}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.4 }}
    >
      {letter}
    </div>
  )

  if (frameId) {
    return <RewardFrame frameId={frameId} size={size}>{circle}</RewardFrame>
  }
  return circle
}
