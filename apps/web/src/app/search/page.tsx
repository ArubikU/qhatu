'use client'
import { useEffect, useState } from 'react'
import { Search, X, Loader2, Hash, ImageIcon, Heart, MessageCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useEmbedder } from '@/hooks/useEmbedder'
import { api } from '@/lib/api'
import { Avatar } from '@/components/common/Avatar'
import { FollowButton } from '@/components/social/FollowButton'
import { formatDistanceToNow } from '@/lib/timeFormat'

type Scope = 'all' | 'posts' | 'users' | 'hashtags'
const TABS: { id: Scope; label: string }[] = [
  { id: 'all',      label: 'Todo' },
  { id: 'posts',    label: 'Posts' },
  { id: 'users',    label: 'Usuarios' },
  { id: 'hashtags', label: 'Hashtags' },
]

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export default function SearchPage() {
  const accessToken     = useAuthStore((s) => s.accessToken)
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<Scope>('all')
  const debounced = useDebounced(query.trim(), 350)
  const embedder  = useEmbedder()

  // Public — no login required. Preload the embedding model.
  useEffect(() => { embedder.warmup() }, [embedder])

  // Phase 1 — fast text/author/hashtag search (no embedding, indexed → instant)
  const { data, isFetching } = useQuery({
    queryKey: ['search', debounced, scope],
    queryFn:  () => api.search.query(debounced, scope, accessToken ?? undefined),
    enabled:  debounced.length >= 2,
    staleTime: 30_000,
  })

  // Phase 2 — semantic vector search in the background; embeds query on-device,
  // then merges into the post list (no separate UI label)
  const wantSemantic = scope === 'all' || scope === 'posts'
  const { data: semData } = useQuery({
    queryKey: ['search-sem', debounced, scope],
    queryFn:  async () => {
      const embedding = await embedder.embed(debounced, 6000)
      if (!embedding) return { semantic: [] }
      const r = await api.search.query(debounced, scope, accessToken ?? undefined, embedding)
      return { semantic: r.semantic }
    },
    enabled:  debounced.length >= 2 && wantSemantic,
    staleTime: 30_000,
  })

  // Merge: text posts first, then semantic-only (dedup), into one scroller
  const textPosts = data?.posts ?? []
  const textIds   = new Set(textPosts.map((p) => p.id))
  const mergedPosts = [...textPosts, ...((semData?.semantic ?? []).filter((p) => !textIds.has(p.id)))]

  const hasResults = data && (mergedPosts.length || data.users.length || data.hashtags.length)

  return (
    <div className="min-h-screen bg-carbon pb-24">
      <div className="sticky top-0 bg-carbon/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 z-20">
        <h1 className="text-xl font-bold text-white font-heading mb-3">Buscar</h1>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Posts, hashtags o usuarios…"
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-9 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors font-body"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setScope(id)}
              className={`px-3 py-1.5 rounded-full text-xs font-body transition-colors ${
                scope === id ? 'bg-primary text-white' : 'bg-white/5 text-white/50 hover:text-white/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {debounced.length < 2 ? (
          <Empty text="Escribe al menos 2 caracteres" />
        ) : isFetching ? (
          <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-primary" /></div>
        ) : !hasResults ? (
          <Empty text={`Sin resultados para "${debounced}"`} />
        ) : (
          <>
            {/* Users */}
            {data!.users.length > 0 && (
              <Section title="Usuarios">
                {data!.users.map((u) => (
                  <div key={u.nickname} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <Avatar seed={u.avatarSeed} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white font-heading truncate">{u.nickname}</p>
                      {u.faculty && <p className="text-xs text-white/40 font-body">{u.faculty}</p>}
                    </div>
                    {accessToken && <FollowButton nickname={u.nickname} />}
                  </div>
                ))}
              </Section>
            )}

            {/* Hashtags */}
            {data!.hashtags.length > 0 && (
              <Section title="Hashtags">
                {data!.hashtags.map((h) => (
                  <div key={h.tag} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center"><Hash size={16} className="text-primary" /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white font-heading">#{h.tag}</p>
                      <p className="text-xs text-white/40 font-body">{h.postCount} posts</p>
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {/* Posts — text results first, semantic merged in afterward (no label) */}
            {mergedPosts.length > 0 && (
              <Section title="Posts">
                {mergedPosts.map((p) => (
                  <div key={p.id} className="glass rounded-2xl p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Avatar seed={p.authorAvatarSeed} size={26} />
                      <span className="text-xs font-semibold text-white font-heading">{p.authorNickname}</span>
                      <span className="text-xs text-white/30 font-body">{formatDistanceToNow(p.createdAt)}</span>
                    </div>
                    <p className="text-sm text-white/80 font-body line-clamp-3 break-words">{p.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-white/40 font-body">
                      <span className="flex items-center gap-1"><Heart size={12} /> {p.likesCount}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={12} /> {p.commentsCount}</span>
                      {p.hasMedia && <span className="flex items-center gap-1"><ImageIcon size={12} /> media</span>}
                    </div>
                  </div>
                ))}
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 font-body">{title}</h3>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Search size={24} className="text-primary" />
      </div>
      <p className="text-white/50 text-sm font-body">{text}</p>
    </div>
  )
}
