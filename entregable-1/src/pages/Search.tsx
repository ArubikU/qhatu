import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search as SearchIcon, Hash, AtSign, X } from 'lucide-react'
import BottomNav from '../components/layout/BottomNav'
import FeedCard from '../components/feed/FeedCard'
import { mockPosts } from '../data/mockData'
import { cn } from '../lib/utils'

type SearchTab = 'posts' | 'hashtags' | 'usuarios'

const hashtagResults = [
  { tag: '#ExamenFiltrado', posts: 234, hot: true },
  { tag: '#CafeteríaUNI',   posts: 178, hot: true },
  { tag: '#WiFiCaído',      posts: 145, hot: false },
  { tag: '#ProfeCalculo3',  posts: 89,  hot: false },
  { tag: '#TesisFinal',     posts: 67,  hot: false },
  { tag: '#Apuntes',        posts: 43,  hot: false },
]

const userResults = [
  { nickname: 'AguiaReal99',   faculty: 'Administración', seed: 'A', posts: 14 },
  { nickname: 'PumaSecreto',   faculty: 'Medicina',       seed: 'P', posts: 9  },
  { nickname: 'VikingaDelSur', faculty: 'Ingeniería',     seed: 'V', posts: 7  },
  { nickname: 'LoboAndino_7',  faculty: 'Letras',         seed: 'L', posts: 5  },
]

export default function Search() {
  const [query, setQuery]     = useState('')
  const [tab, setTab]         = useState<SearchTab>('posts')
  const [followed, setFollowed] = useState<Set<string>>(new Set())

  const filteredPosts = query.length > 0
    ? mockPosts.filter((p) =>
        p.content.toLowerCase().includes(query.toLowerCase()) ||
        p.author.nickname.toLowerCase().includes(query.toLowerCase())
      )
    : mockPosts

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-28 md:pb-8"
    >
      {/* Search header */}
      <div className="sticky top-0 z-40 bg-[#0F0D17]/90 backdrop-blur-xl border-b border-white/5 px-4 pt-4 pb-3">
        <div className="relative mb-3">
          <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar posts, #hashtags, @usuarios..."
            className="w-full bg-white/[0.06] border border-white/10 rounded-2xl py-3 pl-10 pr-10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#7B3FF2]/60 focus:bg-[#7B3FF2]/5 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-white/[0.06] -mx-4 px-4">
          {(['posts', 'hashtags', 'usuarios'] as SearchTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 pb-2.5 text-xs font-medium capitalize border-b-2 transition-all -mb-[2px]',
                tab === t
                  ? 'text-white border-[#7B3FF2]'
                  : 'text-white/40 border-transparent hover:text-white/60'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3">
        {/* Posts tab */}
        {tab === 'posts' && (
          <div>
            {query === '' && (
              <p className="text-white/30 text-xs mb-3">Mostrando posts recientes</p>
            )}
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => <FeedCard key={post.id} post={post} />)
            ) : (
              <div className="flex flex-col items-center gap-2 py-12 text-white/30">
                <SearchIcon size={32} />
                <p className="text-sm">Sin resultados para "{query}"</p>
              </div>
            )}
          </div>
        )}

        {/* Hashtags tab */}
        {tab === 'hashtags' && (
          <div className="flex flex-col gap-1">
            {hashtagResults
              .filter((h) => query === '' || h.tag.toLowerCase().includes(query.toLowerCase()))
              .map(({ tag, posts }) => (
                <button
                  key={tag}
                  className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[#7B3FF2]/15 border border-[#7B3FF2]/20 flex items-center justify-center shrink-0">
                    <Hash size={16} className="text-[#C8B6FF]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{tag}</p>
                    <p className="text-white/40 text-xs">{posts} posts</p>
                  </div>
                </button>
              ))}
          </div>
        )}

        {/* Users tab */}
        {tab === 'usuarios' && (
          <div className="flex flex-col gap-1">
            {userResults
              .filter((u) => query === '' || u.nickname.toLowerCase().includes(query.toLowerCase()))
              .map(({ nickname, faculty, seed, posts }) => {
                const isFollowed = followed.has(nickname)
                return (
                  <div
                    key={nickname}
                    className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/5 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7B3FF2] to-[#4B17B6] flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {seed}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <AtSign size={12} className="text-white/30 shrink-0" />
                        <p className="text-white text-sm font-semibold truncate">{nickname}</p>
                      </div>
                      <p className="text-white/40 text-xs">{faculty} · {posts} posts hoy</p>
                    </div>
                    <button
                      onClick={() => setFollowed((prev) => {
                        const next = new Set(prev)
                        next.has(nickname) ? next.delete(nickname) : next.add(nickname)
                        return next
                      })}
                      className={cn(
                        'px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0',
                        isFollowed
                          ? 'bg-white/5 border border-white/15 text-white/50'
                          : 'bg-[#7B3FF2] text-white shadow-[0_0_10px_rgba(123,63,242,0.3)]'
                      )}
                    >
                      {isFollowed ? 'Siguiendo' : 'Seguir'}
                    </button>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      <BottomNav />
    </motion.div>
  )
}
