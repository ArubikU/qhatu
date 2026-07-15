'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Check, Loader2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  REWARDS, rewardsByCategory, qualifies, RARITY_COLOR,
  type Reward, type RewardCategory, type UserStats,
} from '@qhatu/shared'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { replaceWithFallback } from '@/lib/nav'
import { RewardVisual } from '@/components/rewards/RewardVisual'

const TABS: { id: RewardCategory; label: string }[] = [
  { id: 'FRAME',        label: 'Marcos' },
  { id: 'NAME_EFFECT',  label: 'Nombres' },
  { id: 'STREAK_BADGE', label: 'Rachas' },
  { id: 'BADGE',        label: 'Insignias' },
  { id: 'TITLE',        label: 'Títulos' },
]

const UNLOCK_LABEL = (r: Reward): string => {
  const t = r.unlock.threshold ?? 0
  switch (r.unlock.type) {
    case 'DEFAULT':   return 'Disponible'
    case 'STREAK':    return `Racha de ${t} días`
    case 'POSTS':     return `${t} posts`
    case 'LIKES':     return `${t} likes recibidos`
    case 'COMMENTS':  return `${t} comentarios`
    case 'FOLLOWERS': return `${t} seguidores`
    case 'POLLS':     return `${t} encuestas`
    case 'EPHEMERAL': return `${t} posts efímeros`
    case 'RANKING':   return t === 1 ? '#1 del ranking' : `Top ${t} ranking`
    case 'SPECIAL':   return 'Evento especial'
    default:          return ''
  }
}

const slotFor = (c: RewardCategory) => c

export default function RewardsPage() {
  const router          = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const accessToken     = useAuthStore((s) => s.accessToken)
  const qc              = useQueryClient()
  const [tab, setTab]   = useState<RewardCategory>('FRAME')

  useEffect(() => {
    if (!isAuthenticated()) replaceWithFallback(router, '/login')
  }, [isAuthenticated, router])

  const { data, isLoading } = useQuery({
    queryKey: ['rewards-me', accessToken],
    queryFn:  () => api.rewards.me(accessToken ?? ''),
    enabled:  !!accessToken,
  })

  const equip = useMutation({
    mutationFn: (vars: { rewardId: string | null; category: RewardCategory }) =>
      api.rewards.equip(vars.rewardId, vars.category, accessToken ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rewards-me'] }),
  })

  const owned    = useMemo(() => new Set(data?.owned ?? []), [data])
  const equipped = data?.equipped
  const stats    = data?.stats

  const equippedIdFor = (c: RewardCategory): string | null => {
    if (!equipped) return null
    if (c === 'FRAME') return equipped.frame
    if (c === 'NAME_EFFECT') return equipped.nameEffect
    if (c === 'TITLE') return equipped.title
    return equipped.badge // BADGE + STREAK_BADGE share
  }

  const items = rewardsByCategory(tab)
  const ownedCount = owned.size

  return (
    <div className="min-h-screen bg-carbon pb-24">
      <div className="sticky top-0 bg-carbon/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 z-20">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-white font-heading flex items-center gap-2">
            <Sparkles size={20} className="text-primary" /> Recompensas
          </h1>
          <span className="text-xs text-white/50 font-body">{ownedCount}/{REWARDS.length}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-3 py-1.5 rounded-full text-xs font-body whitespace-nowrap transition-colors ${
                tab === id ? 'bg-primary text-white' : 'bg-white/5 text-white/50 hover:text-white/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading || !stats ? (
        <div className="flex justify-center py-20"><Loader2 size={22} className="animate-spin text-primary" /></div>
      ) : (
        <div className="px-4 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((r, idx) => {
            const isOwned    = owned.has(r.id)
            const isEquipped = equippedIdFor(tab) === r.id
            const canEarn    = qualifies(r, stats as UserStats)
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: Math.min(idx * 0.025, 0.4), type: 'spring', damping: 20, stiffness: 260 }}
                whileHover={{ y: -4, scale: 1.03 }}
                className="glass rounded-2xl p-3 border flex flex-col items-center text-center gap-2"
                style={{ borderColor: isEquipped ? RARITY_COLOR[r.rarity] : 'rgba(255,255,255,0.06)' }}
              >
                <div className="h-16 flex items-center justify-center">
                  <RewardVisual reward={r} locked={!isOwned} prestige={stats?.prestige ?? 0} />
                </div>
                <div className="min-w-0 w-full">
                  <p className="text-xs font-semibold text-white font-heading truncate">{r.name}</p>
                  <p className="text-[10px] font-body" style={{ color: RARITY_COLOR[r.rarity] }}>
                    {r.rarity.toLowerCase()}
                  </p>
                </div>

                {isOwned ? (
                  <button
                    type="button"
                    disabled={equip.isPending}
                    onClick={() => equip.mutate({
                      rewardId: isEquipped ? null : r.id,
                      category: slotFor(tab),
                    })}
                    className={`w-full text-[11px] font-body py-1.5 rounded-full transition-colors flex items-center justify-center gap-1 ${
                      isEquipped ? 'bg-primary/20 text-lavender border border-primary/40' : 'bg-primary text-white'
                    }`}
                  >
                    {isEquipped ? <><Check size={11} /> Equipado</> : 'Equipar'}
                  </button>
                ) : (
                  <div className="w-full text-[10px] font-body py-1.5 rounded-full bg-white/5 text-white/40 flex items-center justify-center gap-1">
                    <Lock size={10} /> {UNLOCK_LABEL(r)}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
