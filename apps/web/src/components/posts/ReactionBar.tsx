'use client'
import { Heart, Flame, Coffee, Skull } from 'lucide-react'
import type { ReactionType } from '@/lib/api'

interface ReactionBarProps {
  likesCount: number
  fireCount: number
  teaCount: number
  dedCount: number
  myReaction: ReactionType | null
  onReact: (type: ReactionType) => void
  loading?: boolean
}

const REACTIONS: { type: ReactionType; icon: React.ElementType; label: string; activeColor: string }[] = [
  { type: 'LIKE', icon: Heart,   label: 'like',  activeColor: 'text-pink-400' },
  { type: 'FIRE', icon: Flame,   label: 'fuego', activeColor: 'text-orange-400' },
  { type: 'TEA',  icon: Coffee,  label: 'tea',   activeColor: 'text-yellow-400' },
  { type: 'DED',  icon: Skull,   label: 'ded',   activeColor: 'text-blue-400' },
]

const COUNT_MAP: Record<ReactionType, 'likesCount' | 'fireCount' | 'teaCount' | 'dedCount'> = {
  LIKE: 'likesCount',
  FIRE: 'fireCount',
  TEA:  'teaCount',
  DED:  'dedCount',
}

export function ReactionBar({
  likesCount, fireCount, teaCount, dedCount,
  myReaction, onReact, loading,
}: ReactionBarProps) {
  const counts = { likesCount, fireCount, teaCount, dedCount }

  return (
    <div className="flex items-center gap-1">
      {REACTIONS.map(({ type, icon: Icon, activeColor }) => {
        const count  = counts[COUNT_MAP[type]]
        const active = myReaction === type

        return (
          <button
            key={type}
            type="button"
            onClick={() => onReact(type)}
            disabled={loading}
            className={[
              'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150',
              active
                ? `bg-white/10 ${activeColor}`
                : 'text-white/40 hover:text-white/70 hover:bg-white/5',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            ].join(' ')}
          >
            <Icon size={14} className={active ? 'fill-current' : ''} />
            {count > 0 && <span>{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
