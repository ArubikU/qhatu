import type { useRouter } from 'next/navigation'

type AppRouter = ReturnType<typeof useRouter>

/**
 * Navegación con fallback duro.
 *
 * En prod (Vercel) hay un bug donde router.push inicia una transición de React
 * que nunca commitea (la URL ni cambia) hasta que otro setState síncrono la
 * descarga — p.ej. abrir/cerrar el composer. Mientras se caza la causa raíz,
 * esto intenta la navegación SPA y, si en 500ms la URL no cambió, cae a una
 * navegación completa del browser (location.assign), que no depende de React.
 */
export function pushWithFallback(router: AppRouter, href: string): void {
  if (typeof window === 'undefined') return
  const target = href.split('?')[0]
  const before = window.location.pathname
  if (before === target) return // ya estamos ahí

  try { router.push(href) } catch { window.location.assign(href); return }

  window.setTimeout(() => {
    // Si la transición commiteó, pathname ya cambió y no hacemos nada.
    if (window.location.pathname === before) window.location.assign(href)
  }, 500)
}
