import type { useRouter } from 'next/navigation'

type AppRouter = ReturnType<typeof useRouter>

/**
 * Navegación SPA.
 *
 * El flush de la transición atascada del App Router lo hace UN solo lugar: el
 * useEffect global en AppFrame (bumpNav al cambiar el pathname). Acá solo hacemos
 * el push normal + una red de seguridad tardía (hard-nav) por si algo raro pasa.
 * Antes bumpeábamos varias veces acá y se veía un flicker de re-renders — ya no.
 */
export function pushWithFallback(router: AppRouter, href: string): void {
  if (typeof window === 'undefined') return
  const current = window.location.pathname + window.location.search
  if (current === href) return

  try { router.push(href) } catch { window.location.assign(href); return }

  // Red de seguridad: si a los 1.5s la URL no cambió (transición nunca commiteó
  // ni el flush global la descargó), recarga dura. No debería dispararse.
  window.setTimeout(() => {
    if ((window.location.pathname + window.location.search) === current) window.location.assign(href)
  }, 1500)
}
