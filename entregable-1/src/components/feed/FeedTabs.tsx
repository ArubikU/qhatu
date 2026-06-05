import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

type Tab = 'para-ti' | 'tendencias' | 'recientes'

interface FeedTabsProps {
  active: Tab
  onChange: (tab: Tab) => void
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'para-ti', label: 'Para ti' },
  { id: 'tendencias', label: 'Tendencias' },
  { id: 'recientes', label: 'Recientes' },
]

export default function FeedTabs({ active, onChange }: FeedTabsProps) {
  return (
    <div className="sticky top-[57px] z-30 bg-[#0F0D17]/80 backdrop-blur-xl border-b border-white/5 px-4 py-2 flex gap-2">
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-[#7B3FF2] text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
            )}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="tabUnderline"
                className="absolute inset-0 rounded-full bg-[#7B3FF2] -z-10"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
