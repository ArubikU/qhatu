'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PenSquare, Loader2, RefreshCw, Search, ArrowUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useFeed, type FeedTab } from '@/hooks/useFeed'
import { useSSEFeed } from '@/hooks/useSSEFeed'
import { PostCard } from '@/components/posts/PostCard'

const ALL_TABS: { id: FeedTab; label: string; auth?: boolean }[] = [
  { id: 'for-you',   label: 'Para ti', auth: true },
  { id: 'trending',  label: 'Trending' },
  { id: 'recent',    label: 'Reciente' },
  { id: 'following', label: 'Siguiendo', auth: true },
]

export default function FeedPage() {
  const router          = useRouter()
  const accessToken     = useAuthStore((s) => s.accessToken)
  const openCompose     = useUIStore((s) => s.openCompose)
  const isAuth          = !!accessToken
  const TABS            = ALL_TABS.filter((t) => isAuth || !t.auth)  // public sees only recent/trending
  const [tab, setTab]   = useState<FeedTab>(isAuth ? 'for-you' : 'recent')
  const loaderRef = useRef<HTMLDivElement>(null)

  // Keep tab valid when auth state changes (public can't use for-you/following)
  useEffect(() => {
    if (!isAuth && (tab === 'for-you' || tab === 'following')) setTab('recent')
    if (isAuth && tab === 'recent') setTab('for-you')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth])

  // Shortcut: /feed?compose=1 opens the composer (only if logged in)
  useEffect(() => {
    if (isAuth && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('compose') === '1') {
      openCompose()
    }
  }, [openCompose, isAuth])

  const { newPostsAvailable, resetNewPosts } = useSSEFeed()

  const handleCompose = () => { if (isAuth) openCompose(); else router.push('/login') }

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useFeed(tab)

  const posts = data?.pages.flatMap((p) => p.posts) ?? []

  // Infinite scroll via IntersectionObserver
  const onLoaderIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const observer = new IntersectionObserver(onLoaderIntersect, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [onLoaderIntersect])

  return (
    <>
      <div className="min-h-screen bg-carbon">
        {/* Top bar — frosted, brand + actions + sliding-pill tabs (Twitter/Reddit) */}
        <div className="sticky top-0 z-20 bg-carbon/70 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              {/* Mobile: iso. Desktop hides brand (sidebar shows it) → page title instead */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/isotipo.png" alt="Qhatu" className="w-9 h-9 object-contain md:hidden" />
              <span className="text-[22px] font-bold font-heading bg-gradient-to-r from-white to-[#C8B6FF] bg-clip-text text-transparent md:hidden">
                Qhatu
              </span>
              <span className="hidden md:block text-[19px] font-bold text-white font-heading">Inicio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => router.push('/search')}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <Search size={17} />
              </button>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Tabs — sliding glass pill behind active */}
          <div className="flex gap-1 px-3 pb-2 overflow-x-auto scrollbar-hide">
            {TABS.map(({ id, label }) => {
              const active = tab === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium font-body whitespace-nowrap transition-colors ${active ? 'text-white' : 'text-white/45 hover:text-white/80'}`}
                >
                  {active && (
                    <motion.span
                      layoutId="tab-pill"
                      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                      className="absolute inset-0 rounded-full bg-primary/20 border border-primary/40"
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              )
            })}
          </div>

          {/* New posts pill (SSE) */}
          {newPostsAvailable && (
            <div className="flex justify-center pb-2">
              <motion.button
                initial={{ opacity: 0, y: -8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                type="button"
                onClick={() => { resetNewPosts(); refetch() }}
                className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold font-body flex items-center gap-1.5 shadow-[0_4px_20px_rgba(123,63,242,0.5)]"
              >
                <ArrowUp size={13} /> Posts nuevos
              </motion.button>
            </div>
          )}
        </div>

        {/* Public CTA — logged out */}
        {!isAuth && (
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="mx-4 mt-3 w-[calc(100%-2rem)] flex items-center justify-center gap-2 liquid-glass rounded-2xl py-3 text-sm font-body text-white/80 hover:text-white transition-colors"
          >
            <span className="text-lavender font-semibold">Inicia sesión</span> para reaccionar, comentar y publicar
          </button>
        )}

        {/* Posts list */}
        <div className="px-4 py-4 flex flex-col gap-3 pb-24">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <PenSquare size={24} className="text-primary" />
              </div>
              <p className="text-white/50 text-sm font-body">
                {tab === 'following'
                  ? 'Sigue a alguien para ver sus posts aquí'
                  : 'Sé el primero en publicar algo'}
              </p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}

          {/* Infinite scroll trigger */}
          <div ref={loaderRef} className="flex justify-center py-4">
            {isFetchingNextPage && <Loader2 size={18} className="animate-spin text-white/30" />}
          </div>
        </div>

        {/* FAB — compose (desktop; mobile uses the bottom-nav FAB) */}
        <button
          type="button"
          onClick={handleCompose}
          className="hidden md:flex fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary shadow-[0_0_30px_rgba(123,63,242,0.5)] items-center justify-center text-white hover:bg-[#6b2fe2] transition-all active:scale-95 z-30"
        >
          <PenSquare size={22} />
        </button>
      </div>
    </>
  )
}
