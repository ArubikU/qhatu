import { Trophy, Medal, Flame, MessageCircle } from 'lucide-react'
import { mockRankings, RankingEntry } from '../../data/mockData'

const icons: Record<RankingEntry['type'], React.ComponentType<{ size?: number; className?: string }>> = {
  chismoso: Medal,
  publicador: Flame,
  comentarista: MessageCircle,
}

const titles: Record<RankingEntry['type'], string> = {
  chismoso: 'Top Chismoso',
  publicador: 'Top Publicador',
  comentarista: 'Top Comentarista',
}

export default function RankingStrip() {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={16} className="text-[#7B3FF2]" />
        <span className="text-white font-semibold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Rankings del día
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {mockRankings.map((entry) => {
          const Icon = icons[entry.type]
          return (
            <div
              key={entry.type}
              className="shrink-0 bg-white/5 border border-white/8 rounded-2xl p-3 min-w-[130px]"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Icon size={14} className="text-[#7B3FF2]" />
                <span className="text-white/60 text-[11px]">{titles[entry.type]}</span>
              </div>
              <p className="text-white font-semibold text-sm mb-0.5">{entry.nickname}</p>
              <p className="text-[#C8B6FF] text-xs">{entry.value} {entry.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
