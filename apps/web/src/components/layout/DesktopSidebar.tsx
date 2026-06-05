'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Search, Bell, User, Sparkles, Trophy, PenSquare } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { api } from '@/lib/api'

const ITEMS = [
  { href: '/feed',          icon: Home,    label: 'Inicio' },
  { href: '/search',        icon: Search,  label: 'Buscar' },
  { href: '/notifications', icon: Bell,    label: 'Notificaciones' },
  { href: '/rewards',       icon: Sparkles,label: 'Recompensas' },
  { href: '/rankings',      icon: Trophy,  label: 'Ranking' },
  { href: '/profile',       icon: User,    label: 'Perfil' },
] as const

export function DesktopSidebar() {
  const pathname    = usePathname()
  const router      = useRouter()
  const accessToken = useAuthStore((s) => s.accessToken)
  const user        = useAuthStore((s) => s.user)

  const { data: unread } = useQuery({
    queryKey: ['unread-count', accessToken],
    queryFn:  () => api.notifications.unreadCount(accessToken ?? ''),
    enabled:  !!accessToken,
    refetchInterval: 60_000,
  })
  const unreadCount = unread?.count ?? 0

  return (
    <aside className="hidden md:flex flex-col sticky top-0 h-screen border-r border-white/5 px-2 lg:px-4 py-4 md:w-20 lg:w-64 flex-shrink-0">
      {/* Logo */}
      <Link href="/feed" className="flex items-center gap-1.5 px-1 mb-6 h-12 justify-center lg:justify-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/isotipo.png" alt="Qhatu" className="w-12 h-12 object-contain" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logotipo.png" alt="Qhatu" className="h-9 w-auto hidden lg:block -ml-1" />
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          const badge  = href === '/notifications' && unreadCount > 0
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={[
                'relative flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors font-body',
                'justify-center lg:justify-start',
                active ? 'bg-primary/15 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white',
              ].join(' ')}
            >
              <span className="relative">
                <Icon size={22} strokeWidth={active ? 2.3 : 1.8} className={active ? 'text-primary' : ''} />
                {badge && (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[9px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              <span className="hidden lg:block text-sm font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Create */}
      <button
        type="button"
        onClick={() => useUIStore.getState().openCompose()}
        className="flex items-center justify-center gap-2 bg-primary hover:bg-[#6b2fe2] text-white rounded-2xl py-3 mb-3 shadow-[0_0_20px_rgba(123,63,242,0.4)] transition-colors"
      >
        <PenSquare size={18} />
        <span className="hidden lg:block text-sm font-semibold font-heading">Crear</span>
      </button>

      {/* User mini */}
      {user && (
        <Link href="/profile" className="flex items-center gap-2 rounded-2xl px-2 py-2 hover:bg-white/5 transition-colors justify-center lg:justify-start">
          <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center text-white font-bold flex-shrink-0">
            {(user.nickname?.[0] ?? 'Q').toUpperCase()}
          </div>
          <span className="hidden lg:block text-sm text-white/70 truncate font-body">{user.nickname}</span>
        </Link>
      )}
    </aside>
  )
}
