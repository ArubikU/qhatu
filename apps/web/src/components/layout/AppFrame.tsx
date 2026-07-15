'use client'
import { usePathname } from 'next/navigation'
import { DesktopSidebar } from '@/components/layout/DesktopSidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { RightRail } from '@/components/layout/RightRail'
import { GlobalComposer } from '@/components/layout/GlobalComposer'
import { ConfirmHost } from '@/components/ui/ConfirmHost'

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

  if (isBare(pathname)) return <>{children}</>

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
      <GlobalComposer />
      <ConfirmHost />
    </>
  )
}
