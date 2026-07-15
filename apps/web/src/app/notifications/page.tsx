'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, BellRing, Heart, MessageCircle, UserPlus, CheckCheck, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { api } from '@/lib/api'
import { replaceWithFallback } from '@/lib/nav'
import { formatDistanceToNow } from '@/lib/timeFormat'

const ICONS: Record<string, React.ElementType> = {
  REACTION:     Heart,
  COMMENT:      MessageCircle,
  NEW_FOLLOWER: UserPlus,
  TRENDING:     BellRing,
  RANKING:      BellRing,
  STREAK_MILESTONE: BellRing,
}

const LABELS: Record<string, string> = {
  REACTION:     'reaccionó a tu post',
  COMMENT:      'comentó tu post',
  NEW_FOLLOWER: 'empezó a seguirte',
  TRENDING:     'Tu post está en tendencia',
  RANKING:      'Apareciste en el ranking',
  STREAK_MILESTONE: 'Alcanzaste una racha',
}

export default function NotificationsPage() {
  const router          = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const accessToken     = useAuthStore((s) => s.accessToken)
  const qc              = useQueryClient()
  const push            = usePushNotifications()

  useEffect(() => {
    if (!isAuthenticated()) replaceWithFallback(router, '/login')
  }, [isAuthenticated, router])

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', accessToken],
    queryFn:  () => api.notifications.list(accessToken ?? ''),
    enabled:  !!accessToken,
  })

  const markAll = useMutation({
    mutationFn: () => api.notifications.markAllRead(accessToken ?? ''),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const items = data?.notifications ?? []

  return (
    <div className="min-h-screen bg-carbon pb-24">
      <div className="sticky top-0 bg-carbon/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 z-20 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white font-heading">
          Notificaciones
          {data && data.unreadCount > 0 && (
            <span className="ml-2 text-xs bg-primary text-white rounded-full px-2 py-0.5 align-middle">{data.unreadCount}</span>
          )}
        </h1>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => markAll.mutate()}
            className="flex items-center gap-1 text-xs text-lavender hover:text-white transition-colors font-body"
          >
            <CheckCheck size={14} /> Marcar todo
          </button>
        )}
      </div>

      {/* Push enable banner */}
      {push.supported && push.status !== 'subscribed' && push.status !== 'denied' && (
        <div className="mx-4 mt-3 glass rounded-2xl p-3 border border-primary/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <BellRing size={18} className="text-primary flex-shrink-0" />
            <span className="text-xs text-white/70 font-body">Activa notificaciones push</span>
          </div>
          <button
            type="button"
            onClick={push.subscribe}
            disabled={push.busy}
            className="text-xs bg-primary text-white px-3 py-1.5 rounded-full font-body whitespace-nowrap disabled:opacity-50"
          >
            {push.busy ? 'Activando…' : 'Activar'}
          </button>
        </div>
      )}
      {push.status === 'denied' && (
        <p className="mx-4 mt-3 text-xs text-white/40 font-body">
          Notificaciones bloqueadas en el navegador. Actívalas desde la configuración del sitio.
        </p>
      )}

      {/* List */}
      <div className="px-4 py-3 flex flex-col gap-2">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bell size={24} className="text-primary" />
            </div>
            <p className="text-white/50 text-sm font-body">Sin notificaciones todavía</p>
          </div>
        ) : (
          items.map((n) => {
            const Icon = ICONS[n.type] ?? Bell
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
                  n.read ? 'bg-white/[0.02] border-white/5' : 'bg-primary/5 border-primary/20'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${n.read ? 'bg-white/5' : 'bg-primary/20'}`}>
                  <Icon size={16} className={n.read ? 'text-white/40' : 'text-primary'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 font-body">Alguien {LABELS[n.type] ?? 'interactuó contigo'}</p>
                  <span className="text-xs text-white/30 font-body">{formatDistanceToNow(n.createdAt)}</span>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
