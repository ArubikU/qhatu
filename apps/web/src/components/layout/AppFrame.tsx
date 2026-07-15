'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/store/uiStore'
import { DesktopSidebar } from '@/components/layout/DesktopSidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { RightRail } from '@/components/layout/RightRail'
import { GlobalComposer } from '@/components/layout/GlobalComposer'
import { ConfirmHost } from '@/components/ui/ConfirmHost'
import { NavFlush } from '@/components/layout/NavFlush'

// Routes that render bare (own full-screen layout: landing + auth flows)
const BARE = ['/', '/login', '/register', '/verify', '/qr', '/account', '/recover']

function isBare(path: string): boolean {
  return BARE.some((p) => (p === '/' ? path === '/' : path.startsWith(p)))
}

/**
 * App chrome: desktop sidebar + centered content column on md+, bottom nav on
 * mobile. Auth/landing routes render bare (they own their full-screen layout).
 */
export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // ─── Cura del stall de navegación del App Router ───────────────────────────
  // La URL/pathname actualiza en cada nav pero el swap del segmento corre en una
  // transición concurrente que no commitea sola. Al cambiar el pathname disparamos
  // un update síncrono (bumpNav → re-render de <NavFlush/>) que fuerza a React a
  // flushear esa transición pendiente. Cubre TODA navegación (Link, router.push,
  // back/forward) desde un único lugar.
  useEffect(() => {
    const t = setTimeout(() => useUIStore.getState().bumpNav(), 0)
    return () => clearTimeout(t)
  }, [pathname])

  if (isBare(pathname)) return <><NavFlush />{children}</>

  return (
    <>
      <div className="md:flex md:justify-center md:mx-auto md:max-w-[1100px]">
        <DesktopSidebar />
        <main className="flex-1 min-w-0 md:border-r md:border-white/5 md:max-w-[640px] pb-24 md:pb-0">
          {children}
        </main>
        {/* Right rail — trending + who to follow (lg+) */}
        <RightRail />
      </div>
      <BottomNav />
      {/* Global UI hosts */}
      <NavFlush />
      <GlobalComposer />
      <ConfirmHost />
    </>
  )
}
