'use client'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Search, Bell, User, Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { api } from '@/lib/api'

const ITEMS = [
  { href: '/feed',          icon: Home,   label: 'Inicio' },
  { href: '/search',        icon: Search, label: 'Buscar' },
  { href: '/notifications', icon: Bell,   label: 'Notifs' },
  { href: '/profile',       icon: User,   label: 'Perfil' },
] as const

export function BottomNav() {
  const pathname    = usePathname()
  const router      = useRouter()
  const accessToken = useAuthStore((s) => s.accessToken)
  const openCompose = useUIStore((s) => s.openCompose)

  const { data: unread } = useQuery({
    queryKey: ['unread-count', accessToken],
    queryFn:  () => api.notifications.unreadCount(accessToken ?? ''),
    enabled:  !!accessToken,
    refetchInterval: 60_000,
  })
  const unreadCount = unread?.count ?? 0

  if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/verify')) {
    return null
  }

  // First two items, FAB, last two
  const left  = ITEMS.slice(0, 2)
  const right = ITEMS.slice(2)

  const item = (href: string, Icon: typeof Home, badge: boolean) => {
    const active = pathname === href || pathname.startsWith(href + '/')
    return (
      <button
        key={href}
        type="button"
        onClick={() => router.push(href)}
        className="relative flex items-center justify-center w-12 h-12 rounded-2xl transition-colors"
      >
        <span className="relative">
          <Icon size={23} strokeWidth={active ? 2.4 : 1.9} className={active ? 'text-primary' : 'text-white/45'} />
          {badge && unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[9px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </span>
        {active && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />}
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[460px] z-50 px-4 pb-4 md:hidden">
      <nav className="liquid-glass rounded-[28px] px-3 py-2 flex items-center justify-between">
        {left.map((i) => item(i.href, i.icon, false))}

        {/* Center FAB — Crear */}
        <button
          type="button"
          onClick={() => { if (accessToken) openCompose(); else router.push('/login') }}
          className="w-14 h-14 -mt-6 rounded-full bg-gradient-to-br from-[#7B3FF2] to-[#4B17B6] flex items-center justify-center shadow-[0_0_25px_rgba(123,63,242,0.6)] border-2 border-[#0F0D17] active:scale-95 transition-transform"
        >
          <Plus size={26} className="text-white" />
        </button>

        {right.map((i) => item(i.href, i.icon, i.href === '/notifications'))}
      </nav>
    </div>
  )
}
