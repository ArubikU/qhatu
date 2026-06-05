import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  TrendingUp,
  Trophy,
  FileText,
  MessageCircle,
  Flame,
  UserPlus,
  Check,
  Zap,
  Users,
  BarChart2,
} from 'lucide-react'
import { mockRankings } from '../../data/mockData'

const trendingTopics = [
  { tag: '#ExamenFiltrado', posts: 234, faculty: 'Medicina',       hot: true  },
  { tag: '#CafeteríaUNI',   posts: 178, faculty: 'Todo el campus', hot: true  },
  { tag: '#WiFiCaído',      posts: 145, faculty: 'Ingeniería',      hot: false },
  { tag: '#ProfeCalculo3',  posts: 89,  faculty: 'Ciencias',        hot: false },
  { tag: '#TesisFinal',     posts: 67,  faculty: 'Letras',          hot: false },
]

const suggestedUsers = [
  { nickname: 'AguiaReal99',  faculty: 'Administración', seed: 'A', streakDays: 30, posts: 234 },
  { nickname: 'PumaSecreto',  faculty: 'Medicina',       seed: 'P', streakDays: 3,  posts: 312 },
  { nickname: 'VikingaDelSur',faculty: 'Ingeniería',     seed: 'V', streakDays: 7,  posts: 445 },
]

const rankingIcons = {
  chismoso:     Trophy,
  publicador:   FileText,
  comentarista: MessageCircle,
}

const rankingLabels = {
  chismoso:     'Más likes hoy',
  publicador:   'Más posts hoy',
  comentarista: 'Más comentarios',
}

export default function DesktopRightPanel() {
  const navigate = useNavigate()
  const [query, setQuery]       = useState('')
  const [followed, setFollowed] = useState<Set<string>>(new Set())

  const toggleFollow = (nickname: string) => {
    setFollowed((prev) => {
      const next = new Set(prev)
      next.has(nickname) ? next.delete(nickname) : next.add(nickname)
      return next
    })
  }

  return (
    <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 h-screen sticky top-0 border-l border-white/5 overflow-y-auto">
      {/* Search bar — sticky at top */}
      <div className="sticky top-0 bg-[#0F0D17]/90 backdrop-blur-xl px-4 pt-4 pb-3 z-10">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en Qhatu..."
            className="w-full bg-white/[0.06] border border-white/10 rounded-2xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#7B3FF2]/60 focus:bg-[#7B3FF2]/5 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col gap-0 px-4 pb-6">
        {/* Campus activity card */}
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl px-4 py-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)] animate-pulse" />
              <span className="text-white text-sm font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Tu campus ahora
              </span>
            </div>
            <span className="text-green-400 text-xs font-bold">EN VIVO</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="text-center">
              <p className="text-white font-bold text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>47</p>
              <p className="text-white/40 text-[10px]">activos</p>
            </div>
            <div className="text-center border-x border-white/5">
              <p className="text-white font-bold text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>1.2k</p>
              <p className="text-white/40 text-[10px]">posts hoy</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>8.4k</p>
              <p className="text-white/40 text-[10px]">reacciones</p>
            </div>
          </div>
        </div>

        {/* Trending topics */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1 px-1">
            <TrendingUp size={14} className="text-[#7B3FF2]" />
            <h3 className="text-white font-semibold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Tendencias del campus
            </h3>
          </div>
          <div className="flex flex-col">
            {trendingTopics.map(({ tag, posts, faculty, hot }, i) => (
              <button
                key={tag}
                className="flex items-start justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/20 text-[10px] w-3 shrink-0">{i + 1}</span>
                    <p className="text-white text-sm font-medium group-hover:text-[#C8B6FF] transition-colors truncate">
                      {tag}
                    </p>
                  </div>
                  <p className="text-white/35 text-[11px] ml-[18px]">{faculty} · {posts} posts</p>
                </div>
                {hot && (
                  <div className="flex items-center gap-1 bg-[#7B3FF2]/15 border border-[#7B3FF2]/25 rounded-full px-2 py-0.5 shrink-0 ml-2">
                    <Flame size={9} className="text-[#C8B6FF]" />
                    <span className="text-[#C8B6FF] text-[10px] font-semibold">HOT</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate('/feed?tab=trending')}
            className="text-[#7B3FF2] text-xs font-medium hover:text-[#C8B6FF] transition-colors px-3 py-1"
          >
            Ver más tendencias →
          </button>
        </div>

        <div className="border-t border-white/5 mb-4" />

        {/* Suggested users */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1 px-1">
            <Users size={14} className="text-[#7B3FF2]" />
            <h3 className="text-white font-semibold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Sugeridos para seguir
            </h3>
          </div>
          <div className="flex flex-col gap-1">
            {suggestedUsers.map(({ nickname, faculty, seed, streakDays, posts }) => {
              const isFollowed = followed.has(nickname)
              return (
                <div
                  key={nickname}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7B3FF2] to-[#4B17B6] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {seed}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-white text-sm font-semibold truncate">{nickname}</p>
                      {streakDays >= 7 && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Zap size={10} className="text-orange-400" />
                          <span className="text-orange-400 text-[10px] font-bold">{streakDays}d</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-white/40 text-[11px] truncate">{faculty}</p>
                      <span className="text-white/20 text-[10px]">·</span>
                      <div className="flex items-center gap-0.5">
                        <BarChart2 size={9} className="text-white/25" />
                        <span className="text-white/25 text-[10px]">{posts}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFollow(nickname)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                      isFollowed
                        ? 'bg-white/5 border border-white/15 text-white/50 hover:border-red-400/40 hover:text-red-400/70'
                        : 'bg-[#7B3FF2] text-white shadow-[0_0_10px_rgba(123,63,242,0.4)] hover:bg-[#6b2fe2]'
                    }`}
                  >
                    {isFollowed ? (
                      <>
                        <Check size={11} />
                        <span>Siguiendo</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={11} />
                        <span>Seguir</span>
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-white/5 mb-4" />

        {/* Daily rankings */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1 px-1">
            <Trophy size={14} className="text-yellow-400" />
            <h3 className="text-white font-semibold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Top del día
            </h3>
            <span className="ml-auto text-white/25 text-[10px]">Actualiza 23:59</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {mockRankings.map(({ type, nickname, value, label }, i) => {
              const Icon = rankingIcons[type as keyof typeof rankingIcons]
              const rankLabel = rankingLabels[type as keyof typeof rankingLabels]
              const medalColors = ['text-yellow-400', 'text-slate-300', 'text-amber-600']
              return (
                <div
                  key={type}
                  className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-3 py-2.5 hover:bg-white/[0.06] transition-colors"
                >
                  <span className={`text-lg font-black w-5 text-center shrink-0 ${medalColors[i]}`}>
                    {['🥇','🥈','🥉'][i]}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B3FF2] to-[#4B17B6] flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{nickname}</p>
                    <p className="text-white/35 text-[10px]">{rankLabel}</p>
                  </div>
                  <span className="text-[#C8B6FF] text-xs font-bold shrink-0">{value}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer links */}
        <div className="border-t border-white/5 pt-4">
          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
            {['Privacidad', 'Términos', 'Cookies', 'Accesibilidad', 'Ayuda'].map((l) => (
              <button key={l} className="text-white/20 text-[11px] hover:text-white/40 transition-colors">
                {l}
              </button>
            ))}
          </div>
          <p className="text-white/15 text-[10px]">© 2026 Qhatu · Tu mundo. Tus chismes.</p>
        </div>
      </div>
    </aside>
  )
}
