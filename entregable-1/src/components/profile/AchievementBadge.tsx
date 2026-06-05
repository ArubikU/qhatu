import { Lock, CheckCircle, LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface AchievementBadgeProps {
  icon: LucideIcon
  name: string
  description: string
  status: 'unlocked' | 'locked' | 'progress'
  progress?: { current: number; total: number }
}

export default function AchievementBadge({
  icon: Icon,
  name,
  description,
  status,
  progress,
}: AchievementBadgeProps) {
  const isUnlocked = status === 'unlocked'
  const isProgress = status === 'progress'

  return (
    <div
      className={cn(
        'bg-white/5 border rounded-2xl p-3 flex flex-col gap-2 transition-all',
        isUnlocked
          ? 'border-[#7B3FF2] bg-[#7B3FF2]/5'
          : 'border-white/10 opacity-50'
      )}
    >
      <div className="flex items-start justify-between">
        {isUnlocked || isProgress ? (
          <Icon size={20} className={isUnlocked ? 'text-[#7B3FF2]' : 'text-white/60'} />
        ) : (
          <Lock size={20} className="text-white/40" />
        )}
        {isUnlocked && (
          <CheckCircle size={14} className="text-[#7B3FF2]" />
        )}
      </div>
      <div>
        <p className="text-white text-xs font-semibold leading-tight">{name}</p>
        <p className="text-white/40 text-[10px] mt-0.5">{description}</p>
      </div>
      {isProgress && progress && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-white/40">{progress.current}/{progress.total}</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7B3FF2] rounded-full transition-all"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
