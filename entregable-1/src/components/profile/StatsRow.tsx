import { FileText, Zap, ThumbsUp } from 'lucide-react'

interface StatsRowProps {
  posts: number
  streakDays: number
  totalLikes: number
}

export default function StatsRow({ posts, streakDays, totalLikes }: StatsRowProps) {
  const stats = [
    { icon: FileText, value: posts, label: 'posts' },
    { icon: Zap, value: streakDays, label: 'días racha' },
    { icon: ThumbsUp, value: totalLikes, label: 'likes' },
  ]

  return (
    <div className="flex gap-3 justify-center">
      {stats.map(({ icon: Icon, value, label }) => (
        <div
          key={label}
          className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2"
        >
          <Icon size={14} className="text-[#7B3FF2]" />
          <span className="text-white font-semibold text-sm">{value}</span>
          <span className="text-white/50 text-xs">{label}</span>
        </div>
      ))}
    </div>
  )
}
