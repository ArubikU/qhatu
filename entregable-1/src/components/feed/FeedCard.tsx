import { useState } from 'react'
import {
  ThumbsUp,
  Flame,
  Eye,
  Skull,
  MessageCircle,
  Share2,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { Post } from '../../data/mockData'
import { cn } from '../../lib/utils'

interface FeedCardProps {
  post: Post
  compact?: boolean
}

export default function FeedCard({ post, compact = false }: FeedCardProps) {
  const [reactions, setReactions] = useState(post.reactions)
  const [activeReactions, setActiveReactions] = useState<Set<string>>(new Set())

  const toggleReaction = (type: keyof typeof reactions) => {
    const isActive = activeReactions.has(type)
    setActiveReactions((prev) => {
      const next = new Set(prev)
      isActive ? next.delete(type) : next.add(type)
      return next
    })
    setReactions((prev) => ({
      ...prev,
      [type]: isActive ? prev[type] - 1 : prev[type] + 1,
    }))
  }

  const formatTime = (mins: number) => {
    if (mins < 60) return `hace ${mins} min`
    const h = Math.floor(mins / 60)
    if (h < 24) return `hace ${h}h`
    return `hace ${Math.floor(h / 24)}d`
  }

  const reactionButtons = [
    { type: 'likes' as const, icon: ThumbsUp, label: 'Like' },
    { type: 'fire' as const, icon: Flame, label: 'Fire' },
    { type: 'tea' as const, icon: Eye, label: 'Tea' },
    { type: 'ded' as const, icon: Skull, label: 'Ded' },
  ]

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/8 rounded-3xl p-4 mb-3">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7B3FF2] to-[#4B17B6] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {post.author.avatarSeed}
          </div>
          <div>
            <p className="text-white font-medium text-sm">{post.author.nickname}</p>
            <p className="text-white/40 text-xs">{formatTime(post.minutesAgo)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {post.author.streakDays > 0 && (
            <div className="flex items-center gap-1 bg-orange-500/20 rounded-full px-2 py-0.5">
              <Zap size={10} className="text-orange-400" />
              <span className="text-orange-400 text-[10px] font-medium">
                {post.author.streakDays}d
              </span>
            </div>
          )}
          {post.isTrending && (
            <div className="flex items-center gap-1 bg-[#7B3FF2]/20 rounded-full px-2 py-0.5">
              <TrendingUp size={10} className="text-[#C8B6FF]" />
              <span className="text-[#C8B6FF] text-[10px] font-medium">Trending</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <p
        className={cn(
          'text-white/90 text-sm leading-relaxed mb-3',
          compact && 'line-clamp-3'
        )}
      >
        {post.content}
      </p>

      {/* Reactions */}
      <div className="flex items-center gap-1 flex-wrap">
        {reactionButtons.map(({ type, icon: Icon }) => {
          const active = activeReactions.has(type)
          return (
            <button
              key={type}
              onClick={() => toggleReaction(type)}
              className={cn(
                'flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
                active
                  ? 'bg-[#7B3FF2]/30 text-[#C8B6FF] border border-[#7B3FF2]/50'
                  : 'bg-white/5 text-white/50 border border-white/5 hover:bg-white/10'
              )}
            >
              <Icon size={13} />
              <span>{reactions[type]}</span>
            </button>
          )
        })}

        <div className="flex items-center gap-2 ml-auto">
          <button className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors px-2 py-1.5">
            <MessageCircle size={14} />
            <span className="text-xs">{post.comments}</span>
          </button>
          <button className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors px-2 py-1.5">
            <Share2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
