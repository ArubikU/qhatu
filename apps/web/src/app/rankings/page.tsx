'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Heart, PenLine, MessageCircle, Loader2, ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { getReward } from '@qhatu/shared'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { Avatar } from '@/components/common/Avatar'

type RType = 'LIKES_RECEIVED' | 'POSTS_PUBLISHED' | 'COMMENTS_MADE'
const TABS: { id: RType; label: string; icon: React.ElementType }[] = [
  { id: 'LIKES_RECEIVED',  label: 'Likes',     icon: Heart },
  { id: 'POSTS_PUBLISHED', label: 'Posts',     icon: PenLine },
  { id: 'COMMENTS_MADE',   label: 'Comentarios', icon: MessageCircle },
]
const MEDAL = ['🥇', '🥈', '🥉']

export default function RankingsPage() {
  const router          = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const accessToken     = useAuthStore((s) => s.accessToken)
  const [type, setType] = useState<RType>('LIKES_RECEIVED')

  useEffect(() => {
    if (!isAuthenticated()) router.replace('/login')
  }, [isAuthenticated, router])

  const { data, isFetching } = useQuery({
    queryKey: ['rankings', type, accessToken],
    queryFn:  () => api.rankings.get(type, accessToken ?? ''),
    enabled:  !!accessToken,
    staleTime: 60_000,
  })

  const entries = data?.entries ?? []

  return (
    <div className="min-h-screen bg-carbon pb-24">
      <div className="sticky top-0 bg-carbon/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 z-20">
        <div className="flex items-center gap-2 mb-3">
          <button type="button" onClick={() => router.back()} className="text-white/60 hover:text-white">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-white font-heading flex items-center gap-2">
            <Trophy size={20} className="text-yellow-400" /> Ranking diario
          </h1>
        </div>
        <div className="flex gap-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setType(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body transition-colors ${
                type === id ? 'bg-primary text-white' : 'bg-white/5 text-white/50 hover:text-white/80'
              }`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-2">
        {isFetching && entries.length === 0 ? (
          <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-primary" /></div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Trophy size={24} className="text-primary" />
            </div>
            <p className="text-white/50 text-sm font-body">Aún no hay ranking hoy. ¡Sé el primero en publicar!</p>
          </div>
        ) : (
          entries.map((e) => (
            <motion.div
              key={e.rank + e.nickname}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-3 p-3 rounded-2xl border ${
                e.rank <= 3 ? 'bg-primary/5 border-primary/20' : 'bg-white/[0.02] border-white/5'
              }`}
            >
              <span className="w-7 text-center text-sm font-bold font-heading text-white/70">
                {e.rank <= 3 ? MEDAL[e.rank - 1] : e.rank}
              </span>
              <Avatar seed={e.avatarSeed} size={36} frameId={e.frame} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white font-heading truncate">{e.nickname}</p>
                {e.title && getReward(e.title) && (
                  <span className="text-[10px] text-lavender font-body">{getReward(e.title)!.name}</span>
                )}
              </div>
              <span className="text-sm font-bold text-lavender font-heading">{e.value}</span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
