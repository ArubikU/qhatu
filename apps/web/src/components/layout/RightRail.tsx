'use client'
import { useRouter } from 'next/navigation'
import { Search, Hash, TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Avatar } from '@/components/common/Avatar'
import { FollowButton } from '@/components/social/FollowButton'
import { useAuthStore } from '@/store/authStore'
import { pushWithFallback } from '@/lib/nav'

/** Twitter-style right rail (lg+): search, trending hashtags, who-to-follow. */
export function RightRail() {
  const router      = useRouter()
  const accessToken = useAuthStore((s) => s.accessToken)

  const { data } = useQuery({
    queryKey: ['trends'],
    queryFn:  () => api.trends.get(),
    staleTime: 2 * 60_000,
  })

  return (
    <div className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0 sticky top-0 h-screen overflow-y-auto py-4 px-3 scrollbar-hide">
      {/* Search */}
      <button
        type="button"
        onClick={() => pushWithFallback(router, '/search')}
        className="flex items-center gap-2 w-full bg-white/5 hover:bg-white/8 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white/40 transition-colors"
      >
        <Search size={16} /> Buscar en Qhatu
      </button>

      {/* Trending hashtags */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <h3 className="flex items-center gap-2 px-4 pt-3 pb-2 text-sm font-bold text-white font-heading">
          <TrendingUp size={16} className="text-primary" /> Tendencias
        </h3>
        {(data?.hashtags ?? []).length === 0 ? (
          <p className="px-4 pb-3 text-xs text-white/30 font-body">Sin tendencias aún</p>
        ) : (
          data!.hashtags.map((h, i) => (
            <button
              key={h.tag}
              type="button"
              onClick={() => pushWithFallback(router, `/search?q=${encodeURIComponent('#' + h.tag)}`)}
              className="w-full text-left px-4 py-2 hover:bg-white/5 transition-colors flex items-center gap-2.5"
            >
              <span className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Hash size={14} className="text-primary" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm text-white font-medium font-body truncate">#{h.tag}</span>
                <span className="block text-[11px] text-white/40 font-body">{h.postCount} posts · #{i + 1}</span>
              </span>
            </button>
          ))
        )}
      </div>

      {/* Who to follow */}
      {(data?.users ?? []).length > 0 && (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <h3 className="px-4 pt-3 pb-2 text-sm font-bold text-white font-heading">A quién seguir</h3>
          {data!.users.map((u) => (
            <div key={u.nickname} className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/5 transition-colors">
              <Avatar seed={u.avatarSeed} size={36} imageUrl={u.avatarUrl} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white font-semibold font-heading truncate">{u.nickname}</p>
                <p className="text-[11px] text-white/40 font-body truncate">{u.faculty ?? u.university}</p>
              </div>
              {accessToken && <FollowButton nickname={u.nickname} />}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <p className="px-4 text-[11px] text-white/25 font-body leading-relaxed">
        Qhatu · {data?.stats.totalPosts ?? 0} posts · 100% anónimo
      </p>
    </div>
  )
}
